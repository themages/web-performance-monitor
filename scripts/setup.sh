#!/bin/bash

# 检查是否已安装必要的工具
command -v pnpm >/dev/null 2>&1 || { echo "需要先安装 pnpm，请运行：npm install -g pnpm"; exit 1; }

echo "开始初始化项目..."

# 创建项目目录结构
create_directories() {
  mkdir -p web-performance-monitor
  cd web-performance-monitor
  mkdir -p src/{core,components,hooks,utils,types,constants}
  mkdir -p docs/{guide,api,development,images}
  mkdir -p examples
  mkdir -p tests
  mkdir -p scripts
}

# 创建文档文件
create_documents() {
  touch docs/guide/{getting-started,configuration,best-practices,faq}.md
  touch docs/api/README.md
  touch docs/development/{architecture,guide,testing,release}.md
  touch CHANGELOG.md
  touch SPONSORING.md
}

# 初始化项目
init_project() {
  if [ ! -f "package.json" ]; then
    pnpm init
  fi
  pnpm install
  pnpm add -D husky lint-staged standard-version
}

# 配置 Git hooks
setup_git_hooks() {
  pnpm husky install
  pnpm husky add .husky/pre-commit "pnpm lint-staged"
  chmod +x .husky/pre-commit
  chmod +x scripts/*.sh
}

# 执行初始化步骤
create_directories
create_documents
init_project
setup_git_hooks

echo "项目初始化完成！" 