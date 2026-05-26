<?php
// ============================================================
// MailHelper Utility using PHPMailer
// ============================================================

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

class MailHelper {
    /**
     * Fetch all site settings from the database.
     */
    private static function getSettings(): array {
        try {
            $db = Database::getConnection();
            $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
            return $settings;
        } catch (Exception $e) {
            error_log("MailHelper: Failed to load site settings: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Send a single HTML email.
     */
    public static function send(string $toEmail, string $subject, string $htmlBody, string $altBody = ''): bool {
        $settings = self::getSettings();
        
        $host       = $settings['smtp_host'] ?? '';
        $port       = (int)($settings['smtp_port'] ?? 587);
        $username   = $settings['smtp_username'] ?? '';
        $password   = $settings['smtp_password'] ?? '';
        $encryption = $settings['smtp_encryption'] ?? 'tls';
        $fromEmail  = $settings['smtp_from_email'] ?? 'noreply@sattis.com';
        $fromName   = $settings['smtp_from_name'] ?? 'SATTIS Fragrances';

        if (empty($host) || empty($username)) {
            error_log("MailHelper: SMTP Host or Username is not configured in site_settings.");
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->SMTPAuth   = true;
            $mail->Username   = $username;
            $mail->Password   = $password;
            
            // Encryption
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
            $mail->Timeout = 10; // 10 seconds timeout to prevent checkout hangs on SMTP failure

            // Bypass SSL certificate verification issues common on shared hosting
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];

            // Recipients
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = $altBody ?: strip_tags($htmlBody);

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("MailHelper: Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }

    /**
     * Send Admin Notification when an order is placed.
     */
    public static function sendAdminOrderNotification(array $order, array $items): bool {
        $settings = self::getSettings();
        $adminEmail = $settings['admin_notify_email'] ?? ($settings['contact_email'] ?? 'admin@sattis.com');

        $subject = "New Order Placed - Order #" . $order['id'];

        // Build elegant HTML email template
        $itemsHtml = '';
        foreach ($items as $item) {
            $productName = isset($item['name']) ? $item['name'] : (isset($item['product_name']) ? $item['product_name'] : ('Product ID: ' . ($item['product_id'] ?? '')));
            $quantity    = isset($item['qty'])        ? (int)$item['qty']        : (isset($item['quantity'])   ? (int)$item['quantity']   : 0);
            $price       = isset($item['unit_price']) ? (float)$item['unit_price'] : (isset($item['price'])      ? (float)$item['price']      : 0);
            $lineTotal   = $price * $quantity;
            $itemsHtml .= "
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>{$productName}</td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: center;'>{$quantity}</td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>Rs. " . number_format($price) . "</td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd; text-align: right;'>Rs. " . number_format($lineTotal) . "</td>
                </tr>";
        }

        $htmlBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;'>
                <h2 style='color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;'>New Order Notification</h2>
                <p>Hello Admin,</p>
                <p>A new order has been placed on <strong>SATTIS Fragrances</strong>.</p>
                
                <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Order ID:</strong></td>
                        <td>#{$order['id']}</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Customer Name:</strong></td>
                        <td>{$order['full_name']}</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Email Address:</strong></td>
                        <td>{$order['email']}</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Phone:</strong></td>
                        <td>{$order['phone']}</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Delivery Address:</strong></td>
                        <td>{$order['address']}, {$order['city']}, {$order['country']}</td>
                    </tr>
                    <tr>
                        <td style='padding: 5px 0;'><strong>Payment Method:</strong></td>
                        <td>" . strtoupper($order['payment_method']) . "</td>
                    </tr>
                </table>

                <h3 style='margin-top: 25px; border-bottom: 1px solid #ddd; padding-bottom: 5px;'>Order Items</h3>
                <table style='width: 100%; border-collapse: collapse;'>
                    <thead>
                        <tr style='background-color: #f9f9f9;'>
                            <th style='padding: 8px; text-align: left;'>Product Name</th>
                            <th style='padding: 8px; text-align: center;'>Qty</th>
                            <th style='padding: 8px; text-align: right;'>Unit Price</th>
                            <th style='padding: 8px; text-align: right;'>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                </table>

                <div style='margin-top: 20px; text-align: right;'>
                    <p style='margin: 5px 0;'><strong>Subtotal:</strong> Rs. " . number_format($order['subtotal']) . "</p>
                    <p style='margin: 5px 0;'><strong>Shipping Fee:</strong> Rs. " . number_format($order['shipping_fee']) . "</p>
                    <p style='margin: 5px 0; font-size: 16px; color: #000;'><strong>Grand Total:</strong> Rs. " . number_format($order['total_amount']) . "</p>
                </div>

                <p style='margin-top: 30px; font-size: 12px; color: #888;'>This is an automated notification from the SATTIS administration system.</p>
            </div>
        ";

        return self::send($adminEmail, $subject, $htmlBody);
    }

    /**
     * Send Customer Order Status Notification.
     */
    public static function sendOrderStatusNotification(array $order, string $status, ?string $signupEmail = null): bool {
        $subject = "Order #{$order['id']} Status Updated - SATTIS";

        // Map status codes to human readable text
        $statusLabels = [
            'pending'   => 'Pending',
            'shipped'   => 'Backed out for delivery (Shipped)',
            'completed' => 'Completed / Received',
            'cancelled' => 'Cancelled'
        ];
        $readableStatus = $statusLabels[strtolower($status)] ?? ucfirst($status);

        $htmlBody = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; color: #333;'>
                <div style='text-align: center; margin-bottom: 20px;'>
                    <h2 style='color: #000; margin: 0; font-size: 28px; letter-spacing: 2px; font-family: Georgia, serif;'>SATTIS</h2>
                    <p style='font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;'>Fragrance Curation</p>
                </div>
                <hr style='border: none; border-top: 1px solid #eee; margin-bottom: 20px;' />
                <p>Dear <strong>{$order['full_name']}</strong>,</p>
                <p>We are writing to inform you that the status of your order <strong>#{$order['id']}</strong> has been updated.</p>
                
                <div style='background-color: #f9f9f9; border-left: 4px solid #000; padding: 15px; margin: 20px 0;'>
                    <p style='margin: 0; font-size: 14px; color: #555;'>New Status:</p>
                    <p style='margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #000;'>{$readableStatus}</p>
                </div>

                <p>Our team is working diligently on your order. If your status has been updated to <strong>Shipped</strong>, it has left our facility and is on its way to you.</p>

                <h3 style='border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px;'>Order Summary</h3>
                <p style='margin: 5px 0;'><strong>Order ID:</strong> #{$order['id']}</p>
                <p style='margin: 5px 0;'><strong>Delivery Address:</strong> {$order['address']}, {$order['city']}</p>
                <p style='margin: 5px 0;'><strong>Payment Method:</strong> {$order['payment_method']}</p>
                <p style='margin: 5px 0; font-size: 16px;'><strong>Total Paid:</strong> Rs. " . number_format($order['total_amount']) . "</p>

                <p style='margin-top: 30px;'>If you have any questions, please contact our support team at info@sattis.com.</p>
                <p style='margin-top: 20px;'>Warm regards,<br /><strong>SATTIS team</strong></p>
                <hr style='border: none; border-top: 1px solid #eee; margin-top: 30px;' />
                <p style='font-size: 10px; color: #999; text-align: center;'>&copy; " . date('Y') . " SATTIS Fragrances. All rights reserved.</p>
            </div>
        ";

        // Resolve the customer email: orders table stores it as guest_email
        $toEmail    = !empty($order['guest_email']) ? $order['guest_email'] : (!empty($order['email']) ? $order['email'] : null);
        $success    = false;

        if ($toEmail) {
            $success = self::send($toEmail, $subject, $htmlBody);
        } else {
            error_log("MailHelper: No email address found for order #{$order['id']} — skipping customer notification.");
        }

        // If customer is logged in / registered, and email is different, send it there too
        if ($signupEmail && $toEmail && strtolower(trim($signupEmail)) !== strtolower(trim($toEmail))) {
            self::send($signupEmail, $subject, $htmlBody);
        }

        return $success;
    }
}
