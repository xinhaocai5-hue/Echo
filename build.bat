@echo off
echo ===================================
echo   Echo Build Script
echo   JSX -> Compiled JS
echo ===================================
echo.

cd /d "e:\XM\Echo"

:: 检查 node 是否可用
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 检查依赖
if not exist "node_modules\@babel\core" (
    echo [INFO] 首次运行，安装依赖...
    call npm init -y
    call npm install --save-dev @babel/core @babel/preset-react @babel/preset-env
    echo.
)

:: 执行构建
node build.js

if errorlevel 1 (
    echo.
    echo [ERROR] 构建失败!
    pause
    exit /b 1
)

echo.
echo ===================================
echo   构建成功!
echo   源文件: Echo.src.html (编辑用)
echo   输出:   Echo.html (运行用)
echo ===================================
pause
