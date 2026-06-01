<?php
require_once 'config/db.php';
try {
    $db = Database::getConnection();
    echo "CONNECTED";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
