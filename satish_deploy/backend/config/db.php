<?php
// ============================================================
// Database Configuration
// ============================================================
// IMPORTANT: Change these values to your hosting credentials
// before deploying to Hostinger / GoDaddy cPanel.
// ============================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'sattisst_satish_db');
define('DB_USER', 'sattisst_satish_user');       // Change in production
define('DB_PASS', 'satish_password');           // Change in production
define('DB_CHARSET', 'utf8mb4');

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database connection failed.']);
                exit;
            }
        }
        return self::$instance;
    }
}
