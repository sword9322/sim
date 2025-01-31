<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth.php';

// Add CORS headers
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Add error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
error_log("Music endpoint accessed");

// Start session and get user ID
$userId = requireAuth();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM music WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        $music = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $music
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['file']) || !isset($_POST['title']) || !isset($_POST['artist'])) {
            throw new Exception('Missing required fields');
        }

        $file = $_FILES['file'];
        $fileSize = $file['size']; // Get the file size
        $title = $_POST['title'];
        $artist = $_POST['artist'];

        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../uploads/music/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $filename = uniqid() . '_' . $file['name'];
        $filepath = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to move uploaded file');
        }

        // Insert into database with filesize
        $stmt = $pdo->prepare('INSERT INTO music (title, artist, file_path, user_id, filesize) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $title,
            $artist,
            'uploads/music/' . $filename,
            $userId,
            $fileSize
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Music uploaded successfully'
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            throw new Exception('Music ID is required');
        }

        // Get file path before deletion
        $stmt = $pdo->prepare('SELECT file_path FROM music WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $userId]);
        $music = $stmt->fetch();

        if (!$music) {
            throw new Exception('Music not found or unauthorized');
        }

        // Delete file
        $filePath = __DIR__ . '/../' . $music['file_path'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Delete from database
        $stmt = $pdo->prepare('DELETE FROM music WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $userId]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Music deleted successfully'
        ]);
        exit;
    }

} catch (Exception $e) {
    error_log("Error in music.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch music'
    ]);
    exit;
} 