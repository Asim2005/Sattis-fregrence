<?php
require_once __DIR__ . '/config/db.php';

echo "<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;} .ok{color:green;} .skip{color:orange;} .err{color:red;}</style>";
echo "<h2>SATISH DB Migration</h2>";

$db = Database::getConnection();

function runAlter($db, $label, $sql) {
    echo "<p><b>$label</b>: ";
    try {
        $db->exec($sql);
        echo "<span class='ok'>✅ SUCCESS</span>";
    } catch (PDOException $e) {
        // 1060 = Duplicate column, 1061 = Duplicate key - these are safe to ignore
        if (in_array($e->errorInfo[1], [1060, 1061])) {
            echo "<span class='skip'>⏭ Already exists (skipped)</span>";
        } else {
            echo "<span class='err'>❌ ERROR: " . $e->getMessage() . "</span>";
        }
    }
    echo "</p>";
}

// --- products ---
runAlter($db, "products.shipping_fee", 
    "ALTER TABLE `products` ADD COLUMN `shipping_fee` DECIMAL(10,2) DEFAULT 0.00");

runAlter($db, "products.size",
    "ALTER TABLE `products` ADD COLUMN `size` VARCHAR(50) DEFAULT '50ml'");

// --- orders ---
runAlter($db, "orders.coupon_id",
    "ALTER TABLE `orders` ADD COLUMN `coupon_id` INT NULL");

runAlter($db, "orders.discount_amount",
    "ALTER TABLE `orders` ADD COLUMN `discount_amount` DECIMAL(10,2) DEFAULT 0.00");

// --- coupons ---
runAlter($db, "coupons.discount_type",
    "ALTER TABLE `coupons` ADD COLUMN `discount_type` ENUM('percentage','fixed','shipping') DEFAULT 'percentage' AFTER `code`");

runAlter($db, "coupons.discount_value",
    "ALTER TABLE `coupons` ADD COLUMN `discount_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `discount_type`");

// Migrate old coupon data
echo "<p><b>Migrating old coupon percentages</b>: ";
try {
    $affected = $db->exec("UPDATE `coupons` SET `discount_value` = `discount_percent` WHERE `discount_value` = 0 AND `discount_percent` > 0");
    echo "<span class='ok'>✅ Done ($affected rows updated)</span>";
} catch(PDOException $e) {
    echo "<span class='err'>❌ " . $e->getMessage() . "</span>";
}
echo "</p>";

echo "<hr><h3 class='ok'>Migration complete! You can close this page.</h3>";
?>
