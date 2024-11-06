import type { Status } from './base'

// 性能指标常量
export const PERFORMANCE_METRICS = {
  FCP: 'First Contentful Paint',
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  TTFB: 'Time to First Byte',
  TTI: 'Time to Interactive',
  FPS: 'Frames Per Second',
  MEMORY: 'Memory Usage',
  NETWORK: 'Network Status',
  PAINT: 'Paint Timing',
  LAYOUT: 'Layout Timing',
  STYLE: 'Style Timing',
  FIRST_INPUT: 'First Input Time',
  INTERACTION: 'Interaction Time',
  LAYOUT_COUNT: 'Layout Count'
} as const;

// 性能指标阈值常量
export const METRIC_THRESHOLDS = {
  FCP: 2500,    // Good < 2.5s
  LCP: 2500,    // Good < 2.5s
  FID: 100,     // Good < 100ms
  CLS: 0.1,     // Good < 0.1
  TTFB: 600,    // Good < 600ms
  TTI: 3800,    // Good < 3.8s
  FPS: 60,      // Good >= 60fps
  MEMORY_USAGE: 0.8,  // Good < 80%
  NETWORK: {
    RTT: 200,   // Good < 200ms
    DOWNLINK: 5 // Good >= 5Mbps
  },
  LAYOUT: 100,  // Good < 100ms
  STYLE: 100,   // Good < 100ms
  FIRST_INPUT: 100,  // Good < 100ms
  INTERACTION: 200,  // Good < 200ms
  LAYOUT_COUNT: 50   // Good < 50
} as const;

// 指标状态常量
export const METRIC_STATUS = {
  GOOD: 'good',
  POOR: 'poor'
} as const;

// 指标单位常量
export const METRIC_UNITS = {
  TIME: 'ms',
  FPS: 'fps',
  BYTES: 'bytes',
  MB: 'MB',
  MBPS: 'Mbps',
  PERCENT: '%',
  COUNT: 'count'
} as const;

// 导航计时阈值常量
export const NAVIGATION_THRESHOLDS = {
  DNS: 300,      // Good < 300ms
  TCP: 300,      // Good < 300ms
  SSL: 300,      // Good < 300ms
  TTFB: 600,     // Good < 600ms
  RESPONSE: 500, // Good < 500ms
  DOM_PARSE: 1000, // Good < 1s
  DOM_READY: 2500, // Good < 2.5s
  LOAD: 4000     // Good < 4s
} as const;

// 监控配置常量
export const MONITOR_CONFIG = {
  UPDATE_INTERVAL: 1000,
  COLLECTION_INTERVAL: 5000,
  FPS: {
    GOOD_THRESHOLD: 60,
    WARNING_THRESHOLD: 30,
    SAMPLE_INTERVAL: 1000
  },
  MEMORY: {
    USAGE_THRESHOLD: 0.8,
    UNIT: 'MB'
  },
  NETWORK: {
    RTT_THRESHOLD: 200,
    DOWNLINK_THRESHOLD: 5
  },
  PAINT: {
    FP_THRESHOLD: 1000,
    FCP_THRESHOLD: 2500,
    LCP_THRESHOLD: 2500
  },
  LAYOUT: {
    SHIFT_THRESHOLD: 0.1,
    COUNT_THRESHOLD: 50
  },
  STYLE: {
    RECALC_THRESHOLD: 50,
    UPDATE_THRESHOLD: 100
  }
} as const;

// 默认配置常量
export const DEFAULT_CONFIG = {
  BATCH_SIZE: 10,
  SAMPLING_RATE: 1,
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000,
  MAX_WAIT: 5000,
  FLUSH_ON_UNLOAD: true,
  PRECISION: 3,
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  BUFFER_SIZE: 1000,
  FLUSH_INTERVAL: 5000
} as const;

// 状态常量
export const STATUS = {
  INITIAL: 'initial' as Status,
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error' as Status
} as const;

// 监控状态常量
export const MONITOR_STATUS = {
  INITIAL: 'initial' as Status,
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ERROR: 'error' as Status
} as const;

// 导出常量类型
export type MetricStatusValue = typeof METRIC_STATUS[keyof typeof METRIC_STATUS];
export type MonitorStatusValue = typeof MONITOR_STATUS[keyof typeof MONITOR_STATUS];
export type StatusValue = typeof STATUS[keyof typeof STATUS];
export type MonitorStatus = typeof MONITOR_STATUS[keyof typeof MONITOR_STATUS];

// 导出配置类型
export type MonitorConfig = typeof MONITOR_CONFIG;
export type DefaultConfig = typeof DEFAULT_CONFIG;
export type MetricThresholds = typeof METRIC_THRESHOLDS;