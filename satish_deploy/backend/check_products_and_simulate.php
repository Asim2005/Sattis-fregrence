<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'config/db.php';
$db = Database::getConnection();

// 1. Get a product ID
$product = $db->query("SELECT id, price, name FROM products LIMIT 1")->fetch();
if (!$product) {
    echo "No products found in database!\n";
    exit;
}

echo "Found product: ID = {$product['id']}, Name = {$product['name']}, Price = {$product['price']}\n";

// 2. Mock order input
$orderData = [
    'full_name' => 'Guest User Test',
    'email' => 'guest@example.com',
    'phone' => '1234567890',
    'address' => '123 Street Name',
    'city' => 'Lahore',
    'country' => 'Pakistan',
    'payment_method' => 'COD',
    'items' => [
        [
            'product_id' => $product['id'],
            'quantity' => 1,
            'price' => $product['price']
        ]
    ]
];

// Let's run the OrderController store logic in a simulated environment
// We'll mock the getRequestBody() and requireAuth etc.
$userId = null; // Guest user
$subtotal = $product['price'];
$finalShipping = 250;
$discount = 0;
$couponId = null;
$total = $subtotal + $finalShipping;
$notes = '';

$db->beginTransaction();
try {
    $stmt = $db->prepare(
        'INSERT INTO orders (user_id, guest_email, full_name, phone, address, city, country, total_amount, discount_amount, coupon_id, payment_method, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $userId, $orderData['email'], $orderData['full_name'], $orderData['phone'],
        $orderData['address'], $orderData['city'], $orderData['country'],
        $total, $discount, $couponId, $orderData['payment_method'], $notes,
    ]);
    $orderId = $db->lastInsertId();
    echo "Inserted order! ID = $orderId\n";

    // Insert order item
    $stmt = $db->prepare('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$orderId, $product['id'], $product['name'], 1, $product['price'], $product['price']]);
    echo "Inserted order item!\n";

    $db->commit();
    echo "TRANSACTION SUCCESSFUL!\n";

    // Mock itemsToInsert
    $itemsToInsert = [
        [
            'product_id' => $product['id'], 
            'name' => $product['name'], 
            'qty' => 1, 
            'unit_price' => $product['price'],
            'total' => $product['price']
        ]
    ];

    // Mock order info
    $order = [
        'id' => $orderId,
        'full_name' => $orderData['full_name'],
        'email' => $orderData['email'],
        'phone' => $orderData['phone'],
        'address' => $orderData['address'],
        'city' => $orderData['city'],
        'country' => $orderData['country'],
        'payment_method' => $orderData['payment_method'],
        'subtotal' => $subtotal,
        'shipping_fee' => $finalShipping,
        'total_amount' => $total
    ];

    // Simulate sending email
    require_once 'helpers/MailHelper.php';
    echo "Calling MailHelper...\n";
    MailHelper::sendAdminOrderNotification($order, $itemsToInsert);
    echo "MailHelper complete!\n";
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "EXCEPTION/ERROR: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\n";
}
