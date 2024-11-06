# 发布流程

## 版本管理

我们使用语义化版本控制 (Semantic Versioning):
- MAJOR.MINOR.PATCH
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

## 发布步骤

### 1. 准备发布

```bash
# 确保在主分支
git checkout main
git pull origin main

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 运行构建
pnpm build
```

### 2. 版本更新

```bash
# 更新补丁版本
pnpm version patch

# 更新次版本
pnpm version minor

# 更新主版本
pnpm version major
```

### 3. 生成变更日志

```bash
# 使用 standard-version 生成变更日志
pnpm release
```

### 4. 发布到 NPM

```bash
# 发布到 NPM
pnpm publish
```

### 5. 推送到 GitHub

```bash
# 推送代码和标签
git push origin main --follow-tags
```

## 发布检查清单

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档已更新
- [ ] 更新日志已生成
- [ ] 版本号已更新
- [ ] TypeScript 类型已更新
- [ ] 示例代码已验证
- [ ] 性能测试已完成

## 发布后检查

1. 验证 NPM 包
```bash
# 创建测试项目
mkdir test-release && cd test-release
pnpm init
pnpm add web-performance-monitor

# 验证安装
node -e "require('web-performance-monitor')"
```

2. 检查文档
- 访问 npm 页面确认文档正确
- 确认所有链接可用
- 验证示例代码可运行

3. 监控
- 检查 npm 下载统计
- 监控 GitHub issues
- 检查错误报告

## 回滚流程

如果发现严重问题：

1. 从 NPM 撤回版本
```bash
npm unpublish web-performance-monitor@x.x.x
```

2. 删除 Git 标签
```bash
git tag -d vx.x.x
git push origin :refs/tags/vx.x.x
```

3. 发布修复版本
```bash
git checkout -b hotfix/vx.x.x
# 修复问题
git commit -m "fix: description"
pnpm version patch
pnpm publish
```

## 发布通知

1. GitHub Release
- 创建新的 Release
- 添加变更说明
- 附加构建文件

2. 社区通知
- 更新 Discord/Slack 频道
- 发送邮件通知
- 更新社交媒体

## 持续发布

使用 GitHub Actions 自动化发布流程：

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - run: pnpm publish
``` 