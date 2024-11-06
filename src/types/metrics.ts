import type { BaseMetrics, MetricUnit, MetricCategory } from './base'
import type { NavigationTiming } from './performance-api'
import type { PerformanceMetrics } from './performance'

// 实时性能指标类型
export interface RealTimeMetrics extends BaseMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
    usagePercent: number;
  };
  network: {
    downlink: number;
    rtt: number;
    effectiveType: string;
    online: boolean;
    saveData: boolean;
  };
  paint: {
    fpaint: number;
    fcpaint: number;
    lcpaint: number;
  };
  navigation: NavigationTiming;
  system: {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    devicePixelRatio: number;
    platform: string;
    userAgent: string;
    jsHeapSize?: number;
    domNodes?: number;
    layoutCount?: number;
  };
  layoutTime: number;
  styleTime: number;
  core: {
    FCP: number;
    LCP: number;
    FID: number;
    CLS: number;
    TTFB: number;
    TTI: number;
    firstInputTime: number;
    interactionTime: number;
    layoutCount: number;
  };
}

// 指标元数据
export interface MetricMetadata {
  name: string;
  description?: string;
  unit: MetricUnit;
  category: MetricCategory;
  thresholds?: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
}

// 处理后的指标数据
export interface ProcessedMetrics<T = PerformanceMetrics> {
  data: T;
  timestamp: number;
  metadata?: {
    processor: string;
    version: string;
    options?: Record<string, any>;
    scores?: Record<string, number>;
    metrics?: Record<string, MetricMetadata>;
  };
}

// 收集器结果
export interface CollectorResult<T = PerformanceMetrics> {
  metrics: T;
  timestamp: number;
  metadata?: {
    collector: string;
    version: string;
    env?: string;
  };
}

// 处理器结果
export interface ProcessorResult<T = PerformanceMetrics> {
  data: T;
  timestamp: number;
  duration: number;
  metadata?: {
    processor: string;
    version: string;
    options?: Record<string, any>;
    scores?: Record<string, number>;
  };
}

// 添加工厂函数
export const createInitialRealTimeMetrics = (): RealTimeMetrics => ({
  name: 'realtime',
  value: 0,
  timestamp: Date.now(),
  unit: 'ms',
  category: 'core-vitals',
  fps: 0,
  memory: {
    used: 0,
    total: 0,
    limit: 0,
    usagePercent: 0
  },
  network: {
    downlink: 0,
    rtt: 0,
    effectiveType: 'unknown',
    online: true,
    saveData: false
  },
  paint: {
    fpaint: 0,
    fcpaint: 0,
    lcpaint: 0
  },
  navigation: {
    dnsTime: 0,
    tcpTime: 0,
    sslTime: 0,
    ttfb: 0,
    responseTime: 0,
    domParseTime: 0,
    domReadyTime: 0,
    loadTime: 0
  },
  system: {
    devicePixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  },
  layoutTime: 0,
  styleTime: 0,
  core: {
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
    TTI: 0,
    firstInputTime: 0,
    interactionTime: 0,
    layoutCount: 0
  }
});
