import type { ProcessorResult, RealTimeMetrics } from './metrics'
import type { PerformanceMetrics } from './performance'
import type { CommonConfig } from './common'
import type { Status } from './base'

// 处理器配置选项
export interface ProcessorOptions extends CommonConfig {
  roundToMs?: boolean;
  precision?: number;
  enabled?: boolean;
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
    scores?: Record<string, number>;
    metrics?: Record<string, {
      name: string;
      value: number;
      unit: string;
      threshold?: number;
      status?: Status;
    }>;
  };
  thresholds?: {
    [key: string]: number;
  };
  status?: Status;
}

// 数据处理器接口
export interface MetricsProcessor {
  process(
    metrics: Partial<PerformanceMetrics & RealTimeMetrics>,
    options?: ProcessorOptions
  ): ProcessorResult<PerformanceMetrics>;
}

// 工厂函数
export const createProcessorOptions = (options?: Partial<ProcessorOptions>): ProcessorOptions => ({
  enabled: true,
  roundToMs: true,
  precision: 3,
  metadata: {
    version: '1.0.0',
    env: 'production',
    processor: 'MetricsProcessorImpl'
  },
  status: 'initial',
  ...options
}); 