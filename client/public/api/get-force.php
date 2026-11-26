<?php
/**
 * جلب سجلات القوة العمومية المركزية - وزارة الداخلية - مديرية أمن أوباري
 */
require_once __DIR__ . '/_security.php';
sendCorsHeaders('GET, POST, OPTIONS');

$dataFile = __DIR__ . '/data/force_data.json';

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

// دعم الاستعلام الذاتي الفردي المحمي بالتحقق الثنائي (الرقم الوطني/الإداري + رقم القيد)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $ident = normalizeDigits($body['identifier'] ?? $body['national_id'] ?? $body['financial_number'] ?? '');
    $rec = normalizeDigits($body['record_number'] ?? '');

    if (empty($ident) || empty($rec)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'الرقم الوطني/الإداري ورقم القيد مطلوبان'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    foreach ($data as $item) {
        $itemNat = normalizeDigits($item['national_id'] ?? '');
        $itemFin = normalizeDigits($item['financial_number'] ?? '');
        $itemJob = normalizeDigits($item['job_number'] ?? '');
        $itemRec = normalizeDigits($item['family_record'] ?? ($item['record_number'] ?? ''));

        $identMatch = ($itemNat && $itemNat === $ident) || ($itemFin && $itemFin === $ident) || ($itemJob && $itemJob === $ident);
        if ($identMatch && $itemRec && $itemRec === $rec) {
            echo json_encode(['success' => true, 'data' => $item], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'فشل التحقق الثنائي: البيانات غير متطابقة أو رقم القيد غير مربوط'], JSON_UNESCAPED_UNICODE);
    exit;
}

// القراءة الشاملة تتطلب مصادقة صالحة
requireApiAuth();

echo json_encode([
    'success' => true,
    'total' => count($data),
    'data' => $data,
    'server_time' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
