<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class CouponController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        JWT::requireAdmin();
        $stmt = $this->db->prepare('SELECT * FROM coupons ORDER BY created_at DESC');
        $stmt->execute();
        respondSuccess($stmt->fetchAll());
    }

    public function validate(string $code): void {
        $stmt = $this->db->prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$code]);
        $coupon = $stmt->fetch();

        if (!$coupon) respondError('Invalid or inactive coupon code.', 404);

        // Check expiry
        if ($coupon['expiry_date'] && strtotime($coupon['expiry_date']) < time()) {
            respondError('This coupon has expired.', 400);
        }

        // Check usage limit
        if ($coupon['usage_limit'] > 0 && $coupon['used_count'] >= $coupon['usage_limit']) {
            respondError('This coupon has reached its usage limit.', 400);
        }

        respondSuccess($coupon);
    }

    public function store(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        if (empty($data['code']) || !isset($data['discount_value']))
            respondError('Code and discount value are required.');

        $stmt = $this->db->prepare('INSERT INTO coupons (code, discount_type, discount_value, usage_limit, expiry_date, is_active) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            strtoupper($data['code']),
            $data['discount_type'] ?? 'percentage',
            $data['discount_value'],
            $data['usage_limit'] ?? 0,
            !empty($data['expiry_date']) ? $data['expiry_date'] : null,
            $data['is_active'] ?? 1
        ]);
        respondSuccess(['id' => $this->db->lastInsertId()], 201, 'Coupon created.');
    }

    public function update(string $id): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $stmt = $this->db->prepare('UPDATE coupons SET discount_type=?, discount_value=?, usage_limit=?, expiry_date=?, is_active=? WHERE id=?');
        $stmt->execute([
            $data['discount_type'] ?? 'percentage',
            $data['discount_value'],
            $data['usage_limit'] ?? 0,
            !empty($data['expiry_date']) ? $data['expiry_date'] : null,
            $data['is_active'] ?? 1,
            $id
        ]);
        respondSuccess(null, 200, 'Coupon updated.');
    }

    public function destroy(string $id): void {
        JWT::requireAdmin();
        $this->db->prepare('DELETE FROM coupons WHERE id = ?')->execute([$id]);
        respondSuccess(null, 200, 'Coupon deleted.');
    }
}
