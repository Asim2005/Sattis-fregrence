<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class NewsletterController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        JWT::requireAdmin();
        $stmt = $this->db->prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
        $stmt->execute();
        respondSuccess($stmt->fetchAll());
    }

    public function subscribe(): void {
        $data  = getRequestBody();
        $email = trim(strtolower($data['email'] ?? ''));
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL))
            respondError('A valid email address is required.');

        $stmt = $this->db->prepare('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)');
        $stmt->execute([$email]);

        respondSuccess(null, 200, 'You have been subscribed successfully!');
    }

    public function sendCampaign(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $subject = trim($data['subject'] ?? '');
        $content = trim($data['content'] ?? '');

        if (empty($subject) || empty($content)) {
            respondError('Subject and content are required.');
        }

        $stmt = $this->db->query('SELECT email FROM newsletter_subscribers');
        $subscribers = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($subscribers)) {
            respondSuccess(null, 200, 'No subscribers to notify.');
            return;
        }

        require_once __DIR__ . '/../helpers/MailHelper.php';
        
        $successCount = 0;
        $failCount = 0;

        foreach ($subscribers as $email) {
            $htmlBody = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; color: #333;'>
                    <div style='text-align: center; margin-bottom: 20px;'>
                        <h2 style='color: #000; margin: 0; font-size: 28px; letter-spacing: 2px; font-family: Georgia, serif;'>SATTIS</h2>
                        <p style='font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;'>Fragrance Curation</p>
                    </div>
                    <hr style='border: none; border-top: 1px solid #eee; margin-bottom: 20px;' />
                    <div style='line-height: 1.6; font-size: 14px;'>
                        " . nl2br(htmlspecialchars($content)) . "
                    </div>
                    <hr style='border: none; border-top: 1px solid #eee; margin-top: 30px;' />
                    <p style='font-size: 10px; color: #999; text-align: center;'>You received this email because you subscribed to newsletter updates from SATTIS Fragrances.<br />
                    To unsubscribe, please contact info@sattis.com.</p>
                </div>
            ";
            if (MailHelper::send($email, $subject, $htmlBody)) {
                $successCount++;
            } else {
                $failCount++;
            }
        }

        respondSuccess([
            'total' => count($subscribers),
            'sent' => $successCount,
            'failed' => $failCount
        ], 200, "Campaign sent successfully! Sent: {$successCount}, Failed: {$failCount}.");
    }
}

