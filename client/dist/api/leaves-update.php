<?php
/**
 * تسجيل وتحديث ومباشرة الإجازات - وزارة الداخلية - مديرية أمن أوباري
 */
require_once __DIR__ . '/_security.php';
sendCorsHeaders('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'طريقة الطلب غير صالحة'], JSON_UNESCAPED_UNICODE);
    exit;
}

requireApiAuth();

$body = json_decode(file_get_contents('php://input'), true);
if (!$body || empty($body['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'بيانات الطلب غير صالحة'], JSON_UNESCAPED_UNICODE);
    exit;
}

$dataFile = __DIR__ . '/data/leaves_data.json';
$action = $body['action'];

$outcome = withLockedJsonFile($dataFile, function ($list) use ($action, $body) {
    if ($action === 'add') {
        $leave = $body['leave'] ?? null;
        if (!$leave || empty($leave['FullName']) || empty($leave['StartDate']) || empty($leave['EndDate'])) {
            return ['save' => false, 'status' => 400, 'message' => 'بيانات الإجازة غير مكتملة'];
        }
        if (empty($leave['id'])) {
            $leave['id'] = intval(microtime(true) * 1000);
        }
        array_unshift($list, $leave);
        return ['save' => true, 'list' => $list, 'payload' => ['success' => true, 'message' => 'تم توثيق الإجازة الرسمية بنجاح', 'leave' => $leave]];
    }

    if ($action === 'resume') {
        $id = intval($body['leave_id'] ?? 0);
        foreach ($list as &$l) {
            if (intval($l['id'] ?? 0) === $id || intval($l['LeaveID'] ?? 0) === $id) {
                $l['Status'] = 'باشر العمل';
                $l['ResumptionDate'] = $body['resumption_date'] ?? date('Y-m-d');
                break;
            }
        }
        return ['save' => true, 'list' => $list, 'payload' => ['success' => true, 'message' => 'تم تسجيل مباشرة العمل بنجاح']];
    }

    if ($action === 'delete') {
        $id = intval($body['leave_id'] ?? 0);
        $list = array_values(array_filter($list, function ($l) use ($id) {
            return intval($l['id'] ?? 0) !== $id && intval($l['LeaveID'] ?? 0) !== $id;
        }));
        return ['save' => true, 'list' => $list, 'payload' => ['success' => true, 'message' => 'تم حذف قيد الإجازة بنجاح']];
    }

    return ['save' => false, 'status' => 400, 'message' => 'إجراء غير معروف'];
});

if (!empty($outcome['status'])) {
    http_response_code($outcome['status']);
    echo json_encode(['success' => false, 'message' => $outcome['message']], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode($outcome['payload'] ?? ['success' => false, 'message' => 'تعذر تنفيذ العملية'], JSON_UNESCAPED_UNICODE);
