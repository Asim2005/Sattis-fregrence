<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getConnection();

    // Check and add meta_title column
    try {
        $db->exec("ALTER TABLE products ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL");
        echo "Added meta_title column to products table.\n";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { // Column already exists
            echo "meta_title column already exists.\n";
        } else {
            throw $e;
        }
    }

    // Check and add meta_description column
    try {
        $db->exec("ALTER TABLE products ADD COLUMN meta_description TEXT DEFAULT NULL");
        echo "Added meta_description column to products table.\n";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "meta_description column already exists.\n";
        } else {
            throw $e;
        }
    }

    // Check and add meta_keywords column
    try {
        $db->exec("ALTER TABLE products ADD COLUMN meta_keywords TEXT DEFAULT NULL");
        echo "Added meta_keywords column to products table.\n";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "meta_keywords column already exists.\n";
        } else {
            throw $e;
        }
    }

    echo "SEO migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
