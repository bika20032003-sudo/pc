<?php
/**
 * منظومة وزارة الداخلية - مديرية أمن أوباري
 * سكريبت التحديث التلقائي المباشر من GitHub إلى cPanel
 * المسار: api/webhook-deploy.php
 */

header('Content-Type: application/json; charset=utf-8');

// مفتاح الأمان لحماية السكريبت من الاستدعاء غير المصرح به
$SECURITY_TOKEN = 'ubari_moi_auto_sync_2026';

// التحقق من مفتاح الأمان (عبر GET أو POST أو Header)
$receivedToken = $_GET['token'] ?? $_POST['token'] ?? $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? '';

// إذا كان الطلب من GitHub Webhook برأس مخصص
if (empty($receivedToken) && isset($_SERVER['HTTP_X_GITHUB_EVENT'])) {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);
    // السماح إذا كان هناك توكن في الرابط
}

if ($receivedToken !== $SECURITY_TOKEN && (!isset($_GET['token']) || $_GET['token'] !== $SECURITY_TOKEN)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'غير مصرح بالوصول: مفتاح الأمان غير صحيح'
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
    @exec("cd {$rootDir} && git pull origin gh-pages 2>&1", $gitOutput, $gitStatus);
}

if ($gitStatus === 0 && !empty($gitOutput)) {
    $logEntry .= 'تم التحديث بنجاح عبر Git CLI: ' . implode(' | ', $gitOutput) . PHP_EOL;
    @file_put_contents($logFile, $logEntry, FILE_APPEND);
    echo json_encode([
        'success' => true,
        'method' => 'git_pull',
        'message' => 'تم سحب وتطبيق أحدث كود بنجاح عبر Git',
        'details' => $gitOutput,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. إذا لم يكن Git CLI متاحاً، يتم سحب حزمة gh-pages مباشرة وفك ضغطها
$zipUrl = 'https://codeload.github.com/bika20032003-sudo/pc/zip/refs/heads/gh-pages';
$tempZip = __DIR__ . '/data/temp_update.zip';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $zipUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Ubari-MOI-AutoDeploy/1.0');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
$zipData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || empty($zipData)) {
    $logEntry .= "فشل تنزيل حزمة التحديث من GitHub (رمز الخطأ: {$httpCode})" . PHP_EOL;
    @file_put_contents($logFile, $logEntry, FILE_APPEND);
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
    // اسم المجلد الداخلي في أرشيف جيثب هو pc-gh-pages
    $extractedFolder = 'pc-gh-pages';
    
    // فك الضغط في مجلد مؤقت
    $extractPath = __DIR__ . '/data/temp_extracted';
    if (!is_dir($extractPath)) {
        @mkdir($extractPath, 0755, true);
    }
    
    $zip->extractTo($extractPath);
    $zip->close();
    @unlink($tempZip);

    $sourceDir = $extractPath . '/' . $extractedFolder;
    if (is_dir($sourceDir)) {
        // نسخ الملفات إلى المجلد الرئيسي مع الحفاظ على قاعدة البيانات الحالية
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $subPath = $iterator->getSubPathName();
            $targetPath = $rootDir . '/' . $subPath;

            // حماية قاعدة بيانات القوة العمومية الحالية من الاستبدال إذا كانت موجودة مسبقاً
            if (strpos($subPath, 'force_data.json') !== false && file_exists($targetPath)) {
                continue;
            }

            if ($item->isDir()) {
                if (!is_dir($targetPath)) {
                    @mkdir($targetPath, 0755, true);
                }
            } else {
                @copy($item, $targetPath);
            }
        }

        // تنظيف الملفات المؤقتة
        function deleteDirectory($dir) {
            if (!file_exists($dir)) return true;
            if (!is_dir($dir)) return unlink($dir);
            foreach (scandir($dir) as $item) {
                if ($item == '.' || $item == '..') continue;
                if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) return false;
            }
            return rmdir($dir);
        }
        deleteDirectory($extractPath);

        $logEntry .= 'تم تطبيق التحديث التلقائي بنجاح وفك ضغط أحدث نسخة.' . PHP_EOL;
        @file_put_contents($logFile, $logEntry, FILE_APPEND);

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
