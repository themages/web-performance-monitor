import type {
  NavigationTiming,
  ResourceTiming,
  UserTiming,
  PerformanceEntryType,
  PerformanceObserverInit,
  PerformanceLongTaskTiming,
  BasePerformanceEntry
} from '../types/performance-api';
import type { 
  PerformanceMark, 
  PerformanceMeasure, 
  PerformanceMarker 
} from '../types/marks';
import type { 
  BaseObserver, 
  BaseStorage, 
  BaseListener,
  Status 
} from '../types/base';
import { STATUS } from '../constants/config';
import { checkApiSupport } from '../utils/compatibility';

export class PerformanceManager implements BaseObserver<PerformanceEntry, PerformanceEntryType>, BaseListener {
  private observers: Map<PerformanceEntryType, PerformanceObserver> = new Map();
  private marks: Map<string, PerformanceMark> = new Map();
  private measures: Map<string, PerformanceMeasure> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();
  private storage: BaseStorage<PerformanceEntry[]>;
  private status: Status = STATUS.INITIAL;
  private apiSupport = checkApiSupport();

  constructor(storage?: BaseStorage<PerformanceEntry[]>) {
    this.storage = storage || this.createDefaultStorage();
    this.initializeObservers();
  }

  private createDefaultStorage(): BaseStorage<PerformanceEntry[]> {
    return {
      async get(key: string) { return null; },
      async set(key: string, value: PerformanceEntry[]) {},
      async remove(key: string) {},
      async clear() {}
    };
  }

  private initializeObservers(): void {
    if (!this.apiSupport.performanceObserver) {
      console.warn('PerformanceObserver API is not supported');
      return;
    }

    const entryTypes: PerformanceEntryType[] = [
      'navigation',
      'resource',
      'longtask',
      'mark',
      'measure',
      'paint',
      'first-input',
      'layout-shift'
    ];

    entryTypes.forEach(type => {
      try {
        this.observe(type);
      } catch (error) {
        console.warn(`Failed to observe ${type}:`, error);
      }
    });
  }

  // BaseObserver 实现
  observe(type: PerformanceEntryType): void {
    if (!this.apiSupport.performanceObserver) return;

    if (this.observers.has(type)) {
      this.observers.get(type)?.disconnect();
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.emit(`${type}Entry`, entries);
        this.storage.set(`${type}Entries`, entries);
      });

      observer.observe({ entryTypes: [type], buffered: true });
      this.observers.set(type, observer);
      this.status = STATUS.SUCCESS;
    } catch (error) {
      this.status = STATUS.ERROR;
      console.error(`Failed to create observer for ${type}:`, error);
    }
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }

  takeRecords(): PerformanceEntry[] {
    const records: PerformanceEntry[] = [];
    this.observers.forEach(observer => {
      records.push(...observer.takeRecords());
    });
    return records;
  }

  // BaseListener 实现
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  once(event: string, callback: Function): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  // 状态管理
  getStatus(): Status {
    return this.status;
  }

  // API 支持检查
  isSupported(feature: keyof typeof this.apiSupport): boolean {
    return this.apiSupport[feature];
  }
} 