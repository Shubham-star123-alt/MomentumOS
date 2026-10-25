<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = $method === 'POST' ? read_json_body() : [];
$action = (string)($body['action'] ?? 'me');

if ($method === 'GET' || $action === 'me') {
    if (empty($_SESSION['user_id'])) respond(['ok' => true, 'user' => null]);
    $stmt = $pdo->prepare('SELECT id, name, email FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user) { session_regenerate_id(true); $_SESSION = []; respond(['ok' => true, 'user' => null]); }
    respond(['ok' => true, 'user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email']]]);
}

if ($method !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed.'], 405);
if ($action === 'logout') { $_SESSION = []; session_regenerate_id(true); session_destroy(); respond(['ok' => true]); }

$email = strtolower(trim((string)($body['email'] ?? '')));
$password = (string)($body['password'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 || strlen($password) < 8 || strlen($password) > 4096) {
    respond(['ok' => false, 'error' => 'Use a valid email and a password of at least 8 characters.'], 422);
}

if ($action === 'signup') {
    $name = trim((string)($body['name'] ?? ''));
    if ($name === '' || mb_strlen($name) > 100) respond(['ok' => false, 'error' => 'Name is required (up to 100 characters).'], 422);
    $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $check->execute([$email]);
    if ($check->fetch()) respond(['ok' => false, 'error' => 'An account with this email already exists.'], 409);
    $insert = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    try { $insert->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]); }
    catch (PDOException $e) { respond(['ok' => false, 'error' => 'Could not create the account.'], 500); }
    $userId = (int)$pdo->lastInsertId();
} elseif ($action === 'login') {
    $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $record = $stmt->fetch();
    if (!$record || !password_verify($password, $record['password_hash'])) respond(['ok' => false, 'error' => 'Email or password is incorrect.'], 401);
    $userId = (int)$record['id'];
    $name = $record['name'];
} else {
    respond(['ok' => false, 'error' => 'Unknown action.'], 400);
}

session_regenerate_id(true);
$_SESSION['user_id'] = $userId;
respond(['ok' => true, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email]]);
