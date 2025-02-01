<?php
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../config/database.php';

// Update CORS headers
header("Access-Control-Allow-Origin: https://sim-production-4718.up.railway.app");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session and get user ID
$userId = requireAuth();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['download'])) {
        $stmt = $pdo->prepare("
            SELECT id, title as name, file_type as type, file_path as url
            FROM documents
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        
        $stmt->execute([$userId]);
        $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$documents) {
            $documents = []; // Ensure it's an empty array if no documents found
        }

        // Transform the URLs to be fully qualified
        foreach ($documents as &$doc) {
            $doc['url'] = 'https://sim-production-4718.up.railway.app/backend' . $doc['url'];
        }

        echo json_encode([
            'status' => 'success',
            'documents' => $documents
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
            $uploadDir = __DIR__ . '/../uploads/documents/';
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
            $stmt = $pdo->prepare('INSERT INTO documents (title, file_path, file_type, user_id, filesize) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([
                $title,
                'uploads/documents/' . $filename,
                $file['type'],
                $userId,
                $fileSize // Add the filesize here
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Document uploaded successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                throw new Exception('Document ID is required');
            }

            // Modified to only allow deletion of user's own documents
            $stmt = $pdo->prepare('SELECT file_path FROM documents WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);
            $document = $stmt->fetch();

            if (!$document) {
                throw new Exception('Document not found or access denied');
            }

            if (file_exists('../uploads/documents/' . $document['file_path'])) {
                unlink('../uploads/documents/' . $document['file_path']); // Delete the actual file
            }

            // Delete only user's own document
            $stmt = $pdo->prepare('DELETE FROM documents WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Document deleted successfully']);
            } else {
                throw new Exception('Document not found');
            }
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    // Add this new GET endpoint for downloading files
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['download'])) {
        try {
            $id = $_GET['download'];
            
            // Get document info
            $stmt = $pdo->prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);
            $document = $stmt->fetch();
            
            if (!$document) {
                throw new Exception('Document not found or access denied');
            }
            
            $file_path = '../uploads/documents/' . $document['file_path'];
            
            if (!file_exists($file_path)) {
                throw new Exception('File not found');
            }
            
            // Get MIME type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime_type = finfo_file($finfo, $file_path);
            finfo_close($finfo);
            
            // Set headers for download
            header('Content-Type: ' . $mime_type);
            header('Content-Disposition: attachment; filename="' . basename($document['title'] . '.' . $document['file_type']) . '"');
            header('Content-Length: ' . filesize($file_path));
            header('Cache-Control: no-cache');
            
            // Output file
            readfile($file_path);
            exit;
            
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} 