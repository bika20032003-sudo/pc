<?php
/**
 * بوابة التحديث الذاتي للقوة العمومية - وزارة الداخلية - مديرية أمن أوباري
 * مخصصة للاستضافات المشتركة وخوادم cPanel مع تحقق ثنائي صارم (AND) وقفل ذري
 */
require_once __DIR__ . '/_security.php';
sendCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'طريقة الطلب غير صالحة'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

$memberId = intval($body['id'] ?? 0);
$nationalId = normalizeDigits($body['national_id'] ?? '');
$financialNumber = normalizeDigits($body['financial_number'] ?? '');
$recordNumber = normalizeDigits($body['record_number'] ?? ($body['updates']['family_record'] ?? ''));
$updates = is_array($body['updates'] ?? null) ? $body['updates'] : [];

if (!$body || (empty($nationalId) && empty($financialNumber)) || empty($recordNumber) || empty($updates)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'بيانات التحقق الثنائي أو التحديث غير مكتملة'], JSON_UNESCAPED_UNICODE);
    exit;
}

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
            if (!is_dir($dataDir)) @mkdir($dataDir, 0755, true);
            @copy($alt, $dataFile);
            break;
        }
    }
}

$outcome = withLockedJsonFile($dataFile, function ($list) use ($memberId, $nationalId, $financialNumber, $recordNumber, $updates) {
    $found = false;
    $updatedItem = null;
    $matchedId = null;

    foreach ($list as &$item) {
        $itemId = intval($item['id'] ?? 0);
        $itemNat = normalizeDigits($item['national_id'] ?? '');
        $itemFin = normalizeDigits($item['financial_number'] ?? '');
        $itemJob = normalizeDigits($item['job_number'] ?? '');
        $itemRec = normalizeDigits($item['family_record'] ?? ($item['record_number'] ?? ''));

        $matchesId = ($memberId <= 0 || $itemId === $memberId);
        $matchesNat = (!empty($nationalId) && $itemNat === $nationalId);
        $matchesFin = (!empty($financialNumber) && ($itemFin === $financialNumber || $itemJob === $financialNumber));
        $matchesRec = (!empty($itemRec) && $itemRec === $recordNumber);

        // تحقق صارم (AND): يجب تطابق المعرف (إن وجد) مع الرقم الوطني/المالي ومع رقم القيد معاً
        if ($matchesId && ($matchesNat || $matchesFin) && $matchesRec) {
            $sovereignFields = ['id', 'name', 'national_id', 'financial_number', 'job_number', 'job_title', 'type', 'department'];

            foreach ($updates as $key => $val) {
                if (in_array($key, $sovereignFields, true)) {
                    continue;
                }
                $item[$key] = is_string($val) ? trim($val) : $val;
            }

            $item['self_updated'] = true;
            $item['updated_at'] = date('Y-m-d H:i:s');
            $found = true;
            $matchedId = $itemId;
            $updatedItem = $item;
            break;
        }
    }

    if (!$found) {
        return ['save' => false, 'found' => false];
    }

    return [
        'save' => true,
        'list' => $list,
        'found' => true,
        'matchedId' => $matchedId,
        'updatedItem' => $updatedItem
    ];
});

if (!empty($outcome['found'])) {
    echo json_encode([
        'success' => true,
        'message' => 'تم حفظ وتحديث واستكمال بيانات المنتسب بنجاح في قاعدة البيانات المركزية',
        'memberId' => $outcome['matchedId'],
        'data' => $outcome['updatedItem'],
        'updated_at' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(403);
echo json_encode([
    'success' => false,
    'message' => 'فشل التحقق الأمني: تعذر مطابقة الرقم الوطني/المالي مع رقم القيد'
], JSON_UNESCAPED_UNICODE);
