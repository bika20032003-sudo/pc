<?php
/**
 * جلب سجلات القوة العمومية المركزية - مديرية أمن أوباري
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
    // ملف احتياطي في حال عدم إنشاء ملف البيانات الجديد
    $fallbackPath = __DIR__ . '/../../server/src/data/force_data.json';
    if (file_exists($fallbackPath)) {
        $dataFile = $fallbackPath;
    }
}

if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    echo $content;
} else {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}
