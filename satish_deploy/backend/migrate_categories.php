<?php
require_once __DIR__ . '/config/db.php';

try {
    $db = Database::getConnection();
    
    // Ensure categories table has image column
    try {
        $db->exec("ALTER TABLE categories ADD COLUMN image VARCHAR(255) DEFAULT NULL AFTER description");
        echo "Category 'image' column added.<br>";
    } catch (Exception $e) {}

    // Add categories if they don't exist
    $categories = [
        ['name' => 'Men', 'slug' => 'men', 'sort_order' => 1],
        ['name' => 'Women', 'slug' => 'women', 'sort_order' => 2],
        ['name' => 'Unisex', 'slug' => 'unisex', 'sort_order' => 3],
        ['name' => 'Bundles', 'slug' => 'bundles', 'sort_order' => 4],
    ];

    foreach ($categories as $cat) {
        $stmt = $db->prepare("SELECT id FROM categories WHERE slug = ?");
        $stmt->execute([$cat['slug']]);
        if (!$stmt->fetch()) {
            $stmt = $db->prepare("INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)");
            $stmt->execute([$cat['name'], $cat['slug'], $cat['sort_order']]);
            echo "Category '{$cat['name']}' created.<br>";
        }
    }

    echo "Category migration finished.";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
