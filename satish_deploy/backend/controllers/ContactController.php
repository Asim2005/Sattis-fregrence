<?php
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/MailHelper.php';
require_once __DIR__ . '/../config/db.php';

class ContactController {
    public function submit(): void {
        $data = getRequestBody();
        
        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            respondError('Name, email, and message are required fields.');
        }

        $name = trim($data['name']);
        $email = trim($data['email']);
        $message = trim($data['message']);

        // Fetch the admin email to send the contact form to
        $db = Database::getConnection();
        $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('admin_notify_email', 'contact_email')");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        $adminEmail = $settings['admin_notify_email'] ?? ($settings['contact_email'] ?? 'admin@sattis.com');

        $subject = "New Contact Form Submission from: $name";
        $htmlBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;'>
                <h2 style='color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;'>New Contact Message</h2>
                <p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
                <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
                <h3 style='margin-top: 20px;'>Message:</h3>
                <div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #000; margin-top: 10px;'>
                    " . nl2br(htmlspecialchars($message)) . "
                </div>
            </div>
        ";

        try {
            $success = MailHelper::send($adminEmail, $subject, $htmlBody);
            
            if ($success) {
                respondSuccess(null, 200, 'Message sent successfully.');
            } else {
                respondError('Failed to send message via PHPMailer.', 500);
            }
        } catch (Throwable $e) {
            error_log("ContactController: " . $e->getMessage());
            respondError('Failed to send message.', 500);
        }
    }
}
