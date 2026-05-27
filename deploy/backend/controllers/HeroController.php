<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class HeroController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        $stmt = $this->db->query('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order');
        respondSuccess($stmt->fetchAll());
    }

    public function store(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        if (empty($data['image_path'])) respondError('Image path is required.');
        $stmt = $this->db->prepare('INSERT INTO hero_slides (image_path, heading, subheading, cta_text, cta_link, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$data['image_path'], $data['heading'] ?? null, $data['subheading'] ?? null, $data['cta_text'] ?? 'Shop Now', $data['cta_link'] ?? '/products', $data['sort_order'] ?? 0]);
        respondSuccess(['id' => $this->db->lastInsertId()], 201, 'Slide created.');
    }

    public function update(?string $id): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $stmt = $this->db->prepare('UPDATE hero_slides SET image_path=?, heading=?, subheading=?, cta_text=?, cta_link=?, sort_order=?, is_active=? WHERE id=?');
        $stmt->execute([$data['image_path'], $data['heading'] ?? null, $data['subheading'] ?? null, $data['cta_text'] ?? 'Shop Now', $data['cta_link'] ?? '/products', $data['sort_order'] ?? 0, $data['is_active'] ?? 1, $id]);
        respondSuccess(null, 200, 'Slide updated.');
    }

    public function destroy(?string $id): void {
        JWT::requireAdmin();
        $this->db->prepare('DELETE FROM hero_slides WHERE id = ?')->execute([$id]);
        respondSuccess(null, 200, 'Slide deleted.');
    }
}
