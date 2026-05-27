<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class DiscoverController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void {
        // Fetch all 4 slots with their mapped products (if any)
        $sql = 'SELECT d.*, p.name as product_name, p.slug as product_slug, p.price as product_price, p.sale_price as product_sale_price,
                       (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as product_image
                FROM discover_boxes d
                LEFT JOIN products p ON d.product_id = p.id
                ORDER BY d.slot_id ASC';
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        respondSuccess($stmt->fetchAll());
    }

    public function update(?string $id = null): void {
        JWT::requireAdmin();
        $data = getRequestBody();

        $slot_id = $id ?? $data['slot_id'] ?? null;
        if (!$slot_id) {
            respondError('Slot ID is required.');
        }

        // Validate values
        $product_id = !empty($data['product_id']) ? (int)$data['product_id'] : null;
        $bg_image = !empty($data['bg_image']) ? $data['bg_image'] : null;
        $title = !empty($data['title']) ? $data['title'] : null;
        $subtitle = !empty($data['subtitle']) ? $data['subtitle'] : null;

        $stmt = $this->db->prepare(
            'UPDATE discover_boxes 
             SET product_id = ?, bg_image = ?, title = ?, subtitle = ? 
             WHERE slot_id = ?'
        );
        $stmt->execute([$product_id, $bg_image, $title, $subtitle, $slot_id]);

        respondSuccess(null, 200, 'Slot updated successfully.');
    }
}
