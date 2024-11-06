# 快速开始

## 安装

```bash
pnpm add web-performance-monitor
```

## 基础用法

```typescript
import { createApp } from 'vue'
import { VuePerformanceMonitor } from 'web-performance-monitor'
import App from './App.vue'

const app = createApp(App)

app.use(VuePerformanceMonitor, {
  url: 'https://your-analytics-server.com/collect',
  batch: true,
  batchSize: 10
})

app.mount('#app')
```

## 性能指标说明

### 核心指标
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

### 自定义指标
您可以通过扩展 PerformanceCollector 类来收集自定义性能指标。

## 数据上报

默认情况下，性能数据会在以下时机上报：
1. 组件挂载完成时
2. 用户交互时
3. 页面卸载前

## 下一步

- 查看 [配置说明](./configuration.md) 了解更多配置选项
- 查看 [最佳实践](./best-practices.md) 了解性能优化建议
- 查看 [API 文档](../api/README.md) 了解详细的 API 使用方法 