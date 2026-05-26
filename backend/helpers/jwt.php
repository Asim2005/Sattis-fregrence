<?php
// ============================================================
// JWT Authentication Helper
// ============================================================
// Uses HS256 (HMAC-SHA256) for token signing.
// No external library needed - pure PHP implementation.
// ============================================================

define('JWT_SECRET', 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY_IN_PRODUCTION');
define('JWT_EXPIRY', 60 * 60 * 24 * 7); // 7 days in seconds

class JWT {
    public static function generate(array $payload): string {
        $header  = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $payload = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );
        return "$header.$payload.$signature";
    }

    public static function verify(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;
        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
        );

        if (!hash_equals($expectedSig, $signature)) return null;

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data || $data['exp'] < time()) return null;

        return $data;
    }

    public static function getFromRequest(): ?array {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!str_starts_with($authHeader, 'Bearer ')) return null;
        $token = substr($authHeader, 7);
        return self::verify($token);
    }

    public static function requireAuth(): array {
        $payload = self::getFromRequest();
        if (!$payload) {
            respondError('Unauthorized. Please log in.', 401);
        }
        return $payload;
    }

    public static function requireAdmin(): array {
        $payload = self::requireAuth();
        if ($payload['role'] !== 'admin') {
            respondError('Forbidden. Admin access required.', 403);
        }
        return $payload;
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
