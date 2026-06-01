<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getConnection();
    
    // Create discover_boxes table
    $db->exec("CREATE TABLE IF NOT EXISTS discover_boxes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slot_id INT NOT NULL UNIQUE,
        product_id INT NULL,
        bg_image VARCHAR(255) NULL,
        title VARCHAR(150) NULL,
        subtitle VARCHAR(255) NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )");

    // Insert default values for slot_id 1, 2, 3, 4 if they don't exist
    $stmt = $db->query("SELECT COUNT(*) FROM discover_boxes");
    $count = $stmt->fetchColumn();
    
    if ($count == 0) {
        $insert = $db->prepare("INSERT INTO discover_boxes (slot_id, title, subtitle) VALUES (?, ?, ?)");
        $insert->execute([1, 'Citrus & Fresh', 'Bright. Energising. Uplifting.']);
        $insert->execute([2, 'Woody & Earthy', 'Grounded. Rich. Sophisticated.']);
        $insert->execute([3, 'Floral & Soft', 'Romantic. Delicate. Feminine.']);
        $insert->execute([4, 'Oriental & Oud', 'Bold. Mysterious. Lasting.']);
        echo "Inserted default slots into discover_boxes table.\n";
    } else {
        echo "discover_boxes table already seeded.\n";
    }

    echo "discover_boxes migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
