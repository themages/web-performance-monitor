# 配置说明

## 基础配置

```typescript
interface ReportOptions {
  url: string;        // 数据上报地址
  batch: boolean;     // 是否启用批量上报
  batchSize?: number; // 批量上报的数量阈值
}
```

## 高级配置

### 自定义性能指标

```typescript
interface CustomMetrics {
  name: string;
  value: number;
  category: 'performance' | 'resource' | 'custom';
}

// 在配置中添加自定义指标
app.use(VuePerformanceMonitor, {
  url: 'your-url',
  batch: true,
  customMetrics: {
    collect: () => CustomMetrics[]
  }
})
```

### 数据上报配置

```typescript
interface ReportConfig {
  retryTimes?: number;     // 失败重试次数
  retryDelay?: number;     // 重试延迟时间(ms)
  timeout?: number;        // 请求超时时间(ms)
  headers?: HeadersInit;   // 自定义请求头
}
```

## 环境变量

支持通过环境变量配置：

```env
VITE_PERFORMANCE_MONITOR_URL=https://your-analytics-server.com/collect
VITE_PERFORMANCE_MONITOR_BATCH=true
VITE_PERFORMANCE_MONITOR_BATCH_SIZE=10
``` 