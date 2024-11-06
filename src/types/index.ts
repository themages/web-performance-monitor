// 导出基础类型
export type {
  Status,
  MetricUnit,
  MetricCategory,
  BaseMetrics,
  BaseEvent,
  BasePerformanceEvent,
  BaseConfig,
  BaseResult,
  BaseQueue,
  Factory
} from './base'

export type {
  Nullable,
  Optional,
  Primitive,
  DeepPartial,
  Callback,
  AsyncCallback,
  ErrorCallback,
  ErrorInfo,
  CommonConfig,
  CommonResponse,
  Pagination,
  Sorting,
  Filtering
} from './common'

// 导出性能相关类型
export type {
  PerformanceEntry,
  PerformanceEntryType,
  NavigationTiming,
  ResourceTiming,
  PerformanceLongTaskTiming,
  TaskAttributionTiming,
  BasePerformanceEntry,
  PerformanceEventTiming
} from './performance-api'

export type {
  PerformanceMark,
  PerformanceMeasure,
  PerformanceMarker
} from './marks'

export type {
  LayoutShiftEntry,
  FirstInputEntry,
  PaintEntry,
  LargestContentfulPaintEntry,
  LongTaskEntry
} from './entries'

// 导出指标相关类型
export type {
  RealTimeMetrics,
  ProcessedMetrics,
  MetricMetadata,
  CollectorResult,
  ProcessorResult
} from './metrics'

export type {
  PerformanceMetrics
} from './performance'

// 导出处理器相关类型
export type {
  ProcessorOptions,
  MetricsProcessor
} from './processor'

// 导出上报相关类型
export type {
  ReportConfig,
  BatchConfig,
  ReportOptions,
  ReportQueue,
  ReportResult
} from './reporter'

// 导出工具类型
export type {
  SamplingOptions,
  RetryOptions,
  NetworkInformation,
  DeviceInformation,
  FormatUtils,
  UnitConverter,
  FormatDisplay
} from './utils'

// 导出 Vue 相关类型
export type {
  MonitorOptions,
  MonitorComponentProps,
  PerformanceInstance
} from './vue'

// 导出常量
export {
  PERFORMANCE_METRICS,
  METRIC_THRESHOLDS,
  METRIC_STATUS,
  METRIC_UNITS,
  NAVIGATION_THRESHOLDS,
  MONITOR_CONFIG,
  MONITOR_STATUS,
  DEFAULT_CONFIG,
  STATUS
} from './constants'

// 导出类型（修复 isolatedModules 问题）
export type { MonitorStatus, MetricThresholds } from './constants'

// 导出工厂函数
export { createEmptyMetrics } from './performance'
export { createProcessorOptions } from './processor'
export { createReportQueue } from './reporter'
export { createPerformanceMark } from './marks'
export { createInitialRealTimeMetrics } from './metrics'