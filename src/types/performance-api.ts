import type { BasePerformanceEvent, MetricUnit, MetricCategory } from './base'

// 基础性能条目类型
export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

// 基础性能条目扩展类型
export interface BasePerformanceEntry extends BasePerformanceEvent {
  name: string;
  entryType: PerformanceEntryType;
  startTime: number;
  duration: number;
  unit: MetricUnit;
  category: MetricCategory;
  value: number;
  timestamp: number;
  toJSON(): any;
}

// Performance Entry Types
export type PerformanceEntryType = 
  | 'navigation'
  | 'resource'
  | 'mark'
  | 'measure'
  | 'paint'
  | 'longtask'
  | 'element'
  | 'first-input'
  | 'layout-shift'
  | 'largest-contentful-paint';

// Navigation Timing API Types
export interface NavigationTiming {
  dnsTime: number;
  tcpTime: number;
  sslTime: number;
  ttfb: number;
  responseTime: number;
  domParseTime: number;
  domReadyTime: number;
  loadTime: number;
  domReady?: number;
  firstPaint?: number;
  domInteractive?: number;
  domComplete?: number;
}

// Resource Timing API Types
export interface ResourceTiming extends BasePerformanceEntry {
  entryType: 'resource';
  initiatorType: string;
  nextHopProtocol: string;
  workerStart: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

// Long Task API Types
export interface PerformanceLongTaskTiming extends BasePerformanceEntry {
  entryType: 'longtask';
  attribution: TaskAttributionTiming[];
}

export interface TaskAttributionTiming {
  containerType: string;
  containerSrc?: string;
  containerId?: string;
  containerName?: string;
}

// Performance Entry Handler
export interface PerformanceEntryHandler extends BasePerformanceEntry {
  processingStart?: number;
  hadRecentInput?: boolean;
}

// Performance Event Timing
export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  cancelable: boolean;
  target?: Node;
}