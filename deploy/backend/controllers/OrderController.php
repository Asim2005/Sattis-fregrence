<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class OrderController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // Admin or user: Get all orders
    public function index(): void {
        $payload = JWT::requireAuth();
        try {
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;
            $limit  = (int)($_GET['limit'] ?? 30);
            $page   = (int)($_GET['page'] ?? 1);
            $offset = ($page - 1) * $limit;

            $params = [];
            $whereClauses = [];

            // If not admin, restrict to own orders
            if ($payload['role'] !== 'admin') {
                $whereClauses[] = 'o.user_id = ?';
                $params[] = $payload['id'];
            }

            if ($status && $status !== 'all') {
                $whereClauses[] = 'o.status = ?';
                $params[] = $status;
            }

            if ($search) {
                $cleanSearch = ltrim($search, '#');
                if (is_numeric($cleanSearch)) {
                    $whereClauses[] = '(o.id = ? OR o.full_name LIKE ? OR o.guest_email LIKE ? OR o.phone LIKE ? OR o.city LIKE ?)';
                    $params[] = (int)$cleanSearch;
                } else {
                    $whereClauses[] = '(o.full_name LIKE ? OR o.guest_email LIKE ? OR o.phone LIKE ? OR o.city LIKE ?)';
                }
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            // Count query for pagination
            $countSql = 'SELECT COUNT(DISTINCT o.id) FROM orders o';
            if (!empty($whereClauses)) {
                $countSql .= ' WHERE ' . implode(' AND ', $whereClauses);
            }
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = (int)$countStmt->fetchColumn();

            // List query
            $sql = 'SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id';
            if (!empty($whereClauses)) {
                $sql .= ' WHERE ' . implode(' AND ', $whereClauses);
            }
            $sql .= ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';

            $listParams = array_merge($params, [$limit, $offset]);

            $stmt = $this->db->prepare($sql);
            foreach ($listParams as $i => $val) {
                $stmt->bindValue($i + 1, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }
            $stmt->execute();
            $orders = $stmt->fetchAll();

            // Backwards compatibility check
            if (isset($_GET['paginate']) && $_GET['paginate'] === 'true') {
                respondSuccess([
                    'orders' => $orders,
                    'pagination' => [
                        'total' => $totalCount,
                        'page' => $page,
                        'limit' => $limit,
                        'pages' => ceil($totalCount / $limit)
                    ]
                ]);
            } else {
                respondSuccess($orders);
            }
        } catch (Exception $e) {
            respondError('Failed to load orders: ' . $e->getMessage(), 500);
        }
    }

    // Admin or user: Get single order
    public function show(string $id): void {
        $payload = JWT::requireAuth();
        $sql = 'SELECT * FROM orders WHERE id = ?';
        $params = [$id];
        if ($payload['role'] !== 'admin') {
            $sql .= ' AND user_id = ?';
            $params[] = $payload['id'];
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $order = $stmt->fetch();
        if (!$order) respondError('Order not found.', 404);

        $itemStmt = $this->db->prepare('SELECT * FROM order_items WHERE order_id = ?');
        $itemStmt->execute([$id]);
        $order['items'] = $itemStmt->fetchAll();
        respondSuccess($order);
    }

    // Public: Place a new order
    public function store(): void {
        $data = getRequestBody();
        $required = ['full_name', 'phone', 'address', 'city', 'items'];
        foreach ($required as $field) {
            if (empty($data[$field])) respondError("Field '$field' is required.");
        }
        if (empty($data['items']) || !is_array($data['items']))
            respondError('Order must contain at least one item.');

        // Get user if authenticated
        $userId = null;
        $payload = JWT::getFromRequest();
        if ($payload) $userId = $payload['id'];

        // Load settings for shipping calculation
        $settingsStmt = $this->db->query("SELECT setting_key, setting_value FROM site_settings");
        $settingsRows = $settingsStmt->fetchAll();
        $settings = [];
        foreach ($settingsRows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        $shippingType = $settings['shipping_type'] ?? 'per_item';
        $flatShippingFee = (float)($settings['shipping_fee'] ?? 250);
        $freeShippingThreshold = (float)($settings['free_shipping_threshold'] ?? 3000);

        // Calculate subtotal and shipping
        $subtotal = 0;
        $shippingTotal = 0;
        $itemsToInsert = [];
        foreach ($data['items'] as $item) {
            $stmt = $this->db->prepare('SELECT id, name, price, sale_price, stock, shipping_fee FROM products WHERE id = ?');
            $stmt->execute([$item['product_id']]);
            $product = $stmt->fetch();
            if (!$product) respondError("Product ID {$item['product_id']} not found.");
            
            $price = $product['sale_price'] ?? $product['price'];
            $itemSubtotal = $price * $item['quantity'];
            
            $subtotal += $itemSubtotal;
            
            if ($shippingType === 'per_item') {
                $shippingTotal += ($product['shipping_fee'] ?? 0) * $item['quantity'];
            }
            
            $itemsToInsert[] = [
                'product_id' => $product['id'], 
                'name' => $product['name'], 
                'qty' => $item['quantity'], 
                'unit_price' => $price, 
                'total' => $itemSubtotal
            ];
        }

        // If flat rate, assign standard fee (only if sum was not already zeroed out by free shipping)
        if ($shippingType === 'flat') {
            $shippingTotal = $flatShippingFee;
        }

        // Apply free shipping threshold check
        if ($subtotal >= $freeShippingThreshold) {
            $shippingTotal = 0;
        }

        $discount = 0;
        $shippingDiscount = 0;
        $couponId = null;
        if (!empty($data['coupon_code'])) {
            $cStmt = $this->db->prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1');
            $cStmt->execute([$data['coupon_code']]);
            $coupon = $cStmt->fetch();
            if ($coupon) {
                // Check expiry and limit
                $expired = ($coupon['expiry_date'] && strtotime($coupon['expiry_date']) < time());
                $limitReached = ($coupon['usage_limit'] > 0 && $coupon['used_count'] >= $coupon['usage_limit']);
                if (!$expired && !$limitReached) {
                    $couponId = $coupon['id'];
                    $type = $coupon['discount_type'] ?? 'percentage';
                    $val = (float)$coupon['discount_value'];

                    if ($type === 'percentage') {
                        $discount = ($subtotal * $val) / 100;
                    } elseif ($type === 'fixed') {
                        $discount = min($val, $subtotal);
                    } elseif ($type === 'shipping') {
                        $shippingDiscount = min($val, $shippingTotal);
                    }
                }
            }
        }

        $finalShipping = max(0, $shippingTotal - $shippingDiscount);
        $total = ($subtotal - $discount) + $finalShipping;

        $notes = $data['notes'] ?? '';
        if ($data['payment_method'] === 'easypaisa' && !empty($data['sender_name'])) {
            $notes = "EasyPaisa Sender: " . $data['sender_name'] . ($notes ? " | " . $notes : "");
        }

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO orders (user_id, guest_email, full_name, phone, address, city, country, total_amount, discount_amount, coupon_id, payment_method, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $userId, $data['email'] ?? null, $data['full_name'], $data['phone'],
                $data['address'], $data['city'], $data['country'] ?? 'Pakistan',
                $total, $discount, $couponId, $data['payment_method'] ?? 'COD', $notes,
            ]);
            $orderId = $this->db->lastInsertId();

            if ($couponId) {
                $this->db->prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?')->execute([$couponId]);
            }

            foreach ($itemsToInsert as $item) {
                $this->db->prepare('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)')
                    ->execute([$orderId, $item['product_id'], $item['name'], $item['qty'], $item['unit_price'], $item['total']]);
                $this->db->prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
                    ->execute([$item['qty'], $item['product_id']]);
            }

            $this->db->commit();

            // Prepare order info for email helper
            $order = [
                'id' => $orderId,
                'full_name' => $data['full_name'],
                'email' => $data['email'] ?? '',
                'phone' => $data['phone'],
                'address' => $data['address'],
                'city' => $data['city'],
                'country' => $data['country'] ?? 'Pakistan',
                'payment_method' => $data['payment_method'] ?? 'COD',
                'subtotal' => $subtotal,
                'shipping_fee' => $finalShipping,
                'total_amount' => $total
            ];
            
            // Send Admin Order Notification using PHP Mailer
            try {
                require_once __DIR__ . '/../helpers/MailHelper.php';
                MailHelper::sendAdminOrderNotification($order, $itemsToInsert);
            } catch (Throwable $mailEx) {
                error_log("OrderController: Failed sending admin notification email: " . $mailEx->getMessage());
            }

            respondSuccess(['order_id' => $orderId, 'total' => $total], 201, 'Order placed successfully!');
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            respondError('Failed to place order. Please try again. Error: ' . $e->getMessage(), 500);
        }
    }

    // Admin: Update order status
    public function update(string $id): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $cancellationReason = isset($data['cancellation_reason']) ? $data['cancellation_reason'] : null;
        $stmt = $this->db->prepare('UPDATE orders SET status = ?, payment_status = ?, cancellation_reason = ? WHERE id = ?');
        $stmt->execute([
            $data['status'] ?? 'pending', 
            $data['payment_status'] ?? 'unpaid', 
            $cancellationReason,
            $id
        ]);
        respondSuccess(null, 200, 'Order updated.');
    }

    // Admin: Send order status email to customer
    public function notifyStatus(string $id): void {
        JWT::requireAdmin();
        
        // Fetch order details
        $stmt = $this->db->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if (!$order) respondError('Order not found.', 404);

        // If a user is signed up, then the email should be on the checkout as well as on the email of the sign up
        $signupEmail = null;
        if (!empty($order['user_id'])) {
            $uStmt = $this->db->prepare('SELECT email FROM users WHERE id = ?');
            $uStmt->execute([$order['user_id']]);
            $signupEmail = $uStmt->fetchColumn();
        }

        require_once __DIR__ . '/../helpers/MailHelper.php';
        $success = MailHelper::sendOrderStatusNotification($order, $order['status'], $signupEmail);

        if ($success) {
            respondSuccess(null, 200, 'Customer notified successfully via email.');
        } else {
            respondError('Failed to send notification email. Please check SMTP settings.');
        }
    }

    // Admin: Delete order
    public function destroy(string $id): void {
        JWT::requireAdmin();
        try {
            // First check if order exists
            $stmt = $this->db->prepare('SELECT id FROM orders WHERE id = ?');
            $stmt->execute([$id]);
            $order = $stmt->fetch();
            if (!$order) {
                respondError('Order not found.', 404);
                return;
            }

            // Delete the order. Since order_items has ON DELETE CASCADE on order_id, it will automatically delete related items.
            $deleteStmt = $this->db->prepare('DELETE FROM orders WHERE id = ?');
            $deleteStmt->execute([$id]);

            respondSuccess(null, 200, 'Order deleted successfully.');
        } catch (Exception $e) {
            respondError('Failed to delete order: ' . $e->getMessage(), 500);
        }
    }
}
