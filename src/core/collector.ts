import type { 
  PerformanceMetrics,
  PerformanceEntryType,
  Status,
  PerformanceEntryHandler,
  ResourceTiming,
  PerformanceLongTaskTiming,
  PerformanceEntry,
  NavigationTiming,
  LayoutShiftEntry,
  FirstInputEntry,
  PaintEntry,
  LargestContentfulPaintEntry,
  LongTaskEntry
} from '../types'
import { checkApiSupport, getFallbackValue } from '../utils/compatibility'
import { createEmptyMetrics } from '../types/performance'

export class PerformanceCollector {
  private metrics: PerformanceMetrics;
  private clsValue = 0;
  private clsEntries: PerformanceEntry[] = [];
  private observers: Map<PerformanceEntryType, PerformanceObserver> = new Map();
  private apiSupport = checkApiSupport();
  private status: Status = 'initial';

  constructor() {
    this.metrics = createEmptyMetrics();
    this.init();
  }

  private init(): void {
    const collectors = {
      'navigation': () => this.apiSupport.navigationTiming && this.collectNavigationTiming(),
      'resource': () => this.apiSupport.resourceTiming && this.collectResourceTiming(),
      'paint': () => this.apiSupport.performanceObserver && this.collectFCP(),
      'largest-contentful-paint': () => this.apiSupport.performanceObserver && this.collectLCP(),
      'first-input': () => this.apiSupport.performanceObserver && this.collectFID(),
      'layout-shift': () => this.apiSupport.performanceObserver && this.collectCLS(),
      'mark': () => this.apiSupport.userTiming && this.collectUserTiming(),
      'longtask': () => this.collectLongTasks(),
      'event': () => this.collectInteractions()
    } as const;

    Object.entries(collectors).forEach(([type, collector]) => {
      try {
        collector();
      } catch (error) {
        console.warn(`Failed to collect ${type} metrics:`, error);
      }
    });

    this.collectMemoryInfo();
    this.collectLayoutInfo();
    this.collectTTFB();
    this.collectTTI();
  }

