<?php
// Simple script to test Admin login mechanics directly
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/backend/config/db.php';
require_once __DIR__ . '/backend/helpers/response.php';
require_once __DIR__ . '/backend/helpers/jwt.php';

echo "<h1>Login Diagnostic Script</h1><pre>";

try {
    echo "1. Attempting Database Connection...\n";
    $db = Database::getConnection();
    echo "SUCCESS: Connected to database.\n\n";

    echo "2. Simulating JWT Generation...\n";
    $email = 'adminsatish@gmail.com';
    $token = JWT::generate(['id' => 1, 'email' => $email, 'role' => 'admin']);
    echo "SUCCESS: Generated JWT token: $token\n\n";

    echo "3. Querying Users Table...\n";
    $stmt = $db->query("SELECT id, name, email, role FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "SUCCESS: Fetched users from database:\n";
    print_r($users);
    echo "\n";

    echo "4. Checking if admin@satish.com exists...\n";
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute(['admin@satish.com']);
    $user = $stmt->fetch();
    if ($user) {
        echo "SUCCESS: Found default admin user in DB.\n";
        echo "Password verification test:\n";
        if (password_verify('admin123', $user['password'])) {
            echo "-> Password 'admin123' VERIFIED successfully!\n";
        } else {
            echo "-> Password 'admin123' verification FAILED. Resetting password in database to 'admin123'...\n";
            $newHash = password_hash('admin123', PASSWORD_BCRYPT);
            $updateStmt = $db->prepare("UPDATE users SET password = ? WHERE email = ?");
            $updateStmt->execute([$newHash, 'admin@satish.com']);
            echo "-> SUCCESS: Password has been reset to 'admin123'. Please refresh this page to confirm.\n";
        }
    } else {
        echo "WARNING: default admin user (admin@satish.com) NOT found in DB. Creating one...\n";
        $newHash = password_hash('admin123', PASSWORD_BCRYPT);
        $insertStmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
        $insertStmt->execute(['Admin', 'admin@satish.com', $newHash, 'admin']);
        echo "-> SUCCESS: Created admin@satish.com with password 'admin123'.\n";
    }

} catch (\Throwable $e) {
    echo "\n\nDIAGNOSTIC ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
echo "</pre>";
