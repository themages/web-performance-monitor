#!/bin/bash

# 检查是否已安装必要的工具
command -v pnpm >/dev/null 2>&1 || { echo "需要先安装 pnpm，请运行：npm install -g pnpm"; exit 1; }

echo "开始初始化项目..."

# 创建项目目录
if [ ! -d "web-performance-monitor" ]; then
  mkdir web-performance-monitor
  cd web-performance-monitor
else
  cd web-performance-monitor
fi

# 初始化项目
if [ ! -f "package.json" ]; then
  pnpm init
fi

# 安装依赖
echo "安装依赖..."
pnpm install

# 安装开发依赖
echo "安装开发工具..."
pnpm add -D husky lint-staged standard-version

# 初始化 husky
echo "配置 Git hooks..."
pnpm husky install

# 添加 pre-commit hook
pnpm husky add .husky/pre-commit "pnpm lint-staged"

# 设置执行权限
chmod +x .husky/pre-commit
chmod +x scripts/*.sh

echo "项目初始化完成！" 