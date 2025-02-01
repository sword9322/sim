<?php
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        $host = 'viaduct.proxy.rlwy.net';
        $port = '38872';
        $db   = 'railway';
        $user = 'root';
        $pass = 'etRHLLTUuQuemQTulOwxrnzINDilXHQx';

        try {
            $this->conn = new PDO(
                "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
                $user,
                $pass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch(PDOException $e) {
            error_log("Connection failed: " . $e->getMessage());
            throw $e;
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
} 