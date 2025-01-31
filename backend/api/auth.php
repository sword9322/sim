<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    
    // Debug logging
    error_log('Received data: ' . print_r($data, true));
    
    if (!$data) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid JSON data received',
            'debug' => json_last_error_msg()
        ]);
        exit;
    }
    
    if (isset($data['action'])) {
        switch ($data['action']) {
            case 'login':
                if (empty($data['email']) || empty($data['password'])) {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Email and password are required',
                        'debug' => [
                            'received_data' => $data,
                            'email_set' => isset($data['email']),
                            'password_set' => isset($data['password'])
                        ]
                    ]);
                    exit;
                }

                try {
                    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
                    $stmt->execute([$data['email']]);
                    $user = $stmt->fetch();

                    if ($user && password_verify($data['password'], $user['password'])) {
                        // Remove password from session data
                        unset($user['password']);
                        $_SESSION['user'] = [
                            'id' => $user['id'],
                            'name' => $user['name'],
                            'email' => $user['email']
                        ];
                        echo json_encode(['status' => 'success', 'user' => $user]);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
                    }
                } catch (PDOException $e) {
                    error_log('Database error: ' . $e->getMessage());
                    echo json_encode(['status' => 'error', 'message' => 'Database error']);
                }
                break;

            case 'register':
                if (!isset($data['email']) || !isset($data['password'])) {
                    echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
                    exit;
                }

                try {
                    // Check if email already exists
                    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
                    $stmt->execute([$data['email']]);
                    if ($stmt->fetch()) {
                        echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
                        exit;
                    }

                    // Extract username from email (everything before @)
                    $username = strstr($data['email'], '@', true);

                    // Insert new user with username from email
                    $stmt = $pdo->prepare('INSERT INTO users (email, password, name, username) VALUES (?, ?, ?, ?)');
                    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                    $stmt->execute([$data['email'], $hashedPassword, '', $username]); // Add username

                    // Get the newly created user
                    $userId = $pdo->lastInsertId();
                    $stmt = $pdo->prepare('SELECT id, email, name, username FROM users WHERE id = ?');
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch();

                    $_SESSION['user'] = $user;
                    echo json_encode(['status' => 'success', 'user' => $user]);
                } catch (PDOException $e) {
                    error_log('Registration error: ' . $e->getMessage());
                    echo json_encode([
                        'status' => 'error', 
                        'message' => 'Database error',
                        'debug' => $e->getMessage()
                    ]);
                }
                break;

            case 'logout':
                session_destroy();
                echo json_encode(['status' => 'success']);
                break;
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user'])) {
        echo json_encode(['status' => 'success', 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    }
} 