import type { BaseMetrics } from './base'
import type { NavigationTiming, ResourceTiming, PerformanceLongTaskTiming } from './performance-api'
import type { RealTimeMetrics } from './metrics'

// 核心性能指标类型定义
export interface PerformanceMetrics extends BaseMetrics {
  // Core Web Vitals
  core: {
    FCP: number;    // First Contentful Paint
    LCP: number;    // Largest Contentful Paint
    FID: number;    // First Input Delay
    CLS: number;    // Cumulative Layout Shift
    TTFB: number;   // Time to First Byte
    TTI: number;    // Time to Interactive
    firstInputTime: number;
    interactionTime: number;
    layoutCount: number;
  };
  
  // Navigation Timing
  navigation: NavigationTiming;
  
  // Resource Timing
  resources: ResourceTiming[];
  
  // Long Tasks
  longTasks: {
    count: number;
    firstInputTime: number;
    interactionTime: number;
    tasks?: PerformanceLongTaskTiming[];
  };
  
  // System Metrics
  system: RealTimeMetrics['system'];
  
  // Layout and Style Metrics
  layoutTime: number;
  styleTime: number;
  
  // Real-time Metrics
  fps?: number;
  memory?: RealTimeMetrics['memory'];
  network?: RealTimeMetrics['network'];
  paint?: RealTimeMetrics['paint'];
  
  // Custom Metrics
  customMetrics?: Record<string, number | string>;
}

// 工厂函数
export const createEmptyMetrics = (): PerformanceMetrics => ({
  name: 'performance',
  value: 0,
  timestamp: Date.now(),
  unit: 'ms',
  category: 'core-vitals',
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
  resources: [],
  longTasks: {
    count: 0,
    firstInputTime: 0,
    interactionTime: 0
  },
  system: {
    deviceMemory: undefined,
    hardwareConcurrency: undefined,
    devicePixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  },
  layoutTime: 0,
  styleTime: 0
});
