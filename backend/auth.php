<?php
require_once __DIR__ . '/config/database.php';

// Set session cookie parameters
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '0'); // Use '0' for development without HTTPS

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get database connection
$db = Database::getInstance();
$pdo = $db->getConnection();

// Set CORS headers
header("Access-Control-Allow-Origin: https://sim-production-4718.up.railway.app");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function requireAuth() {
    if (!isset($_SESSION['user'])) {  // Changed from user_id to user
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
    return $_SESSION['user']['id'];  // Return the user ID for convenience
}

function login($username, $password) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare('SELECT id, username, password FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username']
            ];
            return [
                'id' => $user['id'],
                'username' => $user['username']
            ];
        }
        
        return false;
    } catch (PDOException $e) {
        error_log($e->getMessage());
        return false;
    }
}

function register($username, $password) {
    global $pdo;
    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        $stmt = $pdo->prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        $stmt->execute([$username, $hashedPassword]);
        return [
            'id' => $pdo->lastInsertId(),
            'username' => $username
        ];
    } catch (PDOException $e) {
        error_log($e->getMessage());
        return false;
    }
}

// Remove output buffering if not needed
// Ensure that there's no accidental output before headers 