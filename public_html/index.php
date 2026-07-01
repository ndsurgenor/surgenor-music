<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/vendor/autoload.php';

// Load environment variables (safeLoad won't throw if .env is missing)
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

use App\Database;
use App\Router;
use App\Controllers\HomeController;
use App\Controllers\SongController;
use App\Controllers\ContactController;
use App\Controllers\MediaController;
use App\Controllers\AdminController;

// Run database migrations on first boot (creates tables if they don't exist yet)
$schemaPath = dirname(__DIR__) . '/app/database/schema.sql';
$db         = Database::getInstance();
$tableExists = $db->query("SHOW TABLES LIKE 'songs'")->fetch();

if (!$tableExists && file_exists($schemaPath)) {
    foreach (array_filter(array_map('trim', explode(';', file_get_contents($schemaPath)))) as $statement) {
        $db->exec($statement);
    }
}

session_start();

$router = new Router();

// -------------------------------------------------------------------------
// Public routes
// -------------------------------------------------------------------------
$router->get('/', [HomeController::class, 'index']);

$router->get('/songs', [SongController::class, 'index']);
$router->get('/songs/{slug}', [SongController::class, 'show']);

$router->get('/contact', [ContactController::class, 'index']);

$router->get('/media', [MediaController::class, 'index']);
$router->post('/contact', [ContactController::class, 'submit']);

// -------------------------------------------------------------------------
// Admin routes — specific paths must be registered before parameterised ones
// -------------------------------------------------------------------------
$router->get('/admin/login', [AdminController::class, 'login']);
$router->post('/admin/login', [AdminController::class, 'authenticate']);
$router->get('/admin/logout', [AdminController::class, 'logout']);

$router->get('/admin', [AdminController::class, 'dashboard']);

$router->get('/admin/songs', [AdminController::class, 'songs']);
$router->get('/admin/songs/create', [AdminController::class, 'createSong']);
$router->post('/admin/songs/create', [AdminController::class, 'storeSong']);
$router->get('/admin/songs/{id}/edit', [AdminController::class, 'editSong']);
$router->post('/admin/songs/{id}/edit', [AdminController::class, 'updateSong']);
$router->post('/admin/songs/{id}/delete', [AdminController::class, 'deleteSong']);

$router->post('/admin/files/{file_id}/delete', [AdminController::class, 'deleteFile']);


$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
