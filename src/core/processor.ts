import type { 
  PerformanceMetrics, 
  ProcessorOptions, 
  ProcessorResult,
  MetricsProcessor,
  RealTimeMetrics
} from '../types'
import { formatTime, calculateTimeDiff } from '../utils/metrics'
import { METRIC_THRESHOLDS } from '../constants/metrics'
import { convertUnits } from '../utils/units'

export class MetricsProcessorImpl implements MetricsProcessor {
  process(
    metrics: Partial<PerformanceMetrics & RealTimeMetrics>, 
    options: ProcessorOptions = { enabled: true }
  ): ProcessorResult<PerformanceMetrics> {
    const startTime = performance.now();
    
    try {
      const processed: PerformanceMetrics = {
        name: 'performance',
        value: 0,
        timestamp: Date.now(),
        unit: 'ms',
        category: 'core-vitals',
        core: {
          FCP: this.formatMetric(metrics.core?.FCP || 0, options),
          LCP: this.formatMetric(metrics.core?.LCP || 0, options),
          FID: this.formatMetric(metrics.core?.FID || 0, options),
          CLS: this.roundToDecimals(metrics.core?.CLS || 0, options.precision || 3),
          TTFB: this.formatMetric(metrics.core?.TTFB || 0, options),
          TTI: this.formatMetric(metrics.core?.TTI || 0, options)
        },
        navigation: {
          dnsTime: this.formatMetric(metrics.navigation?.dnsTime || 0, options),
          tcpTime: this.formatMetric(metrics.navigation?.tcpTime || 0, options),
          sslTime: this.formatMetric(metrics.navigation?.sslTime || 0, options),
          ttfb: this.formatMetric(metrics.navigation?.ttfb || 0, options),
          responseTime: this.formatMetric(metrics.navigation?.responseTime || 0, options),
          domParseTime: this.formatMetric(metrics.navigation?.domParseTime || 0, options),
          domReadyTime: this.formatMetric(metrics.navigation?.domReadyTime || 0, options),
          loadTime: this.formatMetric(metrics.navigation?.loadTime || 0, options)
        },
        resources: (metrics.resources || []).map(resource => ({
          ...resource,
          duration: this.formatMetric(resource.duration || 0, options)
        })),
        longTasks: {
          count: metrics.longTasks?.count || 0,
          firstInputTime: this.formatMetric(metrics.longTasks?.firstInputTime || 0, options),
          interactionTime: this.formatMetric(metrics.longTasks?.interactionTime || 0, options)
        },
        system: {
          jsHeapSize: Math.round(metrics.system?.jsHeapSize || 0),
          domNodes: metrics.system?.domNodes || 0,
          layoutCount: metrics.system?.layoutCount || 0,
          deviceMemory: metrics.system?.deviceMemory,
          hardwareConcurrency: metrics.system?.hardwareConcurrency,
          devicePixelRatio: metrics.system?.devicePixelRatio || window.devicePixelRatio,
          platform: metrics.system?.platform || navigator.platform,
          userAgent: metrics.system?.userAgent || navigator.userAgent
        }
      };

      const scores = this.calculatePerformanceScores(processed);

      return {
        data: processed,
        timestamp: Date.now(),
        duration: performance.now() - startTime,
        metadata: {
          processor: 'MetricsProcessorImpl',
          version: '1.0.0',
          options,
          scores
        }
      };
    } catch (error) {
      console.error('Metrics processing failed:', error);
      throw error;
    }
  }

  private formatMetric(value: number | undefined, options: ProcessorOptions): number {
    if (!value) return 0;
    return options.roundToMs ? Math.round(value) : Number(value.toFixed(2));
  }

  private roundToDecimals(value: number, precision: number): number {
    if (!value) return 0;
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  private calculatePerformanceScores(metrics: PerformanceMetrics) {
    return {
      FCP: this.calculateScore(metrics.core.FCP, METRIC_THRESHOLDS.FCP),
      LCP: this.calculateScore(metrics.core.LCP, METRIC_THRESHOLDS.LCP),
      FID: this.calculateScore(metrics.core.FID, METRIC_THRESHOLDS.FID),
      CLS: this.calculateScore(metrics.core.CLS, METRIC_THRESHOLDS.CLS, true),
      TTFB: this.calculateScore(metrics.core.TTFB, METRIC_THRESHOLDS.TTFB),
      TTI: this.calculateScore(metrics.core.TTI, METRIC_THRESHOLDS.TTI)
    };
  }

  private calculateScore(value: number, threshold: number, isLower = false): number {
    if (!value) return 0;
    if (isLower) {
      return value <= threshold ? 1 : threshold / value;
    }
    return value <= threshold ? 1 : threshold / value;
  }
}