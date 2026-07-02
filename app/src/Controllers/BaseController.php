<?php

declare(strict_types=1);

namespace App\Controllers;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

abstract class BaseController
{
    protected Environment $twig;

    public function __construct()
    {
        $loader = new FilesystemLoader(dirname(__DIR__, 2) . '/templates');

        $this->twig = new Environment($loader, [
            'cache' => false,
            'debug' => ($_ENV['APP_ENV'] ?? 'production') === 'development',
        ]);

        $currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $navLinks    = [
            ['path' => '/', 'label' => 'Home'],
            ['path' => '/songs', 'label' => 'Music', 'page_heading' => 'Song Catalogue'],
            ['path' => '/media', 'label' => 'Media', 'page_heading' => 'Watch & Listen'],
            ['path' => '/contact', 'label' => 'Contact', 'page_heading' => 'Get in Touch'],
        ];

        $currentNavLink = null;
        foreach ($navLinks as $item) {
            if ($item['path'] === $currentPath || ($item['path'] !== '/' && str_starts_with($currentPath, $item['path']))) {
                $currentNavLink = $item;
                break;
            }
        }

        $this->twig->addGlobal('app_url', rtrim($_ENV['APP_URL'] ?? '', '/'));
        $this->twig->addGlobal('current_year', date('Y'));
        $this->twig->addGlobal('current_path', $currentPath);
        $this->twig->addGlobal('nav_links', $navLinks);
        $this->twig->addGlobal('page_heading', $currentNavLink['page_heading'] ?? $currentNavLink['label'] ?? null);

        if (session_status() === PHP_SESSION_ACTIVE) {
            if (!isset($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }
            $this->twig->addGlobal('csrf_token', $_SESSION['csrf_token']);
            $this->twig->addGlobal('flash', $_SESSION['flash'] ?? null);
            unset($_SESSION['flash']);
        }
    }

    protected function render(string $template, array $data = []): void
    {
        echo $this->twig->render($template, $data);
    }

    protected function redirect(string $url): never
    {
        header('Location: ' . $url);
        exit;
    }

    protected function flash(string $type, string $message): void
    {
        $_SESSION['flash'] = ['type' => $type, 'message' => $message];
    }

    protected function validateCsrf(): void
    {
        if (empty($_POST) && empty($_FILES) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
            http_response_code(413);
            exit('Upload too large: the selected files exceed the server\'s upload limit. Try uploading fewer or smaller files at once.');
        }

        $token = $_POST['_csrf'] ?? '';
        if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            http_response_code(403);
            exit('Invalid request token.');
        }
    }
}
