<?php
/**
 * جلب سجل الإجازات الرسمية - وزارة الداخلية - مديرية أمن أوباري
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/data/leaves_data.json';

if (!file_exists($dataFile) || filesize($dataFile) < 5) {
    $altPaths = [
        __DIR__ . '/../data/leaves_data.json',
        dirname(__DIR__, 2) . '/client/src/data/leaves_data.json',
        dirname(__DIR__, 2) . '/server/src/data/leaves_data.json'
    ];
    foreach ($altPaths as $alt) {
        if (file_exists($alt) && filesize($alt) > 10) {
            $dataDir = dirname($dataFile);
            if (!is_dir($dataDir)) {
                @mkdir($dataDir, 0755, true);
            }
            @copy($alt, $dataFile);
            break;
        }
    }
}

$data = [];
if (file_exists($dataFile)) {
    $content = @file_get_contents($dataFile);
    $parsed = json_decode($content, true);
    if (is_array($parsed)) {
        $data = $parsed;
    }
}

echo json_encode([
    'success' => true,
    'total' => count($data),
    'data' => $data,
    'server_time' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
