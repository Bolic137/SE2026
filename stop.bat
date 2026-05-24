@echo off
chcp 65001 >nul

echo 正在停止 StreamHub...
docker compose down

echo 已停止。
pause