# API 参考

## VuePerformanceMonitor

Vue 插件，用于集成性能监控功能。

### 类型定义

```typescript
interface VuePerformanceMonitor {
  install(app: App, options: ReportOptions): void;
}
```

## PerformanceCollector

性能数据收集器。

### 方法

#### collect()
收集性能指标数据。

```typescript
async collect(): Promise<PerformanceMetrics>
```

## PerformanceReporter

性能数据上报器。

### 方法

#### report()
上报性能数据。

```typescript
async report(metrics: PerformanceMetrics): Promise<void>
```

## 类型定义

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  FCP: number;  // First Contentful Paint
  LCP: number;  // Largest Contentful Paint
  FID: number;  // First Input Delay
  CLS: number;  // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  resourceTiming: PerformanceResourceTiming[];
} 