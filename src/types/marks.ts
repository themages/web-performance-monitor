import type { BasePerformanceEntry } from './performance-api';
import type { Status, MetricUnit, MetricCategory } from './base';

// 性能标记
export interface PerformanceMark extends BasePerformanceEntry {
  entryType: 'mark';
  detail?: any;
  status?: Status;
  unit: MetricUnit;
  category: MetricCategory;
  metadata?: {
    source?: string;
    category?: string;
    labels?: string[];
    processor?: string;
    version?: string;
    env?: string;
    tags?: string[];
    [key: string]: any;
  };
}

// 性能测量
export interface PerformanceMeasure extends BasePerformanceEntry {
  entryType: 'measure';
  startMark: string;
  endMark: string;
  detail?: any;
  status?: Status;
  unit: MetricUnit;
  category: MetricCategory;
  metadata?: {
    source?: string;
    category?: string;
    labels?: string[];
    processor?: string;
    version?: string;
    env?: string;
    tags?: string[];
    [key: string]: any;
  };
}

// 性能标记器接口
export interface PerformanceMarker {
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
}

// 工厂函数
export const createPerformanceMark = (
  name: string, 
  detail?: any,
  metadata?: Record<string, any>
): Omit<PerformanceMark, 'toJSON'> => ({
  type: 'mark',
  timestamp: Date.now(),
  name,
  entryType: 'mark',
  startTime: performance.now(),
  duration: 0,
  value: 0,
  unit: 'ms',
  category: 'mark',
  detail,
  metadata: {
    ...metadata,
    processor: metadata?.processor || 'PerformanceMarker',
    version: metadata?.version || '1.0.0'
  }
}); 