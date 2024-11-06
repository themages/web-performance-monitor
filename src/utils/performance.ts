import type { PerformanceMark, PerformanceMeasure, PerformanceMarker } from '../types'
import type { Status } from '../types/base'
import type { MetricCategory } from '../types/metrics'
import { STATUS } from '../constants/config'
import { METRIC_UNITS, METRIC_STATUS } from '../constants/metrics'

export class PerformanceMarkerImpl implements PerformanceMarker {
  private marks: Map<string, PerformanceMark> = new Map();
  private measures: Map<string, PerformanceMeasure> = new Map();
  private status: Status = STATUS.INITIAL;
  private metadata: Map<string, Record<string, any>> = new Map();
  
  mark(name: string, detail?: any): PerformanceMark {
    try {
      const mark: PerformanceMark = {
        type: 'mark',
        timestamp: Date.now(),
        name,
        value: 0,
        unit: METRIC_UNITS.TIME,
        category: 'mark' as MetricCategory,
        entryType: 'mark',
        startTime: performance.now(),
        duration: 0,
        status: STATUS.SUCCESS as Status,
        toJSON: () => ({
          name,
          entryType: 'mark',
          startTime: performance.now(),
          duration: 0,
          detail,
          status: METRIC_STATUS.GOOD
        }),
        detail,
        metadata: {
          source: 'performance-marker',
          category: 'mark',
          timestamp: Date.now()
        }
      };
      
      this.marks.set(name, mark);
      performance.mark(name);
      return mark;
    } catch (error) {
      this.status = STATUS.ERROR;
      throw error;
    }
  }
  
  measure(name: string, startMark: string, endMark?: string): PerformanceMeasure {
    try {
      const start = this.marks.get(startMark);
      if (!start) {
        throw new Error(`Start mark "${startMark}" not found`);
      }
      
      const endTime = endMark 
        ? this.marks.get(endMark)?.startTime 
        : performance.now();
        
      if (typeof endTime !== 'number') {
        throw new Error(`End mark "${endMark}" not found`);
      }
      
      const duration = endTime - start.startTime;
      const measure: PerformanceMeasure = {
        type: 'measure',
        timestamp: Date.now(),
        name,
        value: duration,
        unit: METRIC_UNITS.TIME,
        category: 'measure' as MetricCategory,
        entryType: 'measure',
        startTime: start.startTime,
        duration,
        startMark,
        endMark: endMark || '',
        detail: start.detail,
        status: STATUS.SUCCESS as Status,
        toJSON: () => ({
          name,
          entryType: 'measure',
          startTime: start.startTime,
          duration,
          startMark,
          endMark: endMark || '',
          detail: start.detail,
          status: METRIC_STATUS.GOOD
        }),
        metadata: {
          source: 'performance-marker',
          category: 'measure',
          timestamp: Date.now()
        }
      };
      
      performance.measure(name, startMark, endMark);
      return measure;
    } catch (error) {
      this.status = STATUS.ERROR;
      throw error;
    }
  }
  
  getStatus(): Status {
    return this.status;
  }
  
  clearMarks(name?: string): void {
    if (name) {
      this.marks.delete(name);
      performance.clearMarks(name);
    } else {
      this.marks.clear();
      performance.clearMarks();
    }
  }
  
  clearMeasures(name?: string): void {
    if (name) {
      this.measures.delete(name);
      performance.clearMeasures(name);
    } else {
      this.measures.clear();
      performance.clearMeasures();
    }
  }
  
  getMarks(): PerformanceMark[] {
    return Array.from(this.marks.values());
  }
  
  getMeasures(): PerformanceMeasure[] {
    return Array.from(this.measures.values());
  }
  
  getEntriesByName(name: string, type?: 'mark' | 'measure'): (PerformanceMark | PerformanceMeasure)[] {
    if (type === 'mark') {
      return this.marks.has(name) ? [this.marks.get(name)!] : [];
    } else if (type === 'measure') {
      return this.measures.has(name) ? [this.measures.get(name)!] : [];
    }
    return [
      ...(this.marks.has(name) ? [this.marks.get(name)!] : []),
      ...(this.measures.has(name) ? [this.measures.get(name)!] : [])
    ];
  }
  
  now(): number {
    return performance.now();
  }
  
  timeOrigin(): number {
    return performance.timeOrigin;
  }
  
  setMetadata(name: string, metadata: Record<string, any>): void {
    const existingMetadata = this.metadata.get(name) || {};
    this.metadata.set(name, {
      ...existingMetadata,
      ...metadata,
      timestamp: Date.now()
    });

    const mark = this.marks.get(name);
    if (mark) {
      mark.metadata = {
        ...mark.metadata,
        ...metadata
      };
    }

    const measure = this.measures.get(name);
    if (measure) {
      measure.metadata = {
        ...measure.metadata,
        ...metadata
      };
    }
  }

  getMetadata(name: string): Record<string, any> | undefined {
    return this.metadata.get(name);
  }
} 