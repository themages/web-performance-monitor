# Web Performance Monitor

一个基于 Vue 3 的 Web 性能监控工具，用于收集和分析网页性能指标。

## 功能特点

- 🚀 自动收集核心性能指标 (FCP, LCP, FID, CLS, TTFB)
- 📊 资源加载性能监控
- 🔄 批量数据上报
- 🎯 Vue 3 集成支持
- 📈 实时性能数据分析
- 🛠 可扩展的指标收集系统

## 安装

```bash
pnpm add web-performance-monitor
```

## 快速开始

```typescript
import { createApp } from 'vue'
import { VuePerformanceMonitor } from 'web-performance-monitor'
import App from './App.vue'

const app = createApp(App)

const monitorOptions = {
  url: 'https://your-analytics-server.com/collect',
  batch: true,
  batchSize: 10,
  config: {
    url: 'https://your-analytics-server.com/collect',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  batchConfig: {
    maxSize: 10,
    maxWait: 5000,
    flushOnUnload: true,
    enabled: true
  }
}

app.use(VuePerformanceMonitor, monitorOptions)
app.mount('#app')
```

## 配置选项
```typescript
interface ReportOptions {
  url: string; // 数据上报地址
  batch: boolean; // 是否启用批量上报
  batchSize?: number; // 批量上报的数量阈值
}
```

## 性能指标说明

- **FCP (First Contentful Paint)**: 首次内容绘制时间
- **LCP (Largest Contentful Paint)**: 最大内容绘制时间
- **FID (First Input Delay)**: 首次输入延迟
- **CLS (Cumulative Layout Shift)**: 累积布局偏移
- **TTFB (Time to First Byte)**: 首字节时间

## 开发指南

### 环境准备
```bash
# 克隆仓库
git clone https://github.com/your-username/web-performance-monitor.git
cd web-performance-monitor
# 安装依赖
pnpm install
```

### 开发命令
```bash
# 启动开发服务器
pnpm dev
# 运行测试
pnpm test
# 运行测试覆盖率报告
pnpm test:coverage
# 代码检查
pnpm lint
# 代码格式化
pnpm format
# 构建项目
pnpm build
```

### 目录结构
web-performance-monitor/
├── src/ # 源代码
│ ├── core/ # 核心功能模块
│ ├── vue/ # Vue 集成模块
│ └── types/ # 类型定义
├── examples/ # 示例代码
├── tests/ # 测试文件
├── scripts/ # 脚本文件
└── dist/ # 构建输出

## 发布流程
```bash
# 运行发布脚本
./scripts/publish.sh
```

## 贡献指南

我们非常欢迎社区贡献！以下是参与项目的主要方式：

### 提交 Issue
- 使用问题模板提交 bug 报告
- 提出新功能建议
- 讨论代码实现方案

### 提交 Pull Request
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到你的分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范
- 遵循 TypeScript 规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范

### 开发流程
1. 安装依赖：`pnpm install`
2. 启动开发服务器：`pnpm dev`
3. 运行测试：`pnpm test`
4. 构建项目：`pnpm build`

详细信息请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 文档

### 使用文档
- [快速开始](./docs/guide/getting-started.md)
- [配置说明](./docs/guide/configuration.md)
- [API 参考](./docs/api/README.md)
- [最佳实践](./docs/guide/best-practices.md)
- [常见问题](./docs/guide/faq.md)

### 开发文档
- [架构设计](./docs/development/architecture.md)
- [开发指](./docs/development/guide.md)
- [测试指南](./docs/development/testing.md)
- [发布流程](./docs/development/release.md)

## 更新日志

所有版本更新说明请查看 [CHANGELOG.md](./CHANGELOG.md)。

### 最新版本 v1.0.0

#### 新特性
- 支持核心 Web Vitals 指标收集
- Vue 3 插件集成
- 批量数据上报
- 自定义性能指标扩展

#### 修复
- 优化性能数据收集精确度
- 修复内存泄漏问题
- 改进错误处理机制

#### 即将推出
- React 支持
- 实时数据分析面板
- 自定义指标仪表板
- 多环境配置支持

[查看完整更新历史](./CHANGELOG.md)

## 赞助

如果这个项目对你有帮助，欢迎赞助支持我们的开发工作！

### 赞助方式

- 微信支付
  
  <img src="./docs/images/wechat.png" width="200" alt="微信赞赏码">

- 支付宝
  
  <img src="./docs/images/alipay.png" width="200" alt="支付宝收款码">

- GitHub Sponsors
  
  [![GitHub Sponsors](https://img.shields.io/github/sponsors/your-username?style=for-the-badge)](https://github.com/sponsors/your-username)

### 赞助商

<table>
  <tr>
    <td align="center" style="min-width: 150px;">
      <a href="https://example.com">
        <img src="./docs/images/sponsor1.png" width="40" alt="赞助商1">
        <br>
        <sub><b>赞助商名称</b></sub>
      </a>
    </td>
    <!-- 可以添加更多赞助商 -->
  </tr>
</table>

[成为赞助商](https://github.com/your-username/web-performance-monitor/blob/main/SPONSORING.md)

## 浏览器兼容性

本库支持以下浏览器和 API：

### 浏览器支持
- Chrome 60+
- Firefox 58+
- Safari 12.1+
- Edge 79+

### API 支持
- Performance Observer API
  - 主要浏览器均支持
  - Safari 有部分限制
- Navigation Timing API
  - 所有主要浏览器支持
- Resource Timing API
  - 所有主要浏览器支持
- User Timing API
  - 所有主要浏览器支持
- High Resolution Time API
  - 所有主要浏览器支持
- Performance Timeline API
  - 所有主要浏览器支持

对于不支持某些 API 的浏览器，会自动降级使用替代方案。
