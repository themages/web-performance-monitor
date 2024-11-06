import type { BaseQueue, BaseResult, Status } from './base'
import type { PerformanceMetrics } from './performance'
import type { CommonConfig } from './common'
import type { RetryOptions } from './utils'

// 上报配置
export interface ReportConfig extends CommonConfig {
  url: string;
  method?: 'POST' | 'GET';
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    source?: string;
    processor?: string;
    metrics?: Record<string, {
      name: string;
      value: number;
      unit: string;
      threshold?: number;
    }>;
  };
}

// 批量上报配置
export interface BatchConfig extends CommonConfig {
  maxSize: number;
  maxWait: number;
  flushOnUnload?: boolean;
  enabled?: boolean;
  retryTimes?: number;
  retryDelay?: number;
  backoff?: boolean;
  backoffFactor?: number;
}

// 上报选项
export interface ReportOptions {
  url: string;
  batch: boolean;
  batchSize?: number;
  config?: ReportConfig;
  batchConfig?: BatchConfig;
  report?: RetryOptions & {
    timeout?: number;
    maxRetries?: number;
  };
}

// 上报队列
export interface ReportQueue extends BaseQueue<PerformanceMetrics> {
  metrics: PerformanceMetrics[];
  timestamp: number;
  batch: {
    id: string;
    size: number;
    retryCount: number;
    status: Status;
  };
  metadata?: {
    source?: string;
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
  };
}

// 上报结果
export interface ReportResult extends BaseResult {
  retries?: number;
  timestamp: number;
  duration: number;
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    source?: string;
    processor?: string;
    metrics?: Record<string, {
      name: string;
      value: number;
      unit: string;
      threshold?: number;
    }>;
  };
}

// 工厂函数
export const createReportQueue = (): ReportQueue => ({
  metrics: [],
  items: [],
  timestamp: Date.now(),
  batch: {
    id: crypto.randomUUID(),
    size: 0,
    retryCount: 0,
    status: 'initial'
  }
});