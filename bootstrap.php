<?php
declare(strict_types=1);

// Shared local-only API bootstrap. Create backend/config.php from config.example.php.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// Same-origin is recommended. Configure a strict allow-list here only if you intentionally use another origin.
if ($origin !== '' && !empty($_SERVER['HTTP_HOST']) && parse_url($origin, PHP_URL_HOST) === ($_SERVER['HTTP_HOST'] ?? '')) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Allow: GET, POST, PUT, OPTIONS');
    http_response_code(204);
    exit;
}

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();

$configFile = dirname(__DIR__) . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'Backend not configured. Copy config.example.php to config.php.']);
    exit;
}
$config = require $configFile;
try {
    $pdo = new PDO(
        'mysql:host=' . $config['host'] . ';dbname=' . $config['database'] . ';charset=' . ($config['charset'] ?? 'utf8mb4'),
        $config['username'],
        $config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
    );
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed. Check local backend configuration.']);
    exit;
}

function respond(array $body, int $status = 200): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
function read_json_body(): array {
    $decoded = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($decoded) ? $decoded : [];
}
function require_user_id(): int {
    $id = $_SESSION['user_id'] ?? null;
    if (!is_int($id) && !ctype_digit((string)$id)) respond(['ok' => false, 'error' => 'Authentication required.'], 401);
    return (int)$id;
}
