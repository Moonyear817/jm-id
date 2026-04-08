#!/bin/bash

echo "🚀 启动 JM Heaven ID Search 项目..."
echo ""

# 获取脚本所在的目录
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 启动后端
echo "📦 启动后端服务器 (端口 5000)..."
cd "$PROJECT_DIR/backend"
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端开发服务器 (端口 3000)..."
cd "$PROJECT_DIR/frontend"
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动！"
echo ""
echo "📍 后端: http://localhost:5000"
echo "📍 前端: http://localhost:3000"
echo ""
echo "⏹️  按 Ctrl+C 停止服务"
echo ""

# 等待任何进程终止
wait
