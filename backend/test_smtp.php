<?php
require_once 'c:/xampp/htdocs/satish/satish/backend/config/db.php';
require_once 'c:/xampp/htdocs/satish/satish/backend/helpers/PHPMailer/Exception.php';
require_once 'c:/xampp/htdocs/satish/satish/backend/helpers/PHPMailer/PHPMailer.php';
require_once 'c:/xampp/htdocs/satish/satish/backend/helpers/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $db = Database::getConnection();
    $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $host       = $settings['smtp_host'] ?? '';
    $port       = (int)($settings['smtp_port'] ?? 587);
    $username   = $settings['smtp_username'] ?? 'highspeedlevel2005@gmail.com';
    $password   = $settings['smtp_password'] ?? 'lscktnqfxdgomunb';
    $encryption = $settings['smtp_encryption'] ?? 'tls';
    $fromEmail  = $settings['smtp_from_email'] ?? 'noreply@sattis.com';
    $fromName   = $settings['smtp_from_name'] ?? 'SATTIS Fragrances';

    echo "--- SMTP CONFIGURATION ---\n";
    echo "Host: $host\n";
    echo "Port: $port\n";
    echo "Username: $username\n";
    echo "Password: " . str_repeat('*', strlen($password)) . "\n";
    echo "Encryption: $encryption\n";
    echo "From: $fromName <$fromEmail>\n";
    echo "--------------------------\n\n";

    if (empty($host) || empty($username)) {
        die("Error: SMTP Host or Username is not configured.\n");
    }

    $mail = new PHPMailer(true);
    $mail->SMTPDebug = 2; // Enable verbose debug output
    $mail->Debugoutput = 'echo';

    $mail->isSMTP();
    $mail->Host       = $host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $username;
    $mail->Password   = $password;
    
    $encryption = strtolower(trim($encryption));
    if ($encryption === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($encryption === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPAutoTLS = false;
        $mail->SMTPSecure = '';
    }
    
    $mail->Port = $port;
    $mail->Timeout = 10;

    $mail->setFrom($fromEmail, $fromName);
    // Send to admin email as test
    $adminEmail = $settings['admin_notify_email'] ?? ($settings['contact_email'] ?? 'admin@sattis.com');
    $mail->addAddress($adminEmail);

    $mail->isHTML(true);
    $mail->Subject = 'Test Email from SATTIS Debug Script';
    $mail->Body    = '<b>Success!</b> The PHPMailer setup is working properly.';

    echo "Attempting to send email to $adminEmail...\n\n";
    $mail->send();
    echo "\nEmail sent successfully!\n";

} catch (Exception $e) {
    echo "\nMailer Error: {$mail->ErrorInfo}\n";
} catch (\Throwable $e) {
    echo "\nException: " . $e->getMessage() . "\n";
}
