<?php
// ============================================================
// Main API Router - index.php
// ============================================================
// All API requests are routed through this file via .htaccess
// ============================================================

// CRITICAL: Disable display_errors so PHP warnings/notices never
// pollute the JSON response body. Errors still go to error_log.
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/jwt.php';

setCORSHeaders();

// Parse the route from PATH_INFO (cPanel production) or REQUEST_URI (local XAMPP dev)
if (!empty($_SERVER['PATH_INFO'])) {
    // Production: root .htaccess routes /api/* → backend/index.php/<route>
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
} else {
    // Local XAMPP: Vite proxy forwards /api/* → /Sattis-fregrence/backend/<route>
    $uri   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri   = str_replace('/api', '', $uri);
    $parts = explode('/', trim($uri, '/'));
    $idx   = array_search('backend', $parts);
    if ($idx !== false) {
        $parts = array_slice($parts, $idx + 1);
    }
}

$resource = $parts[0] ?? '';
$id       = $parts[1] ?? null;
$action   = $parts[2] ?? null;
$method   = $_SERVER['REQUEST_METHOD'];

// Route to appropriate controller
switch ($resource) {
    case 'auth':
        require_once __DIR__ . '/controllers/AuthController.php';
        $controller = new AuthController();
        if ($id === 'login')    $controller->login();
        elseif ($id === 'register') $controller->register();
        elseif ($id === 'me')       $controller->me();
        elseif ($id === 'users')    $controller->listAllUsers();
        else respondError('Auth route not found.', 404);
        break;

    case 'products':
        require_once __DIR__ . '/controllers/ProductController.php';
        $controller = new ProductController();
        if ($method === 'GET' && !$id)   $controller->index();
        elseif ($method === 'GET' && $id) $controller->show($id);
        elseif ($method === 'POST')       $controller->store();
        elseif ($method === 'PUT')        $controller->update($id);
        elseif ($method === 'DELETE')     $controller->destroy($id);
        else respondError('Method not allowed.', 405);
        break;

    case 'categories':
        require_once __DIR__ . '/controllers/CategoryController.php';
        $controller = new CategoryController();
        if ($method === 'GET' && !$id)   $controller->index();
        elseif ($method === 'GET' && $id) $controller->show($id);
        elseif ($method === 'POST')       $controller->store();
        elseif ($method === 'PUT')        $controller->update($id);
        elseif ($method === 'DELETE')     $controller->destroy($id);
        else respondError('Method not allowed.', 405);
        break;

    case 'orders':
        require_once __DIR__ . '/controllers/OrderController.php';
        $controller = new OrderController();
        if ($method === 'POST' && $id && $action === 'notify-status') $controller->notifyStatus($id);
        elseif ($method === 'GET' && !$id)   $controller->index();
        elseif ($method === 'GET' && $id) $controller->show($id);
        elseif ($method === 'POST')       $controller->store();
        elseif ($method === 'PUT')        $controller->update($id);
        elseif ($method === 'DELETE' && $id)  $controller->destroy($id);
        else respondError('Method not allowed.', 405);
        break;

    case 'reviews':
        require_once __DIR__ . '/controllers/ReviewController.php';
        $controller = new ReviewController();
        if ($id === 'admin' && $action === 'all') $controller->adminAll();
        elseif ($method === 'GET')    $controller->index($id);
        elseif ($method === 'POST')  $controller->store();
        elseif ($method === 'PUT')   $controller->update($id);
        elseif ($method === 'DELETE') $controller->destroy($id);
        else respondError('Method not allowed.', 405);
        break;

    case 'hero':
        require_once __DIR__ . '/controllers/HeroController.php';
        $controller = new HeroController();
        if ($method === 'GET')    $controller->index();
        elseif ($method === 'POST')  $controller->store();
        elseif ($method === 'PUT')   $controller->update($id);
        elseif ($method === 'DELETE') $controller->destroy($id);
        else respondError('Method not allowed.', 405);
        break;

    case 'settings':
        require_once __DIR__ . '/controllers/SettingsController.php';
        $controller = new SettingsController();
        if ($method === 'GET')                          $controller->index();
        elseif ($method === 'POST' && $id === 'test-smtp') $controller->testSmtp();
        elseif ($method === 'POST')                     $controller->update();
        else respondError('Method not allowed.', 405);
        break;

    case 'analytics':
        require_once __DIR__ . '/controllers/AnalyticsController.php';
        $controller = new AnalyticsController();
        $controller->index();
        break;

    case 'newsletter':
        require_once __DIR__ . '/controllers/NewsletterController.php';
        $controller = new NewsletterController();
        if ($method === 'POST' && $id === 'send-campaign') $controller->sendCampaign();
        elseif ($method === 'GET') $controller->index();
        elseif ($method === 'POST') $controller->subscribe();
        else respondError('Method not allowed.', 405);
        break;

    case 'discover-boxes':
        require_once __DIR__ . '/controllers/DiscoverController.php';
        $controller = new DiscoverController();
        if ($method === 'GET') $controller->index();
        elseif (($method === 'PUT' || $method === 'POST') && $id) $controller->update($id);
        elseif ($method === 'POST') $controller->update();
        else respondError('Method not allowed.', 405);
        break;


    case 'coupons':
        require_once __DIR__ . '/controllers/CouponController.php';
        $controller = new CouponController();
        if ($method === 'GET' && $id === 'validate') $controller->validate($parts[2] ?? '');
        elseif ($method === 'GET')     $controller->index();
        elseif ($method === 'POST')    $controller->store();
        elseif ($method === 'PUT')     $controller->update($id);
        elseif ($method === 'DELETE')  $controller->destroy($id);
        else respondError('Method not allowed.', 405);
        break;

    case 'contact':
        require_once __DIR__ . '/controllers/ContactController.php';
        $controller = new ContactController();
        if ($method === 'POST') $controller->submit();
        else respondError('Method not allowed.', 405);
        break;

    case 'upload':
        require_once __DIR__ . '/controllers/UploadController.php';
        $controller = new UploadController();
        $controller->upload();
        break;

    default:
        respondError('API route not found.', 404);
}
