<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';
$userId = require_user_id();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT state_json, updated_at FROM app_state WHERE user_id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    respond(['ok' => true, 'data' => $row ? json_decode($row['state_json'], true) : null, 'updatedAt' => $row['updated_at'] ?? null]);
}
if ($method === 'PUT') {
    $body = read_json_body();
    $data = $body['data'] ?? null;
    if (!is_array($data)) respond(['ok' => false, 'error' => 'A JSON object in the data field is required.'], 422);
    $encoded = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($encoded === false || strlen($encoded) > 1000000) respond(['ok' => false, 'error' => 'State is invalid or larger than 1 MB.'], 422);
    $stmt = $pdo->prepare('INSERT INTO app_state (user_id, state_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE state_json = VALUES(state_json)');
    $stmt->execute([$userId, $encoded]);
    respond(['ok' => true, 'updatedAt' => date(DATE_ATOM)]);
}
respond(['ok' => false, 'error' => 'Method not allowed.'], 405);