  private collectPerformanceObserver(
    entryType: PerformanceEntryType,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    if (this.apiSupport.performanceObserver && !this.observers.has(entryType)) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });

        try {
          observer.observe({ 
            type: entryType,
            buffered: true 
          });
        } catch (error) {
          observer.observe({ entryTypes: [entryType] });
        }

        this.observers.set(entryType, observer);
        this.status = 'success';
      } catch (error) {
        this.status = 'error';
        console.warn(`PerformanceObserver for ${entryType} failed:`, error);
      }
    }
  }

  private formatTime(time: number): number {
    return time > 0 ? Number(time.toFixed(2)) : 0;
  }

  private collectNavigationTiming(): void {
    const navigation = getFallbackValue(
      () => performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      null
    );

    if (navigation) {
      const baseTime = navigation.fetchStart;
      
      this.metrics.navigation = {
        loadTime: this.formatTime(navigation.loadEventEnd - baseTime),
        domReady: this.formatTime(navigation.domContentLoadedEventEnd - baseTime),
        firstPaint: this.formatTime(performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-paint')?.startTime || 0),
        domInteractive: this.formatTime(navigation.domInteractive - baseTime),
        domComplete: this.formatTime(navigation.domComplete - baseTime),
        dnsTime: this.formatTime(navigation.domainLookupEnd - navigation.domainLookupStart),
        tcpTime: this.formatTime(navigation.connectEnd - navigation.connectStart),
        sslTime: navigation.secureConnectionStart ? 
          this.formatTime(navigation.connectEnd - navigation.secureConnectionStart) : 0,
        ttfb: this.formatTime(navigation.responseStart - navigation.requestStart),
        responseTime: this.formatTime(navigation.responseEnd - navigation.responseStart),
        domParseTime: this.formatTime(navigation.domInteractive - navigation.responseEnd),
        domReadyTime: this.formatTime(navigation.domContentLoadedEventEnd - baseTime)
      };
    }
  }

  private collectFCP(): void {
    if (this.apiSupport.performanceObserver) {
      const historicalEntries = this.collectHistoricalEntries('paint');
      const fcp = historicalEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.core.FCP = fcp.startTime;
      }

      this.collectPerformanceObserver('paint', (entries) => {
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          this.metrics.core.FCP = fcp.startTime;
        }
      });
    }
  }

  private collectLCP(): void {
    if (this.apiSupport.performanceObserver) {
      this.collectPerformanceObserver('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.core.LCP = lastEntry.startTime;
        }
      });
    }
  }

  private collectFID(): void {
    if (this.apiSupport.performanceObserver) {
      this.collectPerformanceObserver('first-input', (entries) => {
        const firstInput = entries[0] as PerformanceEntryHandler;
        if (firstInput?.processingStart) {
          this.metrics.core.FID = firstInput.processingStart - firstInput.startTime;
        }
      });
    }
  }

  private collectCLS(): void {
    if (this.apiSupport.performanceObserver) {
      this.collectPerformanceObserver('layout-shift', (entries) => {
        for (const entry of entries) {
          const layoutShift = entry as LayoutShiftEntry;
          if (!layoutShift.hadRecentInput) {
            this.clsValue += layoutShift.value;
            this.clsEntries.push(entry);
          }
        }
        
        this.metrics.core.CLS = this.calculateCLS();
      });
    }
  }

  private calculateCLS(): number {
    let sessionValues: number[] = [];
    let currentSessionValue = 0;
    let currentSessionStartTime = 0;

    this.clsEntries.forEach((entry) => {
      const layoutShift = entry as LayoutShiftEntry;
      
      if (currentSessionStartTime === 0) {
        currentSessionStartTime = layoutShift.startTime;
      } else if (
        layoutShift.startTime - currentSessionStartTime > 5000 || 
        layoutShift.startTime - (this.clsEntries[this.clsEntries.length - 1] as LayoutShiftEntry).startTime > 1000
      ) {
        sessionValues.push(currentSessionValue);
        currentSessionValue = 0;
        currentSessionStartTime = layoutShift.startTime;
      }
      currentSessionValue += layoutShift.value;
    });

    sessionValues.push(currentSessionValue);
    return Math.max(...sessionValues);
  }

  private collectTTFB(): void {
    const navigation = getFallbackValue(
      () => performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      null
    );

    if (navigation) {
      this.metrics.core.TTFB = this.formatTime(navigation.responseStart - navigation.requestStart);
    }
  }

  private collectResourceTiming(): void {
    const resources = getFallbackValue(
      () => performance.getEntriesByType('resource'),
      []
    );

    this.metrics.resources = resources.map(entry => ({
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: Math.round(entry.duration),
      unit: 'ms',
      category: 'resource',
      value: entry.duration,
      transferSize: (entry as PerformanceResourceTiming).transferSize,
      initiatorType: (entry as PerformanceResourceTiming).initiatorType,
      nextHopProtocol: (entry as PerformanceResourceTiming).nextHopProtocol,
      workerStart: (entry as PerformanceResourceTiming).workerStart,
      redirectStart: (entry as PerformanceResourceTiming).redirectStart,
      redirectEnd: (entry as PerformanceResourceTiming).redirectEnd,
      fetchStart: (entry as PerformanceResourceTiming).fetchStart,
      domainLookupStart: (entry as PerformanceResourceTiming).domainLookupStart,
      domainLookupEnd: (entry as PerformanceResourceTiming).domainLookupEnd,
      connectStart: (entry as PerformanceResourceTiming).connectStart,
      connectEnd: (entry as PerformanceResourceTiming).connectEnd,
      secureConnectionStart: (entry as PerformanceResourceTiming).secureConnectionStart,
      requestStart: (entry as PerformanceResourceTiming).requestStart,
      responseStart: (entry as PerformanceResourceTiming).responseStart,
      responseEnd: (entry as PerformanceResourceTiming).responseEnd
    })) as ResourceTiming[];
  }

  private collectUserTiming(): void {
    const entries = getFallbackValue(
      () => [...performance.getEntriesByType('mark'), ...performance.getEntriesByType('measure')],
      []
    );

    this.metrics.userTimings = entries.map(entry => ({
      name: entry.name,
      entryType: entry.entryType as 'mark' | 'measure',
      startTime: entry.startTime,
      duration: entry.duration,
      detail: (entry as any).detail
    })) as UserTiming[];
  }

  private collectLongTasks(): void {
    if (this.apiSupport.performanceObserver) {
      this.collectPerformanceObserver('longtask', (entries) => {
        this.metrics.longTasks = {
          count: entries.length,
          firstInputTime: entries[0]?.startTime || 0,
          interactionTime: entries.reduce((total, entry) => total + entry.duration, 0),
          tasks: entries as PerformanceLongTaskTiming[]
        };
      });
    }
  }

  private collectInteractions(): void {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const firstInput = entries[0] as PerformanceEventTiming;
        this.metrics.core.firstInputTime = firstInput.startTime;
        this.metrics.core.interactionTime = firstInput.duration;
      }
    }).observe({ entryTypes: ['event'] });
  }

  private collectMemoryInfo(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.system = {
        ...this.metrics.system,
        jsHeapSize: Math.round(memory.usedJSHeapSize / (1024 * 1024)),
        domNodes: document.getElementsByTagName('*').length,
        layoutCount: this.metrics.system.layoutCount || 0,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        devicePixelRatio: window.devicePixelRatio,
        platform: navigator.platform,
        userAgent: navigator.userAgent
      };
    }
  }

  private collectLayoutInfo(): void {
    let layoutCount = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'layout-shift') {
          layoutCount++;
        }
      }
      this.metrics.core.layoutCount = layoutCount;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private collectTTI(): void {
    if (!this.apiSupport.performanceObserver) return;

    let firstLongTaskSeen = false;
    let lastLongTaskFinishTime = 0;
    let longTaskCount = 0;

    this.collectPerformanceObserver('longtask', (entries) => {
      entries.forEach((entry) => {
        if (!firstLongTaskSeen) {
          firstLongTaskSeen = true;
          lastLongTaskFinishTime = entry.startTime + entry.duration;
        }

        longTaskCount++;
        const taskEnd = entry.startTime + entry.duration;
        if (taskEnd > lastLongTaskFinishTime) {
          lastLongTaskFinishTime = taskEnd;
        }
      });

      if (firstLongTaskSeen && this.metrics.core.FCP > 0) {
        this.metrics.core.TTI = Math.max(this.metrics.core.FCP, lastLongTaskFinishTime);
      }
    });
  }

  private collectHistoricalEntries(entryType: string): PerformanceEntry[] {
    try {
      return performance.getEntriesByType(entryType);
    } catch {
      return [];
    }
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  public getStatus(): Status {
    return this.status;
  }

  public isSupported(feature: keyof typeof this.apiSupport): boolean {
    return this.apiSupport[feature];
  }

  public async collect(): Promise<PerformanceMetrics> {
    try {
      this.status = 'loading';
      await new Promise(resolve => setTimeout(resolve, 0));
      this.status = 'success';
      return this.metrics;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }
} 