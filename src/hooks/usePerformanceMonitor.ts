import { ref } from 'vue'
import type {
  RealTimeMetrics,
  MonitorStatus,
  PerformanceEntryType,
  ResourceTiming
} from '@/types'
import {
  MONITOR_CONFIG,
  MONITOR_STATUS
} from '@/types/constants'
import {
  formatTime,
  calculateTimeDiff,
  createInitialRealTimeMetrics
} from '@/utils'

interface MonitorHookOptions {
  updateInterval?: number;
}

// 修改 RealTimeMetrics 接口，添加新字段
interface RealTimeMetricsWithLayout extends RealTimeMetrics {
  layoutTime: number;
  styleTime: number;
}

// 修改初始化函数，扩展已有的函数
const createInitialMetricsWithLayout = (): RealTimeMetricsWithLayout => ({
  ...createInitialRealTimeMetrics(),
  layoutTime: 0,
  styleTime: 0
});

// 添加 createPerformanceObserver 函数
const createPerformanceObserver = (
  entryTypes: string[], 
  callback: (entries: PerformanceEntry[]) => void
): PerformanceObserver | null => {
  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    try {
      // 尝试使用新的 observe API
      entryTypes.forEach(type => {
        observer.observe({ 
          type,
          buffered: true 
        });
      });
    } catch (error) {
      // 回退到旧的 API
      observer.observe({ entryTypes });
    }

    return observer;
  } catch (error) {
    console.warn('Performance observer creation failed:', error);
    return null;
  }
};

