<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Song;
use App\Models\Settings;

class AdminController extends BaseController
{
    // -------------------------------------------------------------------------
    // Auth
    // -------------------------------------------------------------------------

    public function login(array $params = []): void
    {
        if ($this->isAuthenticated()) {
            $this->redirect('/admin');
        }
        $this->render('admin/login.twig', ['error' => null]);
    }

    public function authenticate(array $params = []): void
    {
        $password = $_POST['password'] ?? '';
        $hash     = $_ENV['ADMIN_PASSWORD_HASH'] ?? '';

        if ($hash && password_verify($password, $hash)) {
            $_SESSION['admin_authenticated'] = true;
            $this->redirect('/admin');
        }

        $this->render('admin/login.twig', ['error' => 'Invalid password.']);
    }

    public function logout(array $params = []): void
    {
        $_SESSION = [];
        session_destroy();
        $this->redirect('/admin/login');
    }

    // -------------------------------------------------------------------------
    // Dashboard
    // -------------------------------------------------------------------------

    public function dashboard(array $params = []): void
    {
        $this->requireAuth();
        $this->render('admin/dashboard.twig', ['stats' => Song::stats()]);
    }

    // -------------------------------------------------------------------------
    // Songs
    // -------------------------------------------------------------------------

    public function songs(array $params = []): void
    {
        $this->requireAuth();
        $this->render('admin/songs/index.twig', ['songs' => Song::all()]);
    }

    public function createSong(array $params = []): void
    {
        $this->requireAuth();
        $this->render('admin/songs/form.twig', [
            'song'  => null,
            'tags'  => Song::allTags(),
            'error' => null,
        ]);
    }

    public function storeSong(array $params = []): void
    {
        $this->requireAuth();
        $this->validateCsrf();

        $data = $this->songDataFromPost();

        if (!$data['title']) {
            $this->render('admin/songs/form.twig', [
                'song'  => $data,
                'tags'  => Song::allTags(),
                'error' => 'Title is required.',
            ]);
            return;
        }

        $songId = Song::create($data);
        Song::syncTags($songId, $this->tagsFromPost());
        $this->handleFileUploads($songId);

        $this->flash('success', "\"{$data['title']}\" has been created.");
        $this->redirect('/admin/songs');
    }

    public function editSong(array $params = []): void
    {
        $this->requireAuth();
        $song = Song::find((int) $params['id']);

        if (!$song) {
            $this->redirect('/admin/songs');
        }

        $this->render('admin/songs/form.twig', [
            'song'  => $song,
            'tags'  => Song::allTags(),
            'error' => null,
        ]);
    }

    public function updateSong(array $params = []): void
    {
        $this->requireAuth();
        $this->validateCsrf();

        $id   = (int) $params['id'];
        $data = $this->songDataFromPost(includeSlug: false);

        Song::update($id, $data);
        Song::syncTags($id, $this->tagsFromPost());
        $this->handleFileUploads($id);

        $this->flash('success', "\"{$data['title']}\" has been updated.");
        $this->redirect('/admin/songs');
    }

    public function deleteSong(array $params = []): void
    {
        $this->requireAuth();
        $this->validateCsrf();

        $id   = (int) $params['id'];
        $song = Song::find($id);
        Song::delete($id);

        $title = $song['title'] ?? 'Song';
        $this->flash('success', "\"{$title}\" has been deleted.");
        $this->redirect('/admin/songs');
    }

    public function deleteFile(array $params = []): void
    {
        $this->requireAuth();
        $this->validateCsrf();

        Song::deleteFile((int) $params['file_id']);
        $this->redirect($_SERVER['HTTP_REFERER'] ?? '/admin/songs');
    }

    // -------------------------------------------------------------------------
    // Homepage settings
    // -------------------------------------------------------------------------

    public function settings(array $params = []): void
    {
        $this->requireAuth();
        $this->render('admin/settings.twig', ['settings' => Settings::all()]);
    }

