<?php

declare(strict_types=1);

namespace App\Controllers;

class MediaController extends BaseController
{
    public function index(array $params = []): void
    {
        $this->render('media.twig');
    }
}
