<?php
require_once __DIR__ . '/../backend/config/db.php';

try {
    $db = Database::getConnection();
    
    // Add size column to products table
    $db->exec("ALTER TABLE products ADD COLUMN size VARCHAR(50) DEFAULT '50ml' AFTER price");
    
    echo "Migration successful: Added 'size' column to products table.\n";
} catch (Exception $e) {
    echo "Migration failed or column already exists: " . $e->getMessage() . "\n";
}
