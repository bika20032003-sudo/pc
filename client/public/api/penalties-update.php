<?php
/**
 * تقييد وتحديث وحذف العقوبات الانضباطية - وزارة الداخلية - مديرية أمن أوباري
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

$dataFile = __DIR__ . '/data/penalties_data.json';
$action = $body['action'];

$outcome = withLockedJsonFile($dataFile, function ($list) use ($action, $body) {
    if ($action === 'add') {
        $penalty = $body['penalty'] ?? null;
        if (!$penalty || empty($penalty['FullName']) || empty($penalty['Reason'])) {
            return ['save' => false, 'status' => 400, 'message' => 'بيانات العقوبة غير مكتملة'];
        }
        if (empty($penalty['PenaltyID'])) {
            $penalty['PenaltyID'] = intval(microtime(true) * 1000);
        }
        array_unshift($list, $penalty);
        return ['save' => true, 'list' => $list, 'payload' => ['success' => true, 'message' => 'تم توثيق العقوبة الانضباطية بنجاح', 'penalty' => $penalty]];
    }

    if ($action === 'delete') {
        $id = intval($body['penalty_id'] ?? 0);
        $list = array_values(array_filter($list, function ($p) use ($id) {
            return intval($p['PenaltyID'] ?? 0) !== $id;
        }));
        return ['save' => true, 'list' => $list, 'payload' => ['success' => true, 'message' => 'تم حذف القيد التأديبي بنجاح']];
    }

    if ($action === 'toggle_applied') {
        $id = intval($body['penalty_id'] ?? 0);
        foreach ($list as &$p) {
            if (intval($p['PenaltyID'] ?? 0) === $id) {
                $p['IsApplied'] = empty($p['IsApplied']);
                break;
            }
        }
        return ['save' => true, 'list' => $list, 'payload' => ['success' => true, 'message' => 'تم تعديل حالة تنفيذ العقوبة بنجاح']];
    }

    return ['save' => false, 'status' => 400, 'message' => 'إجراء غير معروف'];
});

if (!empty($outcome['status'])) {
    http_response_code($outcome['status']);
    echo json_encode(['success' => false, 'message' => $outcome['message']], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode($outcome['payload'] ?? ['success' => false, 'message' => 'تعذر تنفيذ العملية'], JSON_UNESCAPED_UNICODE);
