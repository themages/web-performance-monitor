import { describe, it, expect } from 'vitest';
import { PerformanceCollector } from '../src/core/collector';

describe('PerformanceCollector', () => {
  it('should initialize with default values', () => {
    const collector = new PerformanceCollector();
    collector.collect().then(metrics => {
      expect(metrics).toBeDefined();
      expect(metrics.FCP).toBeDefined();
      expect(metrics.LCP).toBeDefined();
      expect(metrics.FID).toBeDefined();
      expect(metrics.CLS).toBeDefined();
      expect(metrics.TTFB).toBeDefined();
      expect(Array.isArray(metrics.resourceTiming)).toBe(true);
    });
  });
}); 