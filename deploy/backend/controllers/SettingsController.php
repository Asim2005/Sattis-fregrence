<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/MailHelper.php';

class SettingsController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        $stmt = $this->db->query('SELECT setting_key, setting_value FROM site_settings');
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        respondSuccess($settings);
    }

    public function update(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        if (empty($data)) {
            respondError('No settings data received in request body.', 400);
        }
        $stmt = $this->db->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        foreach ($data as $key => $value) {
            $stmt->execute([$key, $value]);
        }
        respondSuccess(null, 200, 'Settings updated.');
    }

    public function testSmtp(): void {
        JWT::requireAdmin();
        $data    = getRequestBody();
        $toEmail = trim($data['to'] ?? '');
        if (!$toEmail || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            respondError('A valid recipient email address is required.');
        }

        $subject  = 'SATTIS SMTP Test — ' . date('Y-m-d H:i:s');
        $htmlBody = "
            <div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px;'>
                <h2 style='margin:0 0 8px;font-size:22px;letter-spacing:2px;font-family:Georgia,serif;'>SATTIS</h2>
                <p style='color:#555;'>This is a test email to confirm your SMTP configuration is working correctly.</p>
                <p style='color:#555;'>If you received this, mail is set up properly.</p>
                <p style='font-size:11px;color:#aaa;margin-top:24px;'>Sent: {$subject}</p>
            </div>";

        $ok = MailHelper::send($toEmail, $subject, $htmlBody);
        if ($ok) {
            respondSuccess(null, 200, "Test email sent to {$toEmail}. Check your inbox.");
        } else {
            $reason = MailHelper::$lastError ?: 'Unknown error — check the server error log.';
            respondError($reason, 422);
        }
    }
}
