<?php
require_once 'config/db.php';
try {
    $db = Database::getConnection();
    $stmt = $db->query("DESCRIBE orders");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
