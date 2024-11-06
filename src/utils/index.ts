import { WebVitalsCollector } from './collectors'
import { checkApiSupport, getBrowserInfo, getFallbackValue } from './compatibility'
import { formatTime, calculateTimeDiff, getMetricStatus, getMetricStatusText, createInitialRealTimeMetrics } from './metrics'
import { convertUnits, formatDisplay } from './units'
import type { SamplingOptions, RetryOptions } from '@/types'
import { DEFAULT_CONFIG } from '@/types/constants'

// 导出工具函数
export {
  formatTime,
  calculateTimeDiff,
  getMetricStatus,
  getMetricStatusText,
  createInitialRealTimeMetrics
} from './metrics'

export {
  convertUnits,
  formatDisplay
} from './units'

export {
  checkApiSupport,
  getBrowserInfo,
  getFallbackValue
} from './compatibility'

// 导出工具类
export { WebVitalsCollector } from './collectors'
export { PerformanceMarkerImpl } from './performance'

// 采样工具
export const shouldSample = (options: SamplingOptions = { 
  rate: DEFAULT_CONFIG.SAMPLING_RATE,
  always: []
}): boolean => {
  if (options.always?.length > 0) {
    return true;
  }
  return Math.random() < (options.rate || 1);
};

// 重试工具
export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (options.times <= 0) {
      throw error;
    }

    if (options.onRetry) {
      options.onRetry(options.times, error as Error);
    }

    await new Promise(resolve => setTimeout(resolve, options.delay));
    return retry(fn, { 
      ...options, 
      times: options.times - 1 
    });
  }
};

// 导出类型
export type { 
  ApiSupport, 
  BrowserInfo 
} from './compatibility'