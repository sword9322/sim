<?php
// Create upload directories if they don't exist
$uploadDirs = [
    __DIR__ . '/uploads',
    __DIR__ . '/uploads/documents',
    __DIR__ . '/uploads/music',
    __DIR__ . '/uploads/videos',
    __DIR__ . '/uploads/games'
];

foreach ($uploadDirs as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
} 