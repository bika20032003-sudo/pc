<?php
/**
 * بوابة التحديث الذاتي للقوة العمومية - وزارة الداخلية - مديرية أمن أوباري
 * مخصصة للاستضافات المشتركة وخوادم cPanel (Apache / LiteSpeed / Nginx)
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

if (!$body || empty($body['id']) || empty($body['updates'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'بيانات التحديث غير مكتملة'], JSON_UNESCAPED_UNICODE);
    exit;
}

$memberId = intval($body['id']);
$nationalId = normalizeDigits($body['national_id'] ?? '');
$updates = $body['updates'];

// مسار حفظ وتخزين بيانات القوة العمومية على خادم cPanel
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$dataFile = $dataDir . '/force_data.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, '[]');
}

// قراءة وتحديث البيانات مع استخدام قفل حصري (flock LOCK_EX) لمنع تداخل الطلبات المتزامنة
$fp = fopen($dataFile, 'c+');
if ($fp && flock($fp, LOCK_EX)) {
    $fileSize = filesize($dataFile);
    $content = $fileSize > 0 ? fread($fp, $fileSize) : '[]';
    $list = json_decode($content, true);
    if (!is_array($list)) {
        $list = [];
    }

    $found = false;
    $updatedItem = null;

    foreach ($list as &$item) {
        if (intval($item['id']) === $memberId) {
            // التحقق من الهوية برقم الهوية الوطني (12 رقماً) أو الإداري (10 أرقام)
            $itemNat = normalizeDigits($item['national_id'] ?? '');
            if (!empty($nationalId) && $itemNat !== $nationalId) {
                flock($fp, LOCK_UN);
                fclose($fp);
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'تعذر التحقق الأمني: عدم مطابقة الرقم الوطني أو الإداري للمنتسب'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // الحقول السيادية المحمية ضد التعديل
            $sovereignFields = ['id', 'name', 'national_id', 'job_title', 'type', 'department'];

            // تطبيق التحديثات المسموح بها فقط
            foreach ($updates as $key => $val) {
                if (in_array($key, $sovereignFields)) {
                    continue; // منع المساس بالحقول السيادية
                }
                $item[$key] = is_string($val) ? trim($val) : $val;
            }

            $item['updated_at'] = date('Y-m-d H:i:s');
            $found = true;
            $updatedItem = $item;
            break;
        }
    }

    if ($found) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        echo json_encode([
            'success' => true,
            'message' => 'تم حفظ وتحديث واستكمال بيانات المنتسب بنجاح في قاعدة البيانات المركزية',
            'memberId' => $memberId,
            'data' => $updatedItem,
            'updated_at' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        flock($fp, LOCK_UN);
        fclose($fp);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'لم يتم العثور على القيد المطلوب بالقوة العمومية'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'تعذر إقفال ملف البيانات للكتابة بسبب الضغط المتزامن، يرجى المحاولة بعد لحظات'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
