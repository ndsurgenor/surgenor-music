<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Song;

class SongController extends BaseController
{
    public function index(array $params = []): void
    {
        $songs = Song::search('', []);
        $keys  = Song::allKeys();
        $tags  = Song::allTags();

        $this->render('songs/index.twig', [
            'songs' => $songs,
            'keys'  => $keys,
            'tags'  => $tags,
        ]);
    }

    public function show(array $params = []): void
    {
        $song = Song::findBySlug($params['slug'] ?? '');

        if (!$song) {
            http_response_code(404);
            $this->render('404.twig');
            return;
        }

        $this->render('songs/show.twig', ['song' => $song]);
    }
}
