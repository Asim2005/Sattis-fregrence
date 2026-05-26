<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class CategoryController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        $stmt = $this->db->query('SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1 WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.sort_order');
        respondSuccess($stmt->fetchAll());
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare('SELECT * FROM categories WHERE id = ? OR slug = ?');
        $stmt->execute([$id, $id]);
        $cat = $stmt->fetch();
        if (!$cat) respondError('Category not found.', 404);
        respondSuccess($cat);
    }

    public function store(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        if (empty($data['name'])) respondError('Category name is required.');
        $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', trim($data['name'])));
        $stmt = $this->db->prepare('INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$data['name'], $slug, $data['description'] ?? null, $data['image'] ?? null, $data['sort_order'] ?? 0]);
        respondSuccess(['id' => $this->db->lastInsertId()], 201, 'Category created.');
    }

    public function update(string $id): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $stmt = $this->db->prepare('UPDATE categories SET name=?, description=?, image=?, sort_order=?, is_active=? WHERE id=?');
        $stmt->execute([$data['name'], $data['description'] ?? null, $data['image'] ?? null, $data['sort_order'] ?? 0, $data['is_active'] ?? 1, $id]);
        respondSuccess(null, 200, 'Category updated.');
    }

    public function destroy(string $id): void {
        JWT::requireAdmin();
        $this->db->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
        respondSuccess(null, 200, 'Category deleted.');
    }
}
