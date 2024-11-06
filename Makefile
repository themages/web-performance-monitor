.PHONY: init setup test build dev

# 初始化项目
init:
	@echo "初始化项目..."
	@chmod +x scripts/*.sh
	@./scripts/init.sh

# 设置开发环境
setup:
	@echo "设置开发环境..."
	@chmod +x scripts/*.sh
	@./scripts/setup.sh

# 运行测试
test:
	@echo "运行测试..."
	@pnpm test

# 构建项目
build:
	@echo "构建项目..."
	@pnpm build

# 启动开发服务器
dev:
	@echo "启动开发服务器..."
	@pnpm dev

# 安装依赖
install:
	@echo "安装依赖..."
	@pnpm install

# 清理项目
clean:
	@echo "清理项目..."
	@pnpm clean 