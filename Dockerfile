# 使用 Node.js 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 创建必要的目录和文件
RUN mkdir -p docs/{guide,api,development,images} && \
    touch docs/guide/{getting-started,configuration,best-practices,faq}.md && \
    touch docs/api/README.md && \
    touch docs/development/{architecture,guide,testing,release}.md && \
    touch CHANGELOG.md SPONSORING.md && \
    chmod +x scripts/*.sh

# 构建项目
RUN pnpm build

# 设置默认命令
CMD ["pnpm", "dev"] 