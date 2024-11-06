// 导入实现类
import { PerformanceCollector } from './collector'
import { PerformanceReporter } from './reporter'
import { MetricsProcessorImpl } from './processor'
import { PerformanceManager } from './performance-manager'

// 导入类型
import type {
  // 基础类型
  Status,
  BaseMetrics,
  BaseConfig,
  BaseResult,
  BaseEvent,
  BasePerformanceEvent,
  Factory,
  BaseQueue,
  MetricUnit,
  MetricCategory,
  // 性能指标类型
  PerformanceMetrics,
  NavigationTiming,
  ResourceTiming,
  PerformanceEntryType,
  BasePerformanceEntry,
  // 实时指标类型
  RealTimeMetrics,
  ProcessedMetrics,
  CollectorResult,
  ProcessorResult,
  MetricMetadata,
  // 处理器相关类型
  ProcessorOptions,
  MetricsProcessor,
  // 上报相关类型
  ReportOptions,
  // Vue 相关类型
  MonitorOptions,
  MonitorComponentProps,
  PerformanceInstance,
  // 工具类型
  RetryOptions,
  SamplingOptions,
  NetworkInformation,
  DeviceInformation,
  FormatUtils,
  UnitConverter
} from '../types'

// 导出实现类
export { 
  PerformanceCollector,
  PerformanceReporter,
  MetricsProcessorImpl,
  PerformanceManager
}

// 导出工厂函数
export const createPerformanceManager = (options?: MonitorOptions) => new PerformanceManager(options)
export const createPerformanceCollector = () => new PerformanceCollector()
export const createPerformanceReporter = (options: ReportOptions) => new PerformanceReporter(options)
export const createMetricsProcessor = () => new MetricsProcessorImpl()

// 导出类型
export type {
  Status,
  BaseMetrics,
  BaseConfig,
  BaseResult,
  BaseEvent,
  BasePerformanceEvent,
  Factory,
  BaseQueue,
  MetricUnit,
  MetricCategory,
  PerformanceMetrics,
  NavigationTiming,
  ResourceTiming,
  PerformanceEntryType,
  BasePerformanceEntry,
  RealTimeMetrics,
  ProcessedMetrics,
  CollectorResult,
  ProcessorResult,
  MetricMetadata,
  ProcessorOptions,
  MetricsProcessor,
  ReportOptions,
  MonitorOptions,
  MonitorComponentProps,
  PerformanceInstance,
  RetryOptions,
  SamplingOptions,
  NetworkInformation,
  DeviceInformation,
  FormatUtils,
  UnitConverter
}
