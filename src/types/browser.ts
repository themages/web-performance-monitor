import type { PerformanceEntry } from './performance-api'

// 浏览器性能 API 类型扩展
export interface PerformanceLongTaskTiming extends PerformanceEntry {
  duration: number;
  name: string;
  entryType: 'longtask';
  attribution: {
    containerType: string;
    containerSrc?: string;
    containerId?: string;
    containerName?: string;
  }[];
}

// 扩展 Performance 接口
declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
    getEntriesByType(type: string): PerformanceEntry[];
    getEntriesByName(name: string, type?: string): PerformanceEntry[];
    now(): number;
    readonly timeOrigin: number;
    mark(name: string): void;
    measure(name: string, startMark?: string, endMark?: string): void;
    clearMarks(name?: string): void;
    clearMeasures(name?: string): void;
  }

  interface Navigator {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: {
      downlink: number;
      rtt: number;
      effectiveType: string;
      saveData: boolean;
    };
  }

  interface Window {
    performance: Performance;
  }
}

export {} 