<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Song;

class SongController extends BaseController
{
    public function index(array $params = []): void
    {
        $search    = trim($_GET['q'] ?? '');
        $filterKey = $_GET['key'] ?? '';
        $filterTag = $_GET['tag'] ?? '';

        $songs = Song::search($search, ['key' => $filterKey, 'tag' => $filterTag]);
        $keys  = Song::allKeys();
        $tags  = Song::allTags();

        $this->render('songs/index.html.twig', [
            'songs'     => $songs,
            'keys'      => $keys,
            'tags'      => $tags,
            'search'    => $search,
            'filterKey' => $filterKey,
            'filterTag' => $filterTag,
        ]);
    }

    public function show(array $params = []): void
    {
        $song = Song::findBySlug($params['slug'] ?? '');

        if (!$song) {
            http_response_code(404);
            $this->render('404.html.twig');
            return;
        }

        $this->render('songs/show.html.twig', ['song' => $song]);
    }
}
