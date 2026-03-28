<?php

declare(strict_types=1);

namespace App\Models;

use App\Database;

class Settings
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $row = Database::query('SELECT value FROM settings WHERE key = ?', [$key])->fetch();
        return $row !== false ? $row['value'] : $default;
    }

    public static function set(string $key, mixed $value): void
    {
        Database::query(
            'INSERT INTO settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value',
            [$key, $value]
        );
    }

    public static function all(): array
    {
        $rows = Database::query('SELECT key, value FROM settings')->fetchAll();
        return array_column($rows, 'value', 'key');
    }
}