export function usePerformanceMonitor(options?: MonitorHookOptions) {
  // 使用新的初始化函数
  const performanceMetrics = ref<RealTimeMetricsWithLayout>(createInitialMetricsWithLayout());
  const monitorStatus = ref<MonitorStatus>(MONITOR_STATUS.INITIAL);
  
  // 定时器和观察器
  let frameId: number;
  let metricsTimer: number;
  let paintObserver: PerformanceObserver | null = null;

  // Navigation Timing 监控
  const monitorNavigation = () => {
    try {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const navigation = entries[0] as PerformanceNavigationTiming;
        const baseTime = navigation.fetchStart;

        performanceMetrics.value.navigation = {
          dnsTime: calculateTimeDiff(navigation.domainLookupEnd, navigation.domainLookupStart),
          tcpTime: calculateTimeDiff(navigation.connectEnd, navigation.connectStart),
          sslTime: navigation.secureConnectionStart ? 
            calculateTimeDiff(navigation.connectEnd, navigation.secureConnectionStart) : 0,
          ttfb: calculateTimeDiff(navigation.responseStart, navigation.requestStart),
          responseTime: calculateTimeDiff(navigation.responseEnd, navigation.responseStart),
          domParseTime: calculateTimeDiff(navigation.domInteractive, navigation.responseEnd),
          domReadyTime: calculateTimeDiff(navigation.domContentLoadedEventEnd, baseTime),
          loadTime: calculateTimeDiff(navigation.loadEventEnd, baseTime)
        };
      }
    } catch (error) {
      console.warn('Navigation timing collection failed:', error);
    }
  }

  // FPS 监控
  let lastTime = performance.now()
  let frames = 0

  const calculateFPS = () => {
    if (monitorStatus.value !== MONITOR_STATUS.RUNNING) return;
    
    frames++
    const currentTime = performance.now()
    
    if (currentTime >= lastTime + MONITOR_CONFIG.FPS.SAMPLE_INTERVAL) {
      const timeDiff = currentTime - lastTime;
      const fps = Math.min(Math.round((frames * 1000) / timeDiff), 60);
      
      // 只在 FPS 变化超过阈值时更新
      const lastFps = metricsCache.value.get('fps') || 0;
      if (Math.abs(fps - lastFps) > 5) {
        performanceMetrics.value.fps = fps;
        metricsCache.value.set('fps', fps);
      }
      
      frames = 0;
      lastTime = currentTime;
    }
    
    frameId = requestAnimationFrame(calculateFPS)
  }

  // 更新网络状态
  const updateNetworkStatus = () => {
    performanceMetrics.value.network.online = navigator.onLine;
  };

  // 监听网络状态变化
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // 更新内存使用率
  const updateMemoryUsage = () => {
    const memory = performanceMetrics.value.memory;
    memory.usagePercent = memory.total > 0 ? (memory.used / memory.total) * 100 : 0;
  };

  // 添加数据缓存
  const metricsCache = ref<Map<string, number>>(new Map());

  // 修改更新指标的处理
  const updateMetricsNow = async (): Promise<void> => {
    if (monitorStatus.value !== MONITOR_STATUS.RUNNING) return;

    try {
      // 更新导航计时
      monitorNavigation();

      // 更新内存使用
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        const total = Math.round(memory.totalJSHeapSize / (1024 * 1024));
        const limit = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));
        
        // 只在值发生变化时更新
        if (used !== metricsCache.value.get('memoryUsed')) {
          performanceMetrics.value.memory = {
            used,
            total,
            limit,
            usagePercent: total > 0 ? Math.round((used / total) * 100) : 0
          };
          metricsCache.value.set('memoryUsed', used);
        }
      }

      // 更新网络状态
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const downlink = Number(connection.downlink || 0);
        const rtt = Number(connection.rtt || 0);
        
        // 只在值发生变化时更新
        if (downlink !== metricsCache.value.get('networkDownlink') ||
            rtt !== metricsCache.value.get('networkRtt')) {
          performanceMetrics.value.network = {
            ...performanceMetrics.value.network,
            downlink,
            rtt,
            effectiveType: connection.effectiveType || 'unknown',
            saveData: connection.saveData || false,
            online: navigator.onLine
          };
          metricsCache.value.set('networkDownlink', downlink);
          metricsCache.value.set('networkRtt', rtt);
        }
      }

      // 更新系统信息
      const domNodes = document.getElementsByTagName('*').length;
      if (domNodes !== metricsCache.value.get('domNodes')) {
        performanceMetrics.value.system = {
          deviceMemory: (navigator as any).deviceMemory,
          hardwareConcurrency: navigator.hardwareConcurrency,
          devicePixelRatio: window.devicePixelRatio,
          platform: navigator.platform,
          userAgent: navigator.userAgent
        };
        metricsCache.value.set('domNodes', domNodes);
      }

    } catch (error) {
      console.error('Failed to update metrics:', error);
      monitorStatus.value = MONITOR_STATUS.ERROR;
      throw error;
    }
  };

  // 清理缓存
  const cleanup = () => {
    metricsCache.value.clear();
    window.removeEventListener('online', updateNetworkStatus);
    window.removeEventListener('offline', updateNetworkStatus);
  };

  // 修改绘制性能监控
  const monitorPaint = () => {
    paintObserver = createPerformanceObserver(['paint', 'largest-contentful-paint'], (entries) => {
      if (monitorStatus.value !== MONITOR_STATUS.RUNNING) return;

      for (const entry of entries) {
        const time = Math.round(entry.startTime);
        const cacheKey = `paint_${entry.name}`;
        
        if (time !== metricsCache.value.get(cacheKey)) {
          switch(entry.name) {
            case 'first-paint':
              performanceMetrics.value.paint.fpaint = time;
              break;
            case 'first-contentful-paint':
              performanceMetrics.value.paint.fcpaint = time;
              break;
            case 'largest-contentful-paint':
              if (time > (performanceMetrics.value.paint.lcpaint || 0)) {
                performanceMetrics.value.paint.lcpaint = time;
              }
              break;
          }
          metricsCache.value.set(cacheKey, time);
        }
      }
    });
  };

  // 更新标
  const updateMetrics = () => {
    if (monitorStatus.value !== MONITOR_STATUS.RUNNING) return;
    updateMetricsNow();
    metricsTimer = window.setTimeout(
      updateMetrics, 
      options?.updateInterval || MONITOR_CONFIG.UPDATE_INTERVAL
    );
  };

  // 修改布局和样式重计算的监控
  const monitorLayoutAndStyle = () => {
    let layoutTime = 0;
    let styleTime = 0;

    // 监控布局变化
    const layoutObserver = createPerformanceObserver(['layout-shift'], (entries) => {
      if (monitorStatus.value !== MONITOR_STATUS.RUNNING) return;
      
      entries.forEach(entry => {
        layoutTime += entry.duration || 0;
      });
      
      performanceMetrics.value.layoutTime = layoutTime;
    });

    // 修改样式重计算监控，使用正确的性能条目类型
    const styleObserver = createPerformanceObserver(['element', 'resource'], (entries) => {
      if (monitorStatus.value !== MONITOR_STATUS.RUNNING) return;
      
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as ResourceTiming;
          if (resourceEntry.name.endsWith('.css') || resourceEntry.initiatorType === 'css') {
            styleTime += entry.duration || 0;
          }
        }
      });
      
      performanceMetrics.value.styleTime = styleTime;
    });

    return { layoutObserver, styleObserver };
  };

  // 修改 RealTimeMetrics 接口，添加新字段
  interface RealTimeMetrics {
    // ... 其他字段保持不变
    layoutTime: number;
    styleTime: number;
  }

  // 修改初始化函数
  const createInitialRealTimeMetrics = (): RealTimeMetrics => ({
    // ... 其他字段保持不变
    layoutTime: 0,
    styleTime: 0
  });

  // 在 setup 函数中添加观察器
  let layoutStyleObservers: { layoutObserver: PerformanceObserver | null, styleObserver: PerformanceObserver | null };

  // 启动监控
  const startMonitoring = () => {
    if (monitorStatus.value === MONITOR_STATUS.RUNNING) return;
    monitorStatus.value = MONITOR_STATUS.RUNNING;
    calculateFPS();
    monitorPaint();
    layoutStyleObservers = monitorLayoutAndStyle();
    updateMetrics();
  };

  // 暂停监控
  const pauseMonitoring = () => {
    monitorStatus.value = MONITOR_STATUS.PAUSED
  }

  // 恢复监控
  const resumeMonitoring = () => {
    if (monitorStatus.value === MONITOR_STATUS.PAUSED) {
      monitorStatus.value = MONITOR_STATUS.RUNNING
    }
  }

  // 停止监控
  const stopMonitoring = () => {
    monitorStatus.value = MONITOR_STATUS.STOPPED;
    cancelAnimationFrame(frameId);
    clearTimeout(metricsTimer);
    paintObserver?.disconnect();
    layoutStyleObservers?.layoutObserver?.disconnect();
    layoutStyleObservers?.styleObserver?.disconnect();
    cleanup();
  };

  return {
    performanceMetrics,
    monitorStatus,
    startMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    stopMonitoring,
    updateMetricsNow,
    cleanup
  }
} 