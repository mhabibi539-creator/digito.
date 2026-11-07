@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo       DIGITO PREMIUM - Windows Installer
echo ==========================================
where node >nul 2>nul
if errorlevel 1 (echo Node.js نصب نیست. نسخه LTS را از https://nodejs.org نصب کنید.& pause& exit /b 1)
where npm >nul 2>nul
if errorlevel 1 (echo npm در دسترس نیست.& pause& exit /b 1)
echo [1/2] نصب وابستگی‌ها...
call npm install --no-audit --no-fund
if errorlevel 1 (echo نصب وابستگی‌ها ناموفق بود.& pause& exit /b 1)
echo [2/2] ساخت نصب‌کننده...
call npm run dist:win
if errorlevel 1 (echo ساخت نصب‌کننده ناموفق بود.& pause& exit /b 1)
echo فایل نصب در پوشه dist ساخته شد.
if exist "dist" explorer "%~dp0dist"
pause
endlocal
