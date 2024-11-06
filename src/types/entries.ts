import type { PerformanceEntry } from './performance-api'

// 布局偏移条目类型
export interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: {
    node?: Node;
    previousRect: DOMRectReadOnly;
    currentRect: DOMRectReadOnly;
  }[];
}

// 首次输入延迟条目类型
export interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  duration: number;
  cancelable: boolean;
  target?: Node;
}

// 绘制条目类型
export interface PaintEntry extends PerformanceEntry {
  name: 'first-paint' | 'first-contentful-paint';
  duration: number;
  entryType: 'paint';
}

// 最大内容绘制条目类型
export interface LargestContentfulPaintEntry extends PerformanceEntry {
  element?: Element;
  id?: string;
  url?: string;
  loadTime: number;
  size: number;
  entryType: 'largest-contentful-paint';
}

// 长任务条目类型
export interface LongTaskEntry extends PerformanceEntry {
  entryType: 'longtask';
  attribution: {
    containerType: string;
    containerSrc?: string;
    containerId?: string;
    containerName?: string;
  }[];
}

// 导出性能条目类型
export type { PerformanceEntryType } from './performance-api'