<?php
/**
 * جلب سجلات القوة العمومية المركزية - وزارة الداخلية - مديرية أمن أوباري
 * مخصص لخوادم واستضافات cPanel المشتركة والخاصة
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/data/force_data.json';

if (!file_exists($dataFile)) {
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0755, true);
    }
}

if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $data = json_decode($content, true);
    if (!is_array($data)) {
        $data = [];
    }
    echo json_encode([
        'success' => true,
        'total' => count($data),
        'data' => $data,
        'server_time' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => true,
        'total' => 0,
        'data' => [],
        'server_time' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
}
