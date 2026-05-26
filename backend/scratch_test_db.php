<?php
$dsn = "mysql:host=localhost;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, 'root', '');
    echo "Connected to MySQL successfully!\n";
    // Check what databases exist
    $stmt = $pdo->query("SHOW DATABASES");
    $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Databases:\n";
    foreach ($dbs as $db) {
        echo "- $db\n";
    }
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
