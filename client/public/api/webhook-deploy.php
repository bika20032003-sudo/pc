<?php
/**
 * منظومة وزارة الداخلية - مديرية أمن أوباري
 * سكريبت التحديث التلقائي المباشر من GitHub إلى cPanel
 * المسار: api/webhook-deploy.php
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// يجب ضبط DEPLOY_SECRET في متغيرات بيئة الاستضافة بدون أي مفتاح افتراضي ثابت
$DEPLOY_SECRET = getenv('DEPLOY_SECRET') ?: '';
if (empty($DEPLOY_SECRET)) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'message' => 'التحديث التلقائي معطّل: متغير DEPLOY_SECRET غير مهيأ في بيئة الخادم'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawPayload = file_get_contents('php://input');
$githubSig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$headerToken = $_SERVER['HTTP_X_DEPLOY_TOKEN'] ?? '';

$isAuthorized = false;
if (!empty($githubSig) && strpos($githubSig, 'sha256=') === 0) {
    $expectedSig = 'sha256=' . hash_hmac('sha256', $rawPayload, $DEPLOY_SECRET);
    $isAuthorized = hash_equals($expectedSig, $githubSig);
} elseif (!empty($headerToken)) {
    $isAuthorized = hash_equals($DEPLOY_SECRET, strval($headerToken));
}

if (!$isAuthorized) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'غير مصرح بالوصول: توقيع أو رمز التحقق غير صحيح'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rootDir = realpath(__DIR__ . '/../..');
if (!$rootDir || !is_dir($rootDir)) {
    $rootDir = realpath(__DIR__ . '/..');
}

$logFile = __DIR__ . '/data/deploy.log';
$logEntry = '[' . date('Y-m-d H:i:s') . '] بدء عملية التحديث التلقائي من GitHub...' . PHP_EOL;

// 1. محاولة التحديث عبر Git CLI إذا كان متاحاً في السيرفر
$gitOutput = [];
$gitStatus = -1;
if (function_exists('exec')) {
    $escapedRoot = escapeshellarg($rootDir);
    @exec("cd {$escapedRoot} && git pull origin gh-pages 2>&1", $gitOutput, $gitStatus);
}

if ($gitStatus === 0 && !empty($gitOutput)) {
    $logEntry .= 'تم التحديث بنجاح عبر Git CLI' . PHP_EOL;
    @file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    echo json_encode([
        'success' => true,
        'method' => 'git_pull',
        'message' => 'تم سحب وتطبيق أحدث كود بنجاح عبر Git',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. إذا لم يكن Git CLI متاحاً، يتم سحب حزمة gh-pages مباشرة وفك ضغطها بأمان
$zipUrl = 'https://codeload.github.com/bika20032003-sudo/pc/zip/refs/heads/gh-pages';
$tempZip = __DIR__ . '/data/temp_update.zip';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $zipUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Ubari-MOI-AutoDeploy/1.0');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
$zipData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || empty($zipData)) {
    $logEntry .= "فشل تنزيل حزمة التحديث من GitHub (HTTP {$httpCode})" . PHP_EOL;
    @file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => "تعذر تنزيل حزمة التحديث من GitHub (HTTP {$httpCode})"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

file_put_contents($tempZip, $zipData);

$zip = new ZipArchive();
if ($zip->open($tempZip) === TRUE) {
    $extractedFolder = 'pc-gh-pages';
    $extractPath = __DIR__ . '/data/temp_extracted';
    if (!is_dir($extractPath)) {
        @mkdir($extractPath, 0755, true);
    }

    $zip->extractTo($extractPath);
    $zip->close();
    @unlink($tempZip);

    $sourceDir = $extractPath . '/' . $extractedFolder;
    if (is_dir($sourceDir)) {
        // حماية جميع ملفات البيانات التشغيلية الحية من الاستبدال عند التحديث
        $protectedFiles = ['force_data.json', 'leaves_data.json', 'penalties_data.json', 'vehicles_data.json', 'weapons_data.json', 'deploy.log'];

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $subPath = $iterator->getSubPathName();
            if (strpos($subPath, '..') !== false) {
                continue;
            }
            $targetPath = $rootDir . '/' . $subPath;

            $isProtectedData = false;
            foreach ($protectedFiles as $pf) {
                if (strpos($subPath, $pf) !== false && file_exists($targetPath)) {
                    $isProtectedData = true;
                    break;
                }
            }
            if ($isProtectedData) {
                continue;
            }

            if ($item->isDir()) {
                if (!is_dir($targetPath)) @mkdir($targetPath, 0755, true);
            } else {
                @copy($item, $targetPath);
            }
        }

        function deleteDirectory($dir) {
            if (!file_exists($dir)) return true;
            if (!is_dir($dir)) return unlink($dir);
            foreach (scandir($dir) as $item) {
                if ($item === '.' || $item === '..') continue;
                if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) return false;
            }
            return rmdir($dir);
        }
        deleteDirectory($extractPath);

        $logEntry .= 'تم تطبيق التحديث التلقائي بنجاح وفك ضغط أحدث نسخة.' . PHP_EOL;
        @file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

        echo json_encode([
            'success' => true,
            'method' => 'archive_extract',
            'message' => 'تم تحديث منظومة وزارة الداخلية بنجاح إلى أحدث إصدار من GitHub',
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

http_response_code(500);
echo json_encode([
    'success' => false,
    'message' => 'فشل معالجة أرشيف التحديث'
], JSON_UNESCAPED_UNICODE);
