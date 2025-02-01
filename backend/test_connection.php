<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    echo "Connected successfully to the database!\n";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Number of users in database: " . $result['count'] . "\n";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
} 