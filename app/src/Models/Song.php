<?php

declare(strict_types=1);

namespace App\Models;

use App\Database;

class Song
{
    public static function all(): array
    {
        return Database::query('SELECT * FROM songs ORDER BY title ASC')->fetchAll();
    }

    public static function featured(int $limit = 6): array
    {
        return Database::query(
            'SELECT * FROM songs WHERE featured = 1 ORDER BY created_at DESC LIMIT ' . $limit
        )->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $song = Database::query('SELECT * FROM songs WHERE id = ?', [$id])->fetch();
        if (!$song) {
            return null;
        }
        return self::hydrate($song);
    }

    public static function findBySlug(string $slug): ?array
    {
        $song = Database::query('SELECT * FROM songs WHERE slug = ?', [$slug])->fetch();
        if (!$song) {
            return null;
        }
        return self::hydrate($song);
    }

    public static function search(string $query = '', array $filters = []): array
    {
        $sql    = 'SELECT DISTINCT s.* FROM songs s';
        $params = [];

        if (!empty($filters['tag'])) {
            $sql .= ' JOIN song_tags st ON s.id = st.song_id JOIN tags t ON st.tag_id = t.id';
        }

        $conditions = [];

        if ($query) {
            $conditions[] = '(s.title LIKE ? OR s.lyrics LIKE ?)';
            $params[]     = "%{$query}%";
            $params[]     = "%{$query}%";
        }
        if (!empty($filters['key'])) {
            $conditions[] = 's.song_key = ?';
            $params[]     = $filters['key'];
        }
        if (!empty($filters['tag'])) {
            $conditions[] = 't.slug = ?';
            $params[]     = $filters['tag'];
        }

        if ($conditions) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY s.title ASC';

        $songs = Database::query($sql, $params)->fetchAll();

        foreach ($songs as &$song) {
            $song['tags']        = self::getTagsForSong($song['id']);
            $song['ccli_number'] = self::ccliNumber($song);
        }

        return $songs;
    }

    public static function ccliNumberFromUrl(?string $url): ?string
    {
        if ($url && preg_match('#/songs/(\d+)#', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public static function ccliNumber(array $song): ?string
    {
        return $song['ccli_number_override'] ?: self::ccliNumberFromUrl($song['ccli_url'] ?? null);
    }

    public static function allKeys(): array
    {
        return Database::query(
            "SELECT DISTINCT song_key FROM songs WHERE song_key IS NOT NULL AND song_key != '' ORDER BY song_key"
        )->fetchAll(\PDO::FETCH_COLUMN, 0);
    }

    public static function allTags(): array
    {
        return Database::query('SELECT * FROM tags ORDER BY name ASC')->fetchAll();
    }

    public static function stats(): array
    {
        return [
            'total_songs' => (int) Database::query('SELECT COUNT(*) FROM songs')->fetchColumn(),
            'total_tags'  => (int) Database::query('SELECT COUNT(*) FROM tags')->fetchColumn(),
            'total_files' => (int) Database::query('SELECT COUNT(*) FROM song_files')->fetchColumn(),
        ];
    }

    public static function create(array $data): int
    {
        Database::query(
            'INSERT INTO songs (title, slug, song_key, tempo, ccli_url, ccli_number_override, lyrics, copyright_info, notes, featured)
             VALUES (:title, :slug, :song_key, :tempo, :ccli_url, :ccli_number_override, :lyrics, :copyright_info, :notes, :featured)',
            $data
        );
        return Database::lastInsertId();
    }

    public static function update(int $id, array $data): void
    {
        $data['updated_at'] = date('Y-m-d H:i:s');
        $data['id']         = $id;

        Database::query(
            'UPDATE songs
             SET title=:title, song_key=:song_key, tempo=:tempo, ccli_url=:ccli_url, ccli_number_override=:ccli_number_override,
                 lyrics=:lyrics, copyright_info=:copyright_info, notes=:notes, featured=:featured, updated_at=:updated_at
             WHERE id=:id',
            $data
        );
    }

    public static function delete(int $id): void
    {
        // Clean up uploaded files from disk
        $uploadDir = dirname(__DIR__, 3) . '/public_html/uploads/songs/' . $id . '/';
        if (is_dir($uploadDir)) {
            foreach (glob($uploadDir . '*') as $file) {
                unlink($file);
            }
            rmdir($uploadDir);
        }

        Database::query('DELETE FROM songs WHERE id = ?', [$id]);
    }

    public static function syncTags(int $songId, array $tagNames): void
    {
        Database::query('DELETE FROM song_tags WHERE song_id = ?', [$songId]);

        foreach ($tagNames as $name) {
            if (!$name) {
                continue;
            }
            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));

            Database::query(
                'INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)',
                [$name, $slug]
            );
            $tag = Database::query('SELECT id FROM tags WHERE slug = ?', [$slug])->fetch();
            if ($tag) {
                Database::query(
                    'INSERT IGNORE INTO song_tags (song_id, tag_id) VALUES (?, ?)',
                    [$songId, $tag['id']]
                );
            }
        }
    }

    public static function addFile(int $songId, array $data): void
    {
        Database::query(
            'INSERT INTO song_files (song_id, type, label, filename) VALUES (?, ?, ?, ?)',
            [$songId, $data['type'], $data['label'], $data['filename']]
        );
    }

    public static function deleteFile(int $fileId): void
    {
        $file = Database::query('SELECT * FROM song_files WHERE id = ?', [$fileId])->fetch();
        if ($file) {
            $path = dirname(__DIR__, 3) . '/public_html/uploads/songs/' . $file['song_id'] . '/' . $file['filename'];
            if (file_exists($path)) {
                unlink($path);
            }
            Database::query('DELETE FROM song_files WHERE id = ?', [$fileId]);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private static function hydrate(array $song): array
    {
        $song['tags']        = self::getTagsForSong($song['id']);
        $song['files']       = self::getFilesForSong($song['id']);
        $song['ccli_number'] = self::ccliNumber($song);
        return $song;
    }

    private static function getTagsForSong(int $songId): array
    {
        return Database::query(
            'SELECT t.* FROM tags t JOIN song_tags st ON t.id = st.tag_id WHERE st.song_id = ? ORDER BY t.name',
            [$songId]
        )->fetchAll();
    }

    private static function getFilesForSong(int $songId): array
    {
        return Database::query(
            'SELECT * FROM song_files WHERE song_id = ? ORDER BY type, label',
            [$songId]
        )->fetchAll();
    }
}
