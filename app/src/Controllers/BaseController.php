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

        $this->twig->addGlobal('app_url', rtrim($_ENV['APP_URL'] ?? '', '/'));
        $this->twig->addGlobal('current_year', date('Y'));
        $this->twig->addGlobal('current_path', parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));

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
        $token = $_POST['_csrf'] ?? '';
        if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            http_response_code(403);
            exit('Invalid request token.');
        }
    }
}
