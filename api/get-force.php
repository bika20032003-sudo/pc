<?php
/**
 * جلب سجلات القوة العمومية المركزية - وزارة الداخلية - مديرية أمن أوباري
 * مخصص لخوادم واستضافات cPanel المشتركة والخاصة
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/data/force_data.json';

// التحقق من وجود الملف وسلامة حجمه أو جلبه من المسارات البديلة
if (!file_exists($dataFile) || filesize($dataFile) < 100) {
    $altPaths = [
        __DIR__ . '/../data/force_data.json',
        __DIR__ . '/force_data.json',
        dirname(__DIR__, 2) . '/client/src/data/force_data.json',
        dirname(__DIR__, 2) . '/server/src/data/force_data.json'
    ];
    foreach ($altPaths as $alt) {
        if (file_exists($alt) && filesize($alt) > 1000) {
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
    if (is_array($parsed) && count($parsed) > 0) {
        $data = $parsed;
    }
}

echo json_encode([
    'success' => true,
    'total' => count($data),
    'data' => $data,
    'server_time' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
