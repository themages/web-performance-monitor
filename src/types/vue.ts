import type { PropType } from 'vue'
import type { PerformanceMetrics } from './performance'
import type { CommonConfig } from './common'
import type { ReportConfig } from './reporter'
import type { Status } from './base'
import type { MetricMetadata } from './metrics'
import type { ProcessorResult } from './metrics'
import type { PerformanceMark, PerformanceMeasure } from './marks'
import type { FormatUtils } from './utils'

// 监控选项类型
export interface MonitorOptions extends CommonConfig {
  updateInterval?: number;
  sampling?: {
    rate: number;
    always: string[];
    rules?: {
      browser?: string[];
      device?: string[];
      network?: string[];
      custom?: Record<string, any>;
    };
  };
  customMetrics?: {
    collect: () => Promise<Record<string, number>>;
  };
  url: string;
  batch: boolean;
  batchSize?: number;
  config?: ReportConfig;
  metadata?: {
    metrics?: Record<string, MetricMetadata>;
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
  };
}

// Vue 组件 Props 类型定义
export interface MonitorComponentProps {
  options: MonitorOptions;
  onMetricsCollected?: (metrics: PerformanceMetrics) => void;
}

// Vue 组件 Props 定义
export const monitorPropsDefinition = {
  options: {
    type: Object as PropType<MonitorOptions>,
    required: true
  },
  onMetricsCollected: {
    type: Function as PropType<(metrics: PerformanceMetrics) => void>,
    default: null
  }
}

// Vue 全局属性类型
export interface PerformanceInstance {
  collector: {
    collect(): Promise<PerformanceMetrics>;
    disconnect(): void;
    getStatus(): Status;
  };
  reporter: {
    report(metrics: PerformanceMetrics): Promise<void>;
  };
  processor: {
    process(metrics: Partial<PerformanceMetrics>): ProcessorResult<PerformanceMetrics>;
  };
  marker: {
    mark(name: string, detail?: any): PerformanceMark;
    measure(name: string, startMark: string, endMark?: string): PerformanceMeasure;
    clearMarks(name?: string): void;
    clearMeasures(name?: string): void;
    getMarks(): PerformanceMark[];
    getMeasures(): PerformanceMeasure[];
    getEntriesByName(name: string, type?: 'mark' | 'measure'): (PerformanceMark | PerformanceMeasure)[];
    now(): number;
    timeOrigin: number;
    setMetadata(name: string, metadata: Record<string, any>): void;
    getMetadata(name: string): Record<string, any> | undefined;
  };
  utils: FormatUtils;
}
