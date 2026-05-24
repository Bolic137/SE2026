@echo off
chcp 65001 >nul

echo 警告：这会删除本地 StreamHub 数据库并重新导入初始化数据。
pause

docker compose down -v
docker compose up --build -d

echo.
echo 已重置并重新启动。
echo 前端地址: http://localhost:5173
pause