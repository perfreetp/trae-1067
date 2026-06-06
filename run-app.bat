@echo off
chcp 65001 >nul
echo ========================================
echo   灌区配水管理系统 - 启动程序
echo ========================================
echo.

if not exist "node_modules" (
    echo [错误] 未找到 node_modules 目录，请先运行: npm install
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo [信息] 正在构建前端资源...
    call npx vite build
)

if not exist "dist-electron\main.js" (
    echo [信息] 正在编译 Electron 主进程...
    call npx tsc -p electron/tsconfig.json
)

echo [信息] 正在启动应用...
call npx electron .

pause
