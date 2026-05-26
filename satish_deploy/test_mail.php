<?php
// Simple script to test SMTP with full debug output
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/backend/config/db.php';
require_once __DIR__ . '/backend/helpers/PHPMailer/Exception.php';
require_once __DIR__ . '/backend/helpers/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/backend/helpers/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

echo "<h1>SMTP Test Script</h1><pre>";

// Output any debug log entries to trace save attempts
$logFile = __DIR__ . '/backend/debug.log';
if (file_exists($logFile)) {
    echo "--- LAST 5 SAVE ATTEMPTS (DEBUG LOG) ---\n";
    $lines = file($logFile);
    $last_lines = array_slice($lines, -5);
    foreach ($last_lines as $line) {
        $data = json_decode($line, true);
        if ($data) {
            $authStatus = ($data['auth_header'] !== 'NONE') ? 'PRESENT' : 'MISSING';
            $payloadStatus = ($data['payload_empty']) ? 'YES' : 'NO';
            $keysList = !empty($data['payload_keys']) ? implode(', ', $data['payload_keys']) : 'none';
            echo "Time: {$data['timestamp']} | Method: {$data['method']} | Uri: {$data['uri']} | Empty Payload: {$payloadStatus} | Auth Header: {$authStatus} | Keys Sent: {$keysList}\n";
        } else {
            echo htmlspecialchars($line);
        }
    }
    echo "----------------------------------------\n\n";
}

try {
    $db = Database::getConnection();

    // Auto-Migration Check: If smtp_host key is missing, seed default keys
    $checkHost = $db->query("SELECT COUNT(*) FROM site_settings WHERE setting_key = 'smtp_host'")->fetchColumn();
    if ($checkHost == 0) {
        echo "<div style='background:#fcf8e3; color:#8a6d3b; border:1px solid #faebcc; padding:15px; border-radius:5px; margin-bottom:15px;'>";
        echo "<strong>[Auto-Migration]</strong> Seeding missing SMTP keys into database...<br/>";
        
        $settingsToSeed = [
            'smtp_host'            => 'smtp.gmail.com',
            'smtp_port'            => '587',
            'smtp_username'        => '',
            'smtp_password'        => '',
            'smtp_encryption'      => 'tls',
            'smtp_from_email'      => 'info@sattis.com',
            'smtp_from_name'       => 'SATTIS Fragrances',
            'admin_notify_email'   => 'admin@sattis.com',
            'shipping_type'        => 'per_item',
            'shipping_fee'         => '250',
        ];
        
        $insertStmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
        foreach ($settingsToSeed as $key => $value) {
            $insertStmt->execute([$key, $value]);
            echo "Seeded key: <strong>$key</strong> => '$value'<br/>";
        }

        // Also ensure reviews table has the images column
        $stmt = $db->query("SHOW COLUMNS FROM reviews LIKE 'images'");
        if (!$stmt->fetch()) {
            $db->exec("ALTER TABLE reviews ADD COLUMN images TEXT DEFAULT NULL AFTER body");
            echo "Added 'images' column to 'reviews' table.<br/>";
        }
        echo "<strong>Migration Completed!</strong> Please refresh this page.</div><hr/>";
    }

    $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $host       = $settings['smtp_host'] ?? '';
    $port       = (int)($settings['smtp_port'] ?? 587);
    $username   = $settings['smtp_username'] ?? '';
    $password   = $settings['smtp_password'] ?? '';
    $encryption = $settings['smtp_encryption'] ?? 'tls';
    $fromEmail  = $settings['smtp_from_email'] ?? 'noreply@sattis.com';
    $fromName   = $settings['smtp_from_name'] ?? 'SATTIS Fragrances';
    $adminEmail = $settings['admin_notify_email'] ?? 'admin@sattis.com';

    echo "--- DATABASE SETTINGS KEYS FOUND ---\n";
    foreach ($settings as $k => $v) {
        if ($k === 'smtp_password' || $k === 'smtp_pass') {
            echo "$k: " . (empty($v) ? "[EMPTY]" : "[SET (Masked)]") . "\n";
        } else {
            echo "$k: " . (empty($v) ? "[EMPTY]" : htmlspecialchars($v)) . "\n";
        }
    }
    echo "-----------------------------\n\n";

    echo "--- SMTP CONFIGURATION ---\n";
    echo "Host: $host\n";
    echo "Port: $port\n";
    echo "Username: $username\n";
    echo "From: $fromEmail\n";
    echo "Sending To: $adminEmail\n";
    echo "Encryption: $encryption\n";
    echo "-----------------------------\n\n";

    if (empty($host) || empty($username)) {
        echo "WARNING: SMTP Host or Username is empty. Emails will fail.\n";
        echo "Please make sure you have:\n";
        echo "1. Logged into the Admin Dashboard at https://sattis.store/login (Admin: admin@satish.com / admin123)\n";
        echo "2. Gone to Settings (https://sattis.store/admin/settings)\n";
        echo "3. Filled in the SMTP Configurations under the PHPMailer section\n";
        echo "4. Scrolled down and clicked 'SAVE SETTINGS' (make sure you see a green success toast)\n\n";
    }

    $mail = new PHPMailer(true);
    $mail->SMTPDebug = 2; // Full Verbose Output
    $mail->Debugoutput = 'html';

    $mail->isSMTP();
    $mail->Host       = $host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $username;
    $mail->Password   = $password;
    
    if (strtolower($encryption) === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } elseif (strtolower($encryption) === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    }
    
    $mail->Port = $port;
    
    // Bypass SSL certificate verification issues common on shared hosting
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];

    $mail->setFrom($fromEmail, $fromName);
    $mail->addAddress($adminEmail);

    $mail->isHTML(true);
    $mail->Subject = 'Test Email with SMTP Debug';
    $mail->Body    = 'If you are reading this, PHPMailer is working perfectly!';

    echo "Starting SMTP Connection...\n";
    $mail->send();
    echo "\n\nSUCCESS! The email server accepted the message for delivery.</pre>";
    
} catch (Exception $e) {
    echo "\n\nMAILER ERROR: {$mail->ErrorInfo}</pre>";
} catch (\Throwable $e) {
    echo "\n\nGENERAL ERROR: " . $e->getMessage() . "</pre>";
}
