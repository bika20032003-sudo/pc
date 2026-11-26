<?php
require_once __DIR__ . '/_security.php';
sendCorsHeaders('GET, OPTIONS');

echo json_encode([
    'status' => 'ok',
    'ministry' => 'وزارة الداخلية - دولة ليبيا | مديرية أمن أوباري',
    'server' => 'cPanel Production Engine',
    'time' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
