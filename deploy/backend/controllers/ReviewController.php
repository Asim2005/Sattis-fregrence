<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class ReviewController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(?string $productId): void {
        if (!$productId) respondError('Product ID required.');
        $stmt = $this->db->prepare('SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC');
        $stmt->execute([$productId]);
        respondSuccess($stmt->fetchAll());
    }

    public function adminAll(): void {
        JWT::requireAdmin();
        $stmt = $this->db->prepare('SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC');
        $stmt->execute();
        respondSuccess($stmt->fetchAll());
    }

    public function store(): void {
        $data = getRequestBody();
        if (empty($data['product_id']) || empty($data['rating']) || empty($data['reviewer_name']))
            respondError('Product ID, rating, and name are required.');

        $userId = null;
        $payload = JWT::getFromRequest();
        if ($payload) $userId = $payload['id'];

        $images = null;
        if (!empty($data['images']) && is_array($data['images'])) {
            $images = json_encode($data['images']);
        }

        $stmt = $this->db->prepare('INSERT INTO reviews (product_id, user_id, reviewer_name, reviewer_email, rating, title, body, images, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)');
        $stmt->execute([
            $data['product_id'], 
            $userId, 
            $data['reviewer_name'], 
            $data['reviewer_email'] ?? null, 
            $data['rating'], 
            $data['title'] ?? null, 
            $data['body'] ?? null,
            $images
        ]);
        respondSuccess(['id' => $this->db->lastInsertId()], 201, 'Review submitted successfully.');
    }

    public function update(?string $id): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $stmt = $this->db->prepare('UPDATE reviews SET is_approved = ? WHERE id = ?');
        $stmt->execute([$data['is_approved'] ?? 1, $id]);
        respondSuccess(null, 200, 'Review updated.');
    }

    public function destroy(?string $id): void {
        JWT::requireAdmin();
        $this->db->prepare('DELETE FROM reviews WHERE id = ?')->execute([$id]);
        respondSuccess(null, 200, 'Review deleted.');
    }
}
