<?php
// ============================================================
// DB CONNECTION TEST — delete this file after verifying!
// Access: yourdomain.com/backend/db_test.php
// ============================================================

// Load env credentials WITHOUT triggering the Database class exit()
$envFile = __DIR__ . '/config/env.php';
if (file_exists($envFile)) {
    require_once $envFile;
    $envFound = true;
} else {
    // Fallback to db.php defaults
    require_once __DIR__ . '/config/db.php';
    $envFound = false;
}

if (!defined('DB_HOST'))    define('DB_HOST',    'localhost');
if (!defined('DB_NAME'))    define('DB_NAME',    '');
if (!defined('DB_USER'))    define('DB_USER',    '');
if (!defined('DB_PASS'))    define('DB_PASS',    '');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

// Try the connection directly — no exit(), so we get the real error
$pdo        = null;
$connError  = null;
$tables     = [];
$adminUser  = null;

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $tables    = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $adminUser = $pdo->query("SELECT name, email, role FROM users WHERE role='admin' LIMIT 1")->fetch();
} catch (PDOException $e) {
    $connError = $e->getMessage();
}

$mysqlVersion = $pdo ? $pdo->query("SELECT VERSION()")->fetchColumn() : null;

$required = [
    'users','categories','products','product_images','hero_slides',
    'coupons','orders','order_items','reviews',
    'newsletter_subscribers','site_settings','discover_boxes'
];

function badge(string $text, string $color): string {
    return "<span style='color:{$color};font-weight:600;'>{$text}</span>";
}
function row(string $label, string $value): void {
    echo "<tr>
        <td style='padding:10px 16px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;width:220px;'>{$label}</td>
        <td style='padding:10px 16px;border-bottom:1px solid #f3f4f6;'>{$value}</td>
    </tr>";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SATTIS — DB Test</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;padding:40px 20px}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;max-width:700px;margin:0 auto;overflow:hidden}
  .header{background:#000;color:#fff;padding:20px 24px}
  .header h1{font-size:18px;letter-spacing:2px}
  .header p{font-size:12px;color:#9ca3af;margin-top:4px}
  table{width:100%;border-collapse:collapse}
  .section{padding:12px 16px 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;background:#f9fafb;border-bottom:1px solid #f3f4f6}
  .error-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 16px;margin:16px 24px;font-size:13px;color:#991b1b;word-break:break-all}
  .warn-box{background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 16px;margin:16px 24px;font-size:13px;color:#92400e}
</style>
</head>
<body>
<div class="card">

  <div class="header">
    <h1>SATTIS</h1>
    <p>Database Connection Test &mdash; <?= date('Y-m-d H:i:s') ?> UTC</p>
  </div>

  <?php if ($connError): ?>
  <div class="error-box">
    <strong>Connection Failed:</strong><br>
    <?= htmlspecialchars($connError) ?><br><br>
    <strong>Credentials used:</strong><br>
    Host: <code><?= DB_HOST ?></code> &nbsp;|&nbsp;
    DB: <code><?= DB_NAME ?></code> &nbsp;|&nbsp;
    User: <code><?= DB_USER ?></code>
  </div>
  <?php endif; ?>

  <table>
    <tr><td colspan="2" class="section">PHP Environment</td></tr>
    <?php
    row('PHP Version',      badge(PHP_VERSION, version_compare(PHP_VERSION,'8.0','>=') ? '#16a34a' : '#d97706'));
    row('PDO Extension',    badge(extension_loaded('pdo')       ? 'Loaded' : 'MISSING', extension_loaded('pdo')       ? '#16a34a' : '#dc2626'));
    row('PDO MySQL Driver', badge(extension_loaded('pdo_mysql') ? 'Loaded' : 'MISSING', extension_loaded('pdo_mysql') ? '#16a34a' : '#dc2626'));
    row('env.php',          badge($envFound ? 'Found ✓' : 'Not found — using db.php defaults', $envFound ? '#16a34a' : '#d97706'));
    ?>

    <tr><td colspan="2" class="section">Credentials in Use</td></tr>
    <?php
    row('DB_HOST', '<code>' . DB_HOST . '</code>');
    row('DB_NAME', '<code>' . DB_NAME . '</code>');
    row('DB_USER', '<code>' . DB_USER . '</code>');
    row('DB_PASS', '<code>' . (DB_PASS ? str_repeat('*', strlen(DB_PASS)) : '(empty)') . '</code>');
    ?>

    <tr><td colspan="2" class="section">Database Connection</td></tr>
    <?php
    if ($pdo) {
        row('Connection',    badge('SUCCESS ✓', '#16a34a'));
        row('MySQL Version', badge($mysqlVersion, '#16a34a'));
    } else {
        row('Connection', badge('FAILED ✗ — see error above', '#dc2626'));
    }
    ?>

    <?php if ($pdo): ?>
    <tr><td colspan="2" class="section">Tables Check</td></tr>
    <?php foreach ($required as $tbl):
        if (in_array($tbl, $tables)) {
            $count = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`")->fetchColumn();
            row($tbl, badge("Exists — {$count} row(s)", '#16a34a'));
        } else {
            row($tbl, badge('MISSING — run schema.sql', '#dc2626'));
        }
    endforeach; ?>

    <tr><td colspan="2" class="section">Admin User</td></tr>
    <?php
    if ($adminUser) {
        row('Admin found', badge("{$adminUser['name']} &lt;{$adminUser['email']}&gt;", '#16a34a'));
    } else {
        row('Admin user', badge('None found — schema seed may not have run', '#d97706'));
    }
    ?>
    <?php endif; ?>

  </table>

  <div class="warn-box">
    ⚠️ <strong>Delete this file after testing.</strong>
    It exposes your database credentials — do not leave it on production.
  </div>

</div>
</body>
</html>
