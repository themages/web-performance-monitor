import type { RealTimeMetrics } from '../types'

// 创建初始实时指标
export const createInitialRealTimeMetrics = (): RealTimeMetrics => ({
  name: 'realtime',
  value: 0,
  timestamp: Date.now(),
  unit: 'ms',
  category: 'core-vitals',
  fps: 0,
  memory: {
    used: 0,
    total: 0,
    limit: 0,
    usagePercent: 0
  },
  network: {
    downlink: 0,
    rtt: 0,
    effectiveType: '',
    online: navigator.onLine,
    saveData: false
  },
  paint: {
    fpaint: 0,
    fcpaint: 0,
    lcpaint: 0
  },
  navigation: {
    dnsTime: 0,
    tcpTime: 0,
    sslTime: 0,
    ttfb: 0,
    responseTime: 0,
    domParseTime: 0,
    domReadyTime: 0,
    loadTime: 0
  },
  system: {
    deviceMemory: (navigator as any).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    devicePixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    jsHeapSize: 0,
    domNodes: 0,
    layoutCount: 0
  },
  layoutTime: 0,
  styleTime: 0,
  core: {
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
    TTI: 0,
    firstInputTime: 0,
    interactionTime: 0,
    layoutCount: 0
  }
});

// 格式化时间
export const formatTime = (time: number): number => {
  return time > 0 ? Number(time.toFixed(2)) : 0;
};

// 计算时间差
export const calculateTimeDiff = (end: number, start: number): number => {
  const diff = end - start;
  return formatTime(diff);
};

// 添加指标状态判断函数
export function getMetricStatus(value: string | number, threshold: number, isRatio = false): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'poor';
  
  return numValue <= threshold ? 'good' : 'poor';
}

export function getMetricStatusText(value: string | number, threshold: number, isRatio = false): string {
  const status = getMetricStatus(value, threshold, isRatio);
  return status === 'good' ? 'Good' : 'Poor';
}