@echo off
echo 清理旧构建...
rmdir /s /q .next
echo 执行生产构建...
npm run build
if %errorlevel% equ 0 (
    echo 构建成功！
    echo 启动生产服务器...
    npm start
) else (
    echo 构建失败！
    pause
)

