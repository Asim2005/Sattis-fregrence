<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getConnection();
    
    // Modify status column to include 'completed'
    $db->exec("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded') DEFAULT 'pending'");
    echo "Successfully updated orders status enum to include 'completed'.\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
