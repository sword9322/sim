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

// Start session and get user ID
$userId = requireAuth();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $videos
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            if (!isset($_FILES['file'])) {
                throw new Exception('No file uploaded');
            }

            $file = $_FILES['file'];
            $fileSize = $file['size']; // Get the file size
            $title = $_POST['title'] ?? pathinfo($file['name'], PATHINFO_FILENAME);

            // Create uploads directory if it doesn't exist
            $uploadDir = __DIR__ . '/../uploads/videos/';
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
            $stmt = $pdo->prepare('INSERT INTO videos (title, file_path, user_id, filesize) VALUES (?, ?, ?, ?)');
            $stmt->execute([
                $title,
                'uploads/videos/' . $filename,
                $userId,
                $fileSize
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Video uploaded successfully'
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                throw new Exception('Video ID is required');
            }

            // Get file path before deletion
            $stmt = $pdo->prepare('SELECT file_path FROM videos WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);
            $video = $stmt->fetch();

            if (!$video) {
                throw new Exception('Video not found or unauthorized');
            }

            // Delete file
            $filePath = __DIR__ . '/../' . $video['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete from database
            $stmt = $pdo->prepare('DELETE FROM videos WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Video deleted successfully'
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
            exit;
        }
    }

    // If none of the above methods match
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to process request'
    ]);
    exit;
} 