<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class SettingsController {
    private PDO $db;
    public function __construct() { $this->db = Database::getConnection(); }

    public function index(): void {
        $stmt = $this->db->query('SELECT setting_key, setting_value FROM site_settings');
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        respondSuccess($settings);
    }

    public function update(): void {
        JWT::requireAdmin();
        $data = getRequestBody();
        
        // Debug logging to help identify why settings are not saving
        $logFile = __DIR__ . '/../debug.log';
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'method' => $_SERVER['REQUEST_METHOD'],
            'uri' => $_SERVER['REQUEST_URI'],
            'payload_empty' => empty($data),
            'payload_keys' => array_keys($data),
            'auth_header' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NONE'
        ];
        file_put_contents($logFile, json_encode($logData) . "\n", FILE_APPEND);

        if (empty($data)) {
            respondError('No settings data received in request body.', 400);
        }
        $stmt = $this->db->prepare('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        foreach ($data as $key => $value) {
            $stmt->execute([$key, $value]);
        }
        respondSuccess(null, 200, 'Settings updated.');
    }
}
