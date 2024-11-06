// 导出所有类型定义
export type {
  Status,
  MetricUnit,
  MetricCategory,
  PerformanceMetrics,
  RealTimeMetrics,
  ProcessorResult,
  MonitorStatus,
  SamplingOptions,
  RetryOptions,
  FormatDisplay
} from './types'

// 导出所有常量
export {
  PERFORMANCE_METRICS,
  METRIC_THRESHOLDS,
  METRIC_STATUS,
  METRIC_UNITS,
  NAVIGATION_THRESHOLDS,
  MONITOR_CONFIG,
  MONITOR_STATUS,
  DEFAULT_CONFIG
} from './types/constants'

// 导出核心实现类
export {
  PerformanceCollector,
  PerformanceReporter, 
  MetricsProcessorImpl,
  PerformanceManager
} from './core'

// 导出工具类和函数
export {
  WebVitalsCollector,
  checkApiSupport,
  getBrowserInfo,
  getFallbackValue,
  formatTime,
  calculateTimeDiff,
  convertUnits,
  formatDisplay,
  shouldSample,
  retry,
  createInitialRealTimeMetrics
} from './utils'

// 导出 Vue 组件和插件
export { default as PerformanceMonitor } from './components/PerformanceMonitor.vue'
export { VuePerformanceMonitor } from './vue'

// 导出 hooks
export { usePerformanceMonitor } from './hooks/usePerformanceMonitor'

// 导出工厂函数
export {
  createEmptyMetrics,
  createProcessorOptions,
  createReportQueue,
  createPerformanceMark
} from './types'