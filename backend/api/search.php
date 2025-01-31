<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth.php';

// Start session and get user ID
$userId = requireAuth();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = isset($_GET['query']) ? trim($_GET['query']) : '';
        
        if (empty($query)) {
            echo json_encode(['status' => 'success', 'data' => []]);
            exit;
        }

        // Prepare the search query for each content type
        $searchTerm = "%{$query}%";

        // Search in music
        $musicStmt = $pdo->prepare("
            SELECT 
                id,
                title,
                'music' as type,
                artist
            FROM music 
            WHERE user_id = ? 
            AND (title LIKE ? OR artist LIKE ?)
        ");
        $musicStmt->execute([$userId, $searchTerm, $searchTerm]);
        $musicResults = $musicStmt->fetchAll(PDO::FETCH_ASSOC);

        // Search in videos
        $videoStmt = $pdo->prepare("
            SELECT 
                id,
                title,
                'video' as type,
                NULL as artist
            FROM videos 
            WHERE user_id = ? 
            AND title LIKE ?
        ");
        $videoStmt->execute([$userId, $searchTerm]);
        $videoResults = $videoStmt->fetchAll(PDO::FETCH_ASSOC);

        // Search in documents
        $docStmt = $pdo->prepare("
            SELECT 
                id,
                title,
                'document' as type,
                NULL as artist
            FROM documents 
            WHERE user_id = ? 
            AND title LIKE ?
        ");
        $docStmt->execute([$userId, $searchTerm]);
        $documentResults = $docStmt->fetchAll(PDO::FETCH_ASSOC);

        // Search in games
        $gameStmt = $pdo->prepare("
            SELECT 
                id,
                title,
                'game' as type,
                NULL as artist
            FROM games 
            WHERE user_id = ? 
            AND title LIKE ?
        ");
        $gameStmt->execute([$userId, $searchTerm]);
        $gameResults = $gameStmt->fetchAll(PDO::FETCH_ASSOC);

        // Combine all results
        $allResults = array_merge(
            $musicResults,
            $videoResults,
            $documentResults,
            $gameResults
        );

        echo json_encode([
            'status' => 'success',
            'data' => $allResults
        ]);
        exit;

    } else {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        exit;
    }

} catch (Exception $e) {
    error_log('Search error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to perform search'
    ]);
    exit;
}