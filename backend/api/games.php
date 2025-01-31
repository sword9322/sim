<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Enable error reporting for debugging (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session and get user ID
$userId = requireAuth();

// Get database connection
$db = Database::getInstance();
$pdo = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'data' => $games
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to fetch games'
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare('INSERT INTO games (user_id, title, url, thumbnail_url, description) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $userId,
            $data['title'],
            $data['url'],
            $data['thumbnail_url'] ?? null,
            $data['description'] ?? null
        ]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Game added successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to add game'
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $gameId = $_GET['id'] ?? null;
        if (!$gameId) {
            throw new Exception('Game ID is required');
        }
        
        $stmt = $pdo->prepare('DELETE FROM games WHERE id = ? AND user_id = ?');
        $stmt->execute([$gameId, $userId]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Game deleted successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to delete game'
        ]);
    }
} 