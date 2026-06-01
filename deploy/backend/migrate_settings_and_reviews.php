<?php
// ============================================================
// Database Migration for SMTP & Review Images
// ============================================================
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getConnection();
    echo "Connected to the database successfully.\n";

    // 1. Check if 'images' column exists in 'reviews' table
    $stmt = $db->query("SHOW COLUMNS FROM reviews LIKE 'images'");
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $db->exec("ALTER TABLE reviews ADD COLUMN images TEXT DEFAULT NULL AFTER body");
        echo "Successfully added 'images' column to 'reviews' table.\n";
    } else {
        echo "'images' column already exists in 'reviews' table. Skipping.\n";
    }

    // 2. Seed site settings
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

    $checkStmt = $db->prepare("SELECT COUNT(*) FROM site_settings WHERE setting_key = ?");
    $insertStmt = $db->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)");

    foreach ($settingsToSeed as $key => $value) {
        $checkStmt->execute([$key]);
        $exists = $checkStmt->fetchColumn() > 0;

        if (!$exists) {
            $insertStmt->execute([$key, $value]);
            echo "Seeded setting: '$key' => '$value'\n";
        } else {
            echo "Setting '$key' already exists. Skipping.\n";
        }
    }

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
    exit(1);
}
