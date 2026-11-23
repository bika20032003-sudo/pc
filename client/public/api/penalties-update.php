<?php
/**
 * تقييد وتحديث وحذف العقوبات الانضباطية - وزارة الداخلية - مديرية أمن أوباري
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

$dataFile = __DIR__ . '/data/penalties_data.json';
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

$action = $body['action']; // 'add', 'toggle_applied', 'delete'

if ($action === 'add') {
    $penalty = $body['penalty'] ?? null;
    if (!$penalty || empty($penalty['FullName']) || empty($penalty['Reason'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'بيانات العقوبة غير مكتملة'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (empty($penalty['PenaltyID'])) {
        $penalty['PenaltyID'] = intval(microtime(true) * 1000);
    }
    array_unshift($list, $penalty);

    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode([
        'success' => true,
        'message' => 'تم توثيق العقوبة الانضباطية بنجاح',
        'penalty' => $penalty
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'delete') {
    $id = intval($body['penalty_id'] ?? 0);
    $list = array_values(array_filter($list, function($p) use ($id) {
        return intval($p['PenaltyID'] ?? 0) !== $id;
    }));

    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode(['success' => true, 'message' => 'تم حذف القيد التأديبي بنجاح'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'toggle_applied') {
    $id = intval($body['penalty_id'] ?? 0);
    foreach ($list as &$p) {
        if (intval($p['PenaltyID'] ?? 0) === $id) {
            $p['IsApplied'] = !empty($p['IsApplied']) ? false : true;
            break;
        }
    }

    @file_put_contents($dataFile, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

    echo json_encode(['success' => true, 'message' => 'تم تعديل حالة تنفيذ العقوبة بنجاح'], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'إجراء غير معروف'], JSON_UNESCAPED_UNICODE);
