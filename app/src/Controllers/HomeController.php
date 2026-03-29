<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Song;

class HomeController extends BaseController
{
    public function index(array $params = []): void
    {
        $this->render('home.twig', [
            'featured' => Song::featured(6),
        ]);
    }

    public function notFound(): void
    {
        http_response_code(404);
        $this->render('404.twig');
    }
}
