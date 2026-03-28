<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Song;
use App\Models\Settings;

class HomeController extends BaseController
{
    public function index(array $params = []): void
    {
        $featured   = Song::featured(6);
        $heroText   = Settings::get('hero_text', 'Worship <strong>Songs</strong> &amp; <strong>Resources</strong> from musician <strong>Nathan Surgenor</strong>');
        $heroImage  = Settings::get('hero_image');

        $this->render('home.twig', [
            'featured'   => $featured,
            'hero_text'  => $heroText,
            'hero_image' => $heroImage,
        ]);
    }

    public function notFound(): void
    {
        http_response_code(404);
        $this->render('404.twig');
    }
}
