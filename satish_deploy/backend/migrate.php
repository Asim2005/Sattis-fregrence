<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/response.php';

try {
    $db = Database::getConnection();
    
    // 1. Add size column to products
    try {
        $db->exec("ALTER TABLE products ADD COLUMN size VARCHAR(50) DEFAULT '50ml' AFTER price");
        echo "Product 'size' column added.<br>";
    } catch (Exception $e) {
        echo "Product 'size' column already exists or error: " . $e->getMessage() . "<br>";
    }

    // 2. Ensure product_images table is correct (already handled in previous tasks but good to check)
    
    echo "Migration finished.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
