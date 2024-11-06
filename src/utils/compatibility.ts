// API 支持情况类型
export interface ApiSupport {
  performanceObserver: boolean;
  navigationTiming: boolean;
  resourceTiming: boolean;
  userTiming: boolean;
  highResolutionTime: boolean;
  performanceTimeline: boolean;
  memory: boolean;
}

// 浏览器信息类型
export interface BrowserInfo {
  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  version: string;
}

// 检查 API 支持情况
export const checkApiSupport = (): ApiSupport => {
  const support = {
    performanceObserver: 'PerformanceObserver' in window,
    navigationTiming: false,
    resourceTiming: 'getEntriesByType' in performance,
    userTiming: 'mark' in performance && 'measure' in performance,
    highResolutionTime: 'now' in performance,
    performanceTimeline: 'getEntries' in performance,
    memory: 'memory' in performance
  };

  // 检查 Navigation Timing API 支持
  try {
    const navEntries = performance.getEntriesByType('navigation');
    support.navigationTiming = navEntries && navEntries.length > 0;
  } catch {
    support.navigationTiming = false;
  }

  return support;
}

// 获取浏览器信息
export const getBrowserInfo = (): BrowserInfo => {
  const ua = navigator.userAgent;
  const isChrome = /Chrome/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  
  return {
    isChrome,
    isSafari,
    isFirefox,
    version: ua
  };
}

// 降级处理工具
export const getFallbackValue = <T>(getValue: () => T, fallback: T): T => {
  try {
    return getValue();
  } catch {
    return fallback;
  }
} 