@echo off
chcp 65001 >nul

echo =========================================
echo 正在启动 StreamHub 项目...
echo =========================================

docker compose up --build -d

echo.
echo =========================================
echo StreamHub 已启动
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:8000
echo API测试:  http://localhost:8000/api/videos
echo.
echo 第一次启动可能需要等待 1-2 分钟
echo =========================================

pause