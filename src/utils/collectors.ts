import type { 
  LayoutShiftEntry, 
  FirstInputEntry,
  PaintEntry,
  LargestContentfulPaintEntry,
  PerformanceLongTaskTiming 
} from '../types'
import { formatTime, calculateTimeDiff } from './metrics'

// Web Vitals 数据收集器
export class WebVitalsCollector {
  private clsEntries: LayoutShiftEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private onUpdate: (metrics: Record<string, number>) => void;
  private isRunning = false;

  constructor(onUpdate: (metrics: Record<string, number>) => void) {
    this.onUpdate = onUpdate;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // 先收集历史数据
    this.collectHistoricalData();
    
    // 然后开始观察新数据
    this.observePaintEntries();
    this.observeFirstInput();
    this.observeLayoutShift();
    this.observeLongTasks();
    this.calculateTTFB();
  }

  private collectHistoricalData() {
    // 收集历史 Paint 数据
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      this.onUpdate({ FCP: formatTime(fcp.startTime) });
    }

    // 收集历史 LCP 数据
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const lastLcp = lcpEntries[lcpEntries.length - 1] as LargestContentfulPaintEntry;
      this.onUpdate({ LCP: formatTime(lastLcp.startTime) });
    }

    // 收集历史布局偏移数据
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    layoutShiftEntries.forEach(entry => {
      if (!(entry as LayoutShiftEntry).hadRecentInput) {
        this.clsEntries.push(entry as LayoutShiftEntry);
      }
    });
    if (this.clsEntries.length > 0) {
      this.onUpdate({ CLS: this.calculateCLS() });
    }
  }

  private observePaintEntries() {
    try {
      const observer = new PerformanceObserver((list) => {
        if (!this.isRunning) return;
        
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.onUpdate({ FCP: formatTime(entry.startTime) });
          }
        }
      });

      observer.observe({ type: 'paint' });
      this.observers.push(observer);

      // 单独观察 LCP
      const lcpObserver = new PerformanceObserver((list) => {
        if (!this.isRunning) return;
        
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry;
          this.onUpdate({ LCP: formatTime(lastEntry.startTime) });
        }
      });

      lcpObserver.observe({ type: 'largest-contentful-paint' });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('Paint observer creation failed:', error);
    }
  }

  private observeFirstInput() {
    try {
      const observer = new PerformanceObserver((list) => {
        if (!this.isRunning) return;

        const entry = list.getEntries()[0] as FirstInputEntry;
        if (entry) {
          this.onUpdate({ 
            FID: formatTime(entry.processingStart - entry.startTime),
            firstInputTime: formatTime(entry.startTime)
          });
        }
      });

      observer.observe({ type: 'first-input' });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observer creation failed:', error);
    }
  }

  private observeLayoutShift() {
    try {
      const observer = new PerformanceObserver((list) => {
        if (!this.isRunning) return;

        for (const entry of list.getEntries()) {
          if (!(entry as LayoutShiftEntry).hadRecentInput) {
            this.clsEntries.push(entry as LayoutShiftEntry);
            this.onUpdate({ CLS: this.calculateCLS() });
          }
        }
      });

      observer.observe({ type: 'layout-shift' });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observer creation failed:', error);
    }
  }

  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        if (!this.isRunning) return;

        const entries = list.getEntries() as PerformanceLongTaskTiming[];
        if (entries.length > 0) {
          const lastTask = entries[entries.length - 1];
          const tti = lastTask.startTime + lastTask.duration;
          this.onUpdate({ TTI: formatTime(tti) });
        }
      });

      observer.observe({ type: 'longtask' });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTI observer creation failed:', error);
    }
  }

  stop() {
    this.isRunning = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clsEntries = [];
  }

  private calculateCLS(): number {
    let sessionValues: number[] = [];
    let currentSessionValue = 0;
    let currentSessionStartTime = 0;

    this.clsEntries.forEach((entry) => {
      if (currentSessionStartTime === 0) {
        currentSessionStartTime = entry.startTime;
      } else if (
        entry.startTime - currentSessionStartTime > 5000 || 
        entry.startTime - this.clsEntries[this.clsEntries.length - 1].startTime > 1000
      ) {
        sessionValues.push(currentSessionValue);
        currentSessionValue = 0;
        currentSessionStartTime = entry.startTime;
      }
      currentSessionValue += entry.value;
    });

    sessionValues.push(currentSessionValue);
    return Number(Math.max(...sessionValues).toFixed(4));
  }

  private calculateTTFB() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.onUpdate({ 
          TTFB: calculateTimeDiff(navigation.responseStart, navigation.requestStart)
        });
      }
    } catch (error) {
      console.warn('TTFB calculation failed:', error);
    }
  }
} 