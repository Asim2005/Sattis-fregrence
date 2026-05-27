<?php
// Load environment-specific credentials from env.php (gitignored).
// If env.php is absent (e.g. on a server where creds are set another way),
// fall back to the production constants below.
$envFile = __DIR__ . '/env.php';
if (file_exists($envFile)) {
    require_once $envFile;
} else {
    // ── PRODUCTION (Hostinger / cPanel) ──────────────────────────
    // Set these to your actual hosting DB credentials.
    define('DB_HOST',    'localhost');
    define('DB_NAME',    'sattisst_satish_db');
    define('DB_USER',    'sattisst_satish_user');
    define('DB_PASS',    'satish_password');
    define('JWT_SECRET', 'replace-with-a-strong-random-secret');
}

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
