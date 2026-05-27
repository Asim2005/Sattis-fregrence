<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class AnalyticsController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        JWT::requireAdmin();

        // Total revenue
        $revenue = $this->db->query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status != 'cancelled'")->fetch()['total'];

        // Total orders
        $totalOrders = $this->db->query("SELECT COUNT(*) as count FROM orders")->fetch()['count'];

        // Orders by status
        $ordersByStatus = $this->db->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status")->fetchAll();

        // Total users
        $totalUsers = $this->db->query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'")->fetch()['count'];

        // Total products
        $totalProducts = $this->db->query("SELECT COUNT(*) as count FROM products WHERE is_active = 1")->fetch()['count'];

        // Low stock (less than 5)
        $lowStock = $this->db->query("SELECT id, name, stock FROM products WHERE stock < 5 AND is_active = 1 ORDER BY stock ASC")->fetchAll();

        // Recent orders (last 10)
        $recentOrders = $this->db->query("SELECT id, full_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10")->fetchAll();

        // Revenue last 7 days
        $dailyRevenue = $this->db->query("SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status != 'cancelled' GROUP BY DATE(created_at) ORDER BY date ASC")->fetchAll();

        // Top selling products
        $topProducts = $this->db->query("SELECT p.name, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY oi.product_id ORDER BY units_sold DESC LIMIT 5")->fetchAll();

        respondSuccess([
            'revenue'         => $revenue,
            'total_orders'    => $totalOrders,
            'total_users'     => $totalUsers,
            'total_products'  => $totalProducts,
            'orders_by_status'=> $ordersByStatus,
            'low_stock'       => $lowStock,
            'recent_orders'   => $recentOrders,
            'daily_revenue'   => $dailyRevenue,
            'top_products'    => $topProducts,
        ]);
    }
}
