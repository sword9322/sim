<?php
function handleUpload($file, $allowedTypes, $uploadDir) {
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type.');
    }

    $filename = uniqid() . '_' . $file['name'];
    $filepath = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Failed to move uploaded file');
    }

    return $filename;
} 