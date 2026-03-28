#!/usr/bin/env php
<?php
/**
 * Generate a bcrypt password hash for the admin panel.
 * Run from the project root: php app/generate-password.php
 */

echo 'Enter admin password: ';
$password = trim(fgets(STDIN));

if (!$password) {
    echo "No password entered.\n";
    exit(1);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
echo "\nAdd this to your .env file:\n";
echo "ADMIN_PASSWORD_HASH={$hash}\n";
