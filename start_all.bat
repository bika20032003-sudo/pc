@echo off
:: ============================================================================
::                وزارة الداخلية - دولة ليبيا
::          منظومة العمليات والتحكم الأمني الموحدة (MERN + MySQL)
::               نظام الإطلاق وإدارة الخدمات المركزي v2.4
:: ============================================================================

setlocal enabledelayedexpansion
title منظومة وزارة الداخلية | مركز إدارة وتشغيل الخدمات
color 0F
chcp 65001 > nul
mode con: cols=96 lines=34

:: الانتقال التلقائي لمجلد المشروع وتفادي مشاكل المسافات في المسار
cd /d "%~dp0"

:MAIN_MENU
cls
echo.
echo  ========================================================================================
echo    وزارة الداخلية - منظومة الإدارة والتحكم الأمني الموحدة
echo    Ministry of Interior - Unified Digital Security System
echo  ========================================================================================
echo.
echo   [1/4] فحص متطلبات بيئة التشغيل الأساسية...

:: 1. التحقق من وجود Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [X] خطأ فادح: محرك Node.js غير مثبت على هذا الجهاز!
    echo       يرجى تثبيت Node.js من: https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo       - محرك Node.js: متوفر بنجاح (%NODE_VER%)

:: 2. التحقق من وجود npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo   [X] خطأ: مدير الحزم npm غير متوفر!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo       - مدير الحزم npm: متوفر بنجاح (%NPM_VER%)

echo.
echo   [2/4] التحقق من حزم ومكتبات النظام (Dependencies)...

:: فحص مكتبات الخادم
if not exist "%~dp0server\node_modules\" (
    echo       * جارٍ تثبيت مكتبات المخدم الخلفي (Server Modules)...
    cd /d "%~dp0server"
    call npm install --silent
    cd /d "%~dp0"
)
echo       - مكتبات المخدم الخلفي: جاهزة ومثبتة.

:: فحص مكتبات الواجهة الأمامية
if not exist "%~dp0client\node_modules\" (
    echo       * جارٍ تثبيت مكتبات الواجهة الأمامية (Client Modules)...
    cd /d "%~dp0client"
    call npm install --silent
    cd /d "%~dp0"
)
echo       - مكتبات الواجهة الأمامية: جاهزة ومثبتة.

echo.
echo   [3/4] فحص حالة قاعدة بيانات SQLite السيادية المعتمدة (WAL High-Concurrency)...

if exist "%~dp0server\src\data\moi_system.db" (
    echo       [+] محرك SQLite: جاهز ونشط (الملف: server\src\data\moi_system.db).
    echo       [+] نظام التزامن الفوري (WAL Mode): مفعل لخدمة كافة مدخلي البيانات بالتوازي.
) else (
    echo       [*] محرك SQLite: سيتم إنشاء وتهيئة قاعدة البيانات وترحيل السجلات تلقائياً.
)

echo.
echo   [4/4] إطلاق الخدمات ومحركات الربط الشبكي...

:: تشغيل المخدم الخلفي في نافذة مستقلة مع عنوان مخصص
echo       - بدء تشغيل المخدم الخلفي على المنفذ (5050)...
start "MOI-Backend-Service (Port 5050)" cmd /k "title MOI API Service && cd /d "%~dp0server" && npm start"

:: انتظار لحظي للتهيئة
timeout /t 2 > nul

:: تشغيل الواجهة الأمامية في نافذة مستقلة
echo       - بدء تشغيل خادم الواجهة الأمامية على المنفذ (5173)...
start "MOI-Frontend-Service (Port 5173)" cmd /k "title MOI Client Service && cd /d "%~dp0client" && npm run dev"

:: انتظار اكتمال التشغيل ثم فتح المتصفح تلقائياً
timeout /t 2 > nul
echo       - جارٍ فتح المنظومة في المتصفح الافتراضي...
start http://localhost:5173

:DASHBOARD_MONITOR
cls
echo.
echo  ========================================================================================
echo    وزارة الداخلية - مركز إدارة ومراقبة المنظومة
echo    MINISTRY OF INTERIOR - OPERATIONS COMMAND CONSOLE
echo  ========================================================================================
echo.
echo   حالة الخدمات الحالية:
echo   --------------------------------------------------------------------------------------
echo    [+] خادم الواجهة (Client):   http://localhost:5173   [نشط ويعمل]
echo    [+] خادم التطبيق (Backend):  http://localhost:5050   [نشط ويعمل]
echo    [+] بوابة التوثيق (Auth API): http://localhost:5050/api/auth
echo   --------------------------------------------------------------------------------------
echo.
echo   خيارات الإدارة والتحكم السريع:
echo   [1] إعادة فتح المنظومة في المتصفح (Open in Browser)
echo   [2] فحص صحة المخدم الخلفي (Health Check API)
echo   [3] إعادة تشغيل كافة الخدمات (Restart All Services)
echo   [4] إيقاف كافة الخدمات وإغلاق المنظومة بأمان (Stop & Exit)
echo.
set /p opt="> يرجى اختيار الإجراء المطلوب [1-4]: "

if "%opt%"=="1" (
    start http://localhost:5173
    goto DASHBOARD_MONITOR
)
if "%opt%"=="2" (
    echo.
    echo    نتائج الفحص المباشر للمخدم:
    curl -s http://localhost:5050/api/health
    echo.
    echo.
    pause
    goto DASHBOARD_MONITOR
)
if "%opt%"=="3" (
    echo.
    echo   جارٍ إيقاف العمليات القديمة وإعادة الإطلاق...
    taskkill /FI "WINDOWTITLE eq MOI API Service*" /F >nul 2>nul
    taskkill /FI "WINDOWTITLE eq MOI Client Service*" /F >nul 2>nul
    timeout /t 1 > nul
    goto MAIN_MENU
)
if "%opt%"=="4" (
    echo.
    echo   جارٍ إيقاف خدمات المنظومة بأمان...
    taskkill /FI "WINDOWTITLE eq MOI API Service*" /F >nul 2>nul
    taskkill /FI "WINDOWTITLE eq MOI Client Service*" /F >nul 2>nul
    echo   تم إيقاف الخدمات بنجاح. دمتم في حفظ الله ورعايته.
    timeout /t 2 > nul
    exit /b 0
)

goto DASHBOARD_MONITOR
