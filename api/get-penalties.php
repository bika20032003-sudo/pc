<?php
/**
 * جلب سجلات العقوبات والجزاءات التأديبية - وزارة الداخلية - مديرية أمن أوباري
 */
require_once __DIR__ . '/_security.php';
sendCorsHeaders('GET, OPTIONS');
requireApiAuth();

$dataFile = __DIR__ . '/data/penalties_data.json';

if (!file_exists($dataFile) || filesize($dataFile) < 5) {
    $altPaths = [
        __DIR__ . '/../data/penalties_data.json',
        dirname(__DIR__, 2) . '/client/src/data/penalties_data.json',
        dirname(__DIR__, 2) . '/server/src/data/penalties_data.json'
    ];
    foreach ($altPaths as $alt) {
        if (file_exists($alt) && filesize($alt) > 10) {
            $dataDir = dirname($dataFile);
            if (!is_dir($dataDir)) @mkdir($dataDir, 0755, true);
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
    'penalties' => $data,
    'data' => $data,
    'server_time' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