    public function updateSettings(array $params = []): void
    {
        $this->requireAuth();
        $this->validateCsrf();

        // Hero text — normalise formatting tags to Tailwind span classes
        $heroText = trim($_POST['hero_text'] ?? '');
        $heroText = $this->normalisHeroText($heroText);
        Settings::set('hero_text', $heroText);

        // Hero image — only replace if a new file was uploaded
        if (!empty($_FILES['hero_image']['tmp_name']) && $_FILES['hero_image']['error'] === UPLOAD_ERR_OK) {
            $imageDir = dirname(__DIR__, 3) . '/public_html/assets/images/';

            if (!is_dir($imageDir)) {
                mkdir($imageDir, 0755, true);
            }

            $ext      = strtolower(pathinfo($_FILES['hero_image']['name'], PATHINFO_EXTENSION));
            $allowed  = ['jpg', 'jpeg', 'png', 'webp'];

            if (in_array($ext, $allowed, true)) {
                // Remove old hero image if present
                $current = Settings::get('hero_image');
                if ($current && file_exists($imageDir . $current)) {
                    unlink($imageDir . $current);
                }

                $filename = 'hero.' . $ext;
                move_uploaded_file($_FILES['hero_image']['tmp_name'], $imageDir . $filename);
                Settings::set('hero_image', $filename);
            }
        }

        $this->flash('success', 'Homepage settings saved.');
        $this->redirect('/admin/settings');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function requireAuth(): void
    {
        if (!$this->isAuthenticated()) {
            $this->redirect('/admin/login');
        }
    }

    private function isAuthenticated(): bool
    {
        return isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;
    }

    private function songDataFromPost(bool $includeSlug = true): array
    {
        $title = trim($_POST['title'] ?? '');
        $data  = [
            'title'          => $title,
            'song_key'       => trim($_POST['song_key'] ?? ''),
            'tempo'          => (int) ($_POST['tempo'] ?? 0) ?: null,
            'lyrics'         => trim($_POST['lyrics'] ?? ''),
            'copyright_info' => trim($_POST['copyright_info'] ?? ''),
            'notes'          => trim($_POST['notes'] ?? ''),
            'featured'       => isset($_POST['featured']) ? 1 : 0,
        ];

        if ($includeSlug) {
            $data['slug'] = $this->slugify($title);
        }

        return $data;
    }

    private function tagsFromPost(): array
    {
        return array_filter(array_map('trim', explode(',', $_POST['tags'] ?? '')));
    }

    private function handleFileUploads(int $songId): void
    {
        $uploadDir = dirname(__DIR__, 3) . '/public_html/uploads/songs/' . $songId . '/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        foreach (['sheet_music', 'audio'] as $type) {
            if (empty($_FILES[$type]['name'][0])) {
                continue;
            }

            foreach ($_FILES[$type]['tmp_name'] as $i => $tmpName) {
                if ($_FILES[$type]['error'][$i] !== UPLOAD_ERR_OK) {
                    continue;
                }

                $originalName = $_FILES[$type]['name'][$i];
                $safeName     = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
                $label        = trim($_POST[$type . '_labels'][$i] ?? '') ?: pathinfo($safeName, PATHINFO_FILENAME);

                if (move_uploaded_file($tmpName, $uploadDir . $safeName)) {
                    Song::addFile($songId, [
                        'type'     => $type,
                        'label'    => $label,
                        'filename' => $safeName,
                    ]);
                }
            }
        }
    }

    private function normalisHeroText(string $html): string
    {
        $html = preg_replace('/<(b|strong)(\s[^>]*)?>/', '<span class="font-semibold">', $html);
        $html = preg_replace('/<\/(b|strong)>/', '</span>', $html);
        $html = preg_replace('/<(em|i)(\s[^>]*)?>/', '<span class="italic">', $html);
        $html = preg_replace('/<\/(em|i)>/', '</span>', $html);
        $html = preg_replace('/<u(\s[^>]*)?>/', '<span class="underline">', $html);
        $html = preg_replace('/<\/u>/', '</span>', $html);
        return $html;
    }

    private function slugify(string $text): string
    {
        $slug = mb_strtolower(trim($text));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/\s+/', '-', $slug);
        return trim($slug, '-');
    }
}
