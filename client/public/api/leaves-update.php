<?php
/**
 * تسجيل وتحديث ومباشرة الإجازات - وزارة الداخلية - مديرية أمن أوباري
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if (!$body || empty($body['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'بيانات الطلب غير صالحة'], JSON_UNESCAPED_UNICODE);
    exit;
}

$dataFile = __DIR__ . '/data/leaves_data.json';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$list = [];
if (file_exists($dataFile)) {
    $content = @file_get_contents($dataFile);
    $parsed = json_decode($content, true);
    if (is_array($parsed)) {
        $list = $parsed;
    }
}

$action = $body['action']; // 'add', 'resume', 'delete'

if ($action === 'add') {
    $leave = $body['leave'] ?? null;
    if (!$leave || empty($leave['FullName']) || empty($leave['StartDate']) || empty($leave['EndDate'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'بيانات الإجازة غير مكتملة'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($leave['id'])) {
        $leave['id'] = intval(microtime(true) * 1000);
    }
    array_unshift($list, $leave);

    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'تم توثيق الإجازة الرسمية بنجاح',
        'leave' => $leave
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'resume') {
    $id = intval($body['leave_id'] ?? 0);
    foreach ($list as &$l) {
        if (intval($l['id'] ?? 0) === $id) {
            $l['Status'] = 'باشر العمل';
            $l['ResumptionDate'] = $body['resumption_date'] ?? date('Y-m-d');
            break;
        }
    }

    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode(['success' => true, 'message' => 'تم تسجيل مباشرة العمل بنجاح'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'delete') {
    $id = intval($body['leave_id'] ?? 0);
    $list = array_values(array_filter($list, function($l) use ($id) {
        return intval($l['id'] ?? 0) !== $id;
    }));

    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode(['success' => true, 'message' => 'تم حذف قيد الإجازة بنجاح'], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'إجراء غير معروف'], JSON_UNESCAPED_UNICODE);
