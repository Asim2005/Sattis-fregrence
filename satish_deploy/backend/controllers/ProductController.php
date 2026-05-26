<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class ProductController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void {
        $category  = $_GET['category'] ?? null;
        $search    = $_GET['search'] ?? null;
        $featured  = $_GET['featured'] ?? null;
        $bestseller = $_GET['bestseller'] ?? null;
        $limit     = (int)($_GET['limit'] ?? 20);
        $page      = (int)($_GET['page'] ?? 1);
        $offset    = ($page - 1) * $limit;

        $sql = 'SELECT p.*, c.name as category_name, c.slug as category_slug,
                       (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                       (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
                       (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = 1';
        $params = [];

        if ($category) { $sql .= ' AND c.slug = ?'; $params[] = $category; }
        if ($featured)  { $sql .= ' AND p.is_featured = 1'; }
        if ($bestseller) { $sql .= ' AND p.is_best_seller = 1'; }
        if ($search)    { $sql .= ' AND (p.name LIKE ? OR p.description LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; }

        $sql .= ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        // Attach all images to each product
        foreach ($products as &$product) {
            $imgStmt = $this->db->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order');
            $imgStmt->execute([$product['id']]);
            $product['images'] = $imgStmt->fetchAll();
        }

        respondSuccess($products);
    }

    public function show(string $id): void {
        $stmt = $this->db->prepare(
            'SELECT p.*, c.name as category_name, c.slug as category_slug,
                    (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = 1) as avg_rating,
                    (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = 1) as review_count
             FROM products p LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ? OR p.slug = ?'
        );
        $stmt->execute([$id, $id]);
        $product = $stmt->fetch();
        if (!$product) respondError('Product not found.', 404);

        $imgStmt = $this->db->prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order');
        $imgStmt->execute([$product['id']]);
        $product['images'] = $imgStmt->fetchAll();

        $revStmt = $this->db->prepare('SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC');
        $revStmt->execute([$product['id']]);
        $product['reviews'] = $revStmt->fetchAll();

        respondSuccess($product);
    }

    public function store(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        $required = ['category_id', 'name', 'price'];
        foreach ($required as $field) {
            if (empty($data[$field])) respondError("Field '$field' is required.");
        }
        $slug = $this->generateSlug($data['name']);
        
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO products (category_id, name, slug, short_description, description, price, size, sale_price, stock, sku, is_featured, is_best_seller, scent_notes, fragrance_family, longevity, shipping_fee, meta_title, meta_description, meta_keywords)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $data['category_id'], $data['name'], $slug,
                $data['short_description'] ?? null, $data['description'] ?? null,
                $data['price'], $data['size'] ?? '50ml', $data['sale_price'] ?? null,
                $data['stock'] ?? 0, $data['sku'] ?? null,
                $data['is_featured'] ?? 0, $data['is_bestseller'] ?? $data['is_best_seller'] ?? 0,
                $data['scent_notes'] ?? null, $data['fragrance_family'] ?? null, $data['longevity'] ?? null,
                $data['shipping_fee'] ?? 0,
                $data['meta_title'] ?? null, $data['meta_description'] ?? null, $data['meta_keywords'] ?? null
            ]);
            $productId = $this->db->lastInsertId();

            // Handle Multiple Images
            if (!empty($data['images']) && is_array($data['images'])) {
                $imgStmt = $this->db->prepare('INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES (?, ?, ?, ?)');
                foreach ($data['images'] as $index => $img) {
                    if (!$img) continue; // Skip if null/empty
                    $isPrimary = ($index === 0) ? 1 : 0;
                    $imgStmt->execute([$productId, $img, $isPrimary, $index]);
                }
            } elseif (!empty($data['primary_image'])) {
                $imgStmt = $this->db->prepare('INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)');
                $imgStmt->execute([$productId, $data['primary_image']]);
            }

            $this->db->commit();
            respondSuccess(['id' => $productId, 'slug' => $slug], 201, 'Product created.');
        } catch (Exception $e) {
            $this->db->rollBack();
            respondError('Failed to create product: ' . $e->getMessage(), 500);
        }
    }

    public function update(string $id): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        
        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'UPDATE products SET category_id=?, name=?, short_description=?, description=?, price=?, size=?, sale_price=?, stock=?, is_featured=?, is_best_seller=?, scent_notes=?, fragrance_family=?, longevity=?, is_active=?, shipping_fee=?, meta_title=?, meta_description=?, meta_keywords=? WHERE id=?'
            );
            $stmt->execute([
                $data['category_id'], $data['name'],
                $data['short_description'] ?? null, $data['description'] ?? null,
                $data['price'], $data['size'] ?? '50ml', $data['sale_price'] ?? null,
                $data['stock'] ?? 0, $data['is_featured'] ?? 0,
                $data['is_bestseller'] ?? $data['is_best_seller'] ?? 0,
                $data['scent_notes'] ?? null, $data['fragrance_family'] ?? null,
                $data['longevity'] ?? null,
                $data['is_active'] ?? 1, $data['shipping_fee'] ?? 0,
                $data['meta_title'] ?? null, $data['meta_description'] ?? null, $data['meta_keywords'] ?? null,
                $id,
            ]);

            // Sync Images
            if (isset($data['images']) && is_array($data['images'])) {
                // Remove existing images
                $this->db->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);
                
                $imgStmt = $this->db->prepare('INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES (?, ?, ?, ?)');
                foreach ($data['images'] as $index => $img) {
                    if (!$img) continue; // Skip if null
                    $isPrimary = ($index === 0) ? 1 : 0;
                    $imgStmt->execute([$id, $img, $isPrimary, $index]);
                }
            } elseif (!empty($data['primary_image'])) {
                // Fallback for single image update
                $this->db->prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?')->execute([$id]);
                $checkImg = $this->db->prepare('SELECT id FROM product_images WHERE product_id = ? AND image_path = ?');
                $checkImg->execute([$id, $data['primary_image']]);
                if ($checkImg->fetch()) {
                    $this->db->prepare('UPDATE product_images SET is_primary = 1 WHERE product_id = ? AND image_path = ?')->execute([$id, $data['primary_image']]);
                } else {
                    $this->db->prepare('INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 1)')->execute([$id, $data['primary_image']]);
                }
            }

            $this->db->commit();
            respondSuccess(null, 200, 'Product updated.');
        } catch (Exception $e) {
            $this->db->rollBack();
            respondError('Failed to update product: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(string $id): void {
        JWT::requireAdmin();
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        respondSuccess(null, 200, 'Product deleted.');
    }

    private function generateSlug(string $text): string {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text), '-'));
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM products WHERE slug = ?');
        $stmt->execute([$slug]);
        $count = $stmt->fetchColumn();
        return $count ? $slug . '-' . time() : $slug;
    }
}
