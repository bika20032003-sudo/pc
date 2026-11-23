<?php
/**
 * بوابة التحديث الذاتي للقوة العمومية - وزارة الداخلية - مديرية أمن أوباري
 * مخصصة للاستضافات المشتركة وخوادم cPanel (Apache / LiteSpeed / Nginx)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'طريقة الطلب غير صالحة'], JSON_UNESCAPED_UNICODE);
    exit;
}

function normalizeDigits($str) {
    if (!$str) return '';
    $arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    $english = ['0','1','2','3','4','5','6','7','8','9'];
    $str = str_replace($arabic, $english, strval($str));
    return preg_replace('/[^0-9]/', '', $str);
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if (!$body || (empty($body['id']) && empty($body['national_id']) && empty($body['financial_number'])) || empty($body['updates'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'بيانات التحديث غير مكتملة'], JSON_UNESCAPED_UNICODE);
    exit;
}

$memberId = intval($body['id'] ?? 0);
$nationalId = normalizeDigits($body['national_id'] ?? '');
$financialNumber = normalizeDigits($body['financial_number'] ?? '');
$updates = is_array($body['updates']) ? $body['updates'] : [];

// مسار حفظ وتخزين بيانات القوة العمومية على خادم cPanel
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$dataFile = $dataDir . '/force_data.json';

// البحث عن الملف أو نسخه من المسارات البديلة إن لم يكن موجوداً
if (!file_exists($dataFile) || filesize($dataFile) < 100) {
    $altPaths = [
        __DIR__ . '/../data/force_data.json',
        __DIR__ . '/force_data.json',
        dirname(__DIR__, 2) . '/client/src/data/force_data.json',
        dirname(__DIR__, 2) . '/server/src/data/force_data.json'
    ];
    foreach ($altPaths as $alt) {
        if (file_exists($alt) && filesize($alt) > 1000) {
            @copy($alt, $dataFile);
            break;
        }
    }
}

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, '[]');
}

// قراءة محتوى الملف كاملاً وبأمان تام
$content = @file_get_contents($dataFile);
$list = json_decode($content, true);
if (!is_array($list) || empty($list)) {
    // محاولة قراءة احتياطية بديلة
    $altPaths = [
        __DIR__ . '/../data/force_data.json',
        __DIR__ . '/force_data.json',
        dirname(__DIR__, 2) . '/client/src/data/force_data.json',
        dirname(__DIR__, 2) . '/server/src/data/force_data.json'
    ];
    foreach ($altPaths as $alt) {
        if (file_exists($alt)) {
            $altContent = @file_get_contents($alt);
            $altList = json_decode($altContent, true);
            if (is_array($altList) && count($altList) > 0) {
                $list = $altList;
                @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
                break;
            }
        }
    }
}

if (!is_array($list)) {
    $list = [];
}

$found = false;
$updatedItem = null;
$matchedId = null;

// البحث عن القيد بمرونة ودقة عالية لمنع أي خطأ بسبب تطابق المعرف أو الرقم الوطني أو المالي
foreach ($list as &$item) {
    $itemId = intval($item['id'] ?? 0);
    $itemNat = normalizeDigits($item['national_id'] ?? '');
    $itemFin = normalizeDigits($item['financial_number'] ?? '');
    $itemJob = normalizeDigits($item['job_number'] ?? '');

    $matchesId = ($memberId > 0 && $itemId === $memberId);
    $matchesNat = (!empty($nationalId) && $itemNat === $nationalId);
    $matchesFin = (!empty($financialNumber) && ($itemFin === $financialNumber || $itemJob === $financialNumber));

    if ($matchesId || $matchesNat || $matchesFin) {
        // الحقول السيادية المحمية ضد التعديل
        $sovereignFields = ['id', 'name', 'national_id', 'job_title', 'type', 'department'];

        // تطبيق التحديثات المسموح بها
        foreach ($updates as $key => $val) {
            if (in_array($key, $sovereignFields)) {
                continue; // حماية الحقول السيادية
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

if ($found) {
    // كتابة وحفظ البيانات في الملف مع قفل حصري
    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'تم حفظ وتحديث واستكمال بيانات المنتسب بنجاح في قاعدة البيانات المركزية',
        'memberId' => $matchedId,
        'data' => $updatedItem,
        'updated_at' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'لم يتم العثور على القيد المطلوب بالقوة العمومية'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
