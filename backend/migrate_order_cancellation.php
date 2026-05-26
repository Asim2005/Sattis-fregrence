<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getConnection();
    
    // Check if cancellation_reason column exists
    $q = $db->query("SHOW COLUMNS FROM orders LIKE 'cancellation_reason'");
    $column = $q->fetch();
    
    if (!$column) {
        $db->exec("ALTER TABLE orders ADD COLUMN cancellation_reason TEXT DEFAULT NULL");
        echo "Successfully added 'cancellation_reason' column to 'orders' table.\n";
    } else {
        echo "'cancellation_reason' column already exists in 'orders' table.\n";
    }
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
