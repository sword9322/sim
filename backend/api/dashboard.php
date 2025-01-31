<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and get user ID
$userId = requireAuth();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // Define total storage space (e.g., 10 GB)
    $totalSpace = 10 * 1024 * 1024 * 1024; // 10 GB in bytes

    // Get used space
    $stmt = $pdo->prepare("
        SELECT SUM(filesize) as used_space FROM (
            SELECT filesize FROM documents WHERE user_id = ?
            UNION ALL
            SELECT filesize FROM music WHERE user_id = ?
            UNION ALL
            SELECT filesize FROM videos WHERE user_id = ?
        ) as user_files
    ");
    $stmt->execute([$userId, $userId, $userId]);
    $usedSpace = (int)$stmt->fetchColumn();

    // Get file counts
    $stmt = $pdo->prepare("
        SELECT
            (SELECT COUNT(*) FROM documents WHERE user_id = ?) as documents,
            (SELECT COUNT(*) FROM music WHERE user_id = ?) as music,
            (SELECT COUNT(*) FROM videos WHERE user_id = ?) as videos,
            (SELECT COUNT(*) FROM games WHERE user_id = ?) as games
    ");
    $stmt->execute([$userId, $userId, $userId, $userId]);
    $fileCounts = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get space used by type
    $spaceByType = [
        'documents' => 0,
        'music' => 0,
        'videos' => 0,
    ];

    // Documents space
    $stmt = $pdo->prepare("SELECT SUM(filesize) FROM documents WHERE user_id = ?");
    $stmt->execute([$userId]);
    $spaceByType['documents'] = (int)$stmt->fetchColumn();

    // Music space
    $stmt = $pdo->prepare("SELECT SUM(filesize) FROM music WHERE user_id = ?");
    $stmt->execute([$userId]);
    $spaceByType['music'] = (int)$stmt->fetchColumn();

    // Videos space
    $stmt = $pdo->prepare("SELECT SUM(filesize) FROM videos WHERE user_id = ?");
    $stmt->execute([$userId]);
    $spaceByType['videos'] = (int)$stmt->fetchColumn();

    // Return the data as JSON
    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_space' => $totalSpace,
            'used_space' => $usedSpace,
            'file_counts' => [
                'documents' => (int)$fileCounts['documents'],
                'music' => (int)$fileCounts['music'],
                'videos' => (int)$fileCounts['videos'],
                'games' => (int)$fileCounts['games'],
            ],
            'space_by_type' => $spaceByType,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch dashboard data']);
} 