<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'status' => 'ok',
    'ministry' => 'وزارة الداخلية - دولة ليبيا | مديرية أمن أوباري',
    'server' => 'cPanel Production Engine',
    'time' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
