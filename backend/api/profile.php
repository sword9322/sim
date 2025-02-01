<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth.php';

// Set CORS headers
header("Access-Control-Allow-Origin: https://sim-production-4718.up.railway.app");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Enable error reporting for debugging (remove or disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and get user ID
$userId = requireAuth();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if this is a file upload or profile update
        if (isset($_FILES['profile_image'])) {
            // Debugging output
            error_log('File upload detected');
            error_log(print_r($_FILES, true));

            try {
                if (!isset($_FILES['profile_image'])) {
                    throw new Exception('No image uploaded');
                }

                $file = $_FILES['profile_image'];
                
                // Validate file type
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!in_array($file['type'], $allowedTypes)) {
                    throw new Exception('Invalid file type. Only JPG, PNG and GIF are allowed.');
                }

                // Create uploads directory if it doesn't exist
                $uploadDir = __DIR__ . '/../uploads/profiles/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Generate unique filename
                $filename = uniqid() . '_' . $file['name'];
                $filepath = $uploadDir . $filename;

                if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                    throw new Exception('Failed to move uploaded file');
                }

                // Update database with new profile image path
                $stmt = $pdo->prepare('UPDATE users SET profile_image = ? WHERE id = ?');
                $stmt->execute([
                    '/backend/uploads/profiles/' . $filename,
                    $userId
                ]);

                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'status' => 'success',
                        'data' => [
                            'imageUrl' => '/backend/uploads/profiles/' . $filename
                        ],
                        'message' => 'Profile image updated successfully'
                    ]);
                } else {
                    throw new Exception('Failed to update profile image in database');
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        } else {
            try {
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($data['action']) || $data['action'] !== 'update') {
                    throw new Exception('Invalid action');
                }

                // Start building the query and parameters
                $updates = [];
                $params = [];

                // Add name if provided
                if (isset($data['name']) && !empty($data['name'])) {
                    $updates[] = 'name = ?';
                    $params[] = $data['name'];
                }

                // Add email if provided
                if (isset($data['email']) && !empty($data['email'])) {
                    $updates[] = 'email = ?';
                    $params[] = $data['email'];
                }

                // Handle password update if provided
                if (isset($data['newPassword']) && !empty($data['newPassword'])) {
                    if (!isset($data['currentPassword']) || empty($data['currentPassword'])) {
                        throw new Exception('Current password is required to set new password');
                    }

                    // Verify current password
                    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch();

                    if (!$user || !password_verify($data['currentPassword'], $user['password'])) {
                        throw new Exception('Current password is incorrect');
                    }

                    $updates[] = 'password = ?';
                    $params[] = password_hash($data['newPassword'], PASSWORD_DEFAULT);
                }

                if (empty($updates)) {
                    throw new Exception('No fields to update');
                }

                // Add user ID to params
                $params[] = $userId;

                // Build and execute the update query
                $query = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);

                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Profile updated successfully'
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'No changes were made'
                    ]);
                }
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => $e->getMessage()
                ]);
            }
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $stmt = $pdo->prepare('SELECT profile_image FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'imageUrl' => $user['profile_image'] ?? null
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch profile image'
            ]);
        }
    } else {
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error'
    ]);
} 