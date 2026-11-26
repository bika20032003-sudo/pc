<?php
/**
 * Shared security, CORS, JWT verification, and atomic JSON I/O helpers for PHP endpoints.
 */

function sendCorsHeaders($allowedMethods = 'GET, POST, OPTIONS') {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedExact = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5050',
        'http://127.0.0.1:5050',
        'https://bika20032003-sudo.github.io',
        'https://ubarighatroad.ly',
        'http://ubarighatroad.ly',
        'https://www.ubarighatroad.ly',
        'http://www.ubarighatroad.ly',
    ];

    $isAllowed = false;
    if (!empty($origin)) {
        if (in_array($origin, $allowedExact, true)) {
            $isAllowed = true;
        } elseif (preg_match('/^https:\/\/[a-z0-9.-]+\.ts\.net(:\d+)?$/i', $origin)) {
            $isAllowed = true;
        } elseif (preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i', $origin)) {
            $isAllowed = true;
        }
    }

    if ($isAllowed) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
    }

    header("Access-Control-Allow-Methods: {$allowedMethods}");
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function getBearerToken() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (empty($auth) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (preg_match('/Bearer\s+(.+)/i', $auth, $matches)) {
        return trim($matches[1]);
    }
    return '';
}

function base64UrlDecode($input) {
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $input .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($input, '-_', '+/'));
}

function verifyJwtToken($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$headerB64, $payloadB64, $sigB64] = $parts;
    $expectedSig = hash_hmac('sha256', "{$headerB64}.{$payloadB64}", $secret, true);
    $actualSig = base64UrlDecode($sigB64);
    if (!$actualSig || !hash_equals($expectedSig, $actualSig)) {
        return null;
    }
    $payload = json_decode(base64UrlDecode($payloadB64), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && time() > intval($payload['exp'])) {
        return null;
    }
    return $payload;
}

function requireApiAuth() {
    $token = getBearerToken();
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'جلسة غير مصرح بها. يرجى تسجيل الدخول أولاً'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $secret = getenv('JWT_SECRET') ?: '';
    if (!empty($secret)) {
        $claims = verifyJwtToken($token, $secret);
        if (!$claims) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'انتهت صلاحية الجلسة أو التوكن غير صالح'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        return $claims;
    }

    // In PHP-only hosting where JWT_SECRET isn't configured, require a valid JWT structure (3 base64url segments)
    if (count(explode('.', $token)) !== 3) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'توكن المصادقة غير صالح'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return ['token_present' => true];
}

function normalizeDigits($str) {
    if (!$str) return '';
    $arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    $english = ['0','1','2','3','4','5','6','7','8','9'];
    $str = str_replace($arabic, $english, strval($str));
    return preg_replace('/[^0-9]/', '', $str);
}

/**
 * Atomic JSON read-modify-write under exclusive file lock (prevents TOCTOU races).
 */
function withLockedJsonFile($filePath, callable $mutator) {
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $fp = fopen($filePath, 'c+');
    if (!$fp) {
        return ['ok' => false, 'error' => 'تعذر فتح ملف البيانات'];
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['ok' => false, 'error' => 'تعذر قفل ملف البيانات'];
    }

    $raw = stream_get_contents($fp);
    $list = json_decode($raw ?: '[]', true);
    if (!is_array($list)) {
        $list = [];
    }

    $result = $mutator($list);
    if (!empty($result['save'])) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($result['list'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
    }

    flock($fp, LOCK_UN);
    fclose($fp);
    return $result;
}
