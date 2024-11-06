<script lang="ts">
import { defineComponent, onMounted, ref, inject, onUnmounted, watch, computed } from 'vue'
import { 
  PerformanceCollector,
  PerformanceReporter,
  MetricsProcessorImpl,
  createEmptyMetrics,
  getMetricStatus,
  getMetricStatusText,
  formatDisplay
} from '../core'
import { PERFORMANCE_METRICS, METRIC_THRESHOLDS } from '../constants/metrics'
import { MONITOR_CONFIG, MONITOR_STATUS } from '../constants/monitor'
import { monitorPropsDefinition } from '../types/vue'
import { WebVitalsCollector } from '../utils/collectors'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

// 修改导入
import type { 
  MonitorComponentProps, 
  PerformanceMetrics,
  PerformanceMarker,
  Status,
  MonitorStatus,
  RawMetrics,
  ProcessorResult,
  RealTimeMetrics,
  ProcessedMetrics,
  MetricThresholds,
} from '../types'

// 修改资源时间计算方法类型
interface ResourceTimingItem {
  duration: string | number;
  initiatorType: string;
  entryType: string;
  name: string;
}

export default defineComponent({
  name: 'PerformanceMonitor',
  props: monitorPropsDefinition,
  setup(props: MonitorComponentProps) {
    if (!props.options) {
      throw new Error('Monitor options are required')
    }

    // 注入依赖
    const collector = inject<PerformanceCollector>('performanceCollector')!;
    const processor = inject<MetricsProcessorImpl>('metricsProcessor')!;
    const reporter = inject<PerformanceReporter>('performanceReporter')!;
    const marker = inject<PerformanceMarker>('performanceMarker')!;
    const webVitals = inject('webVitals', ref({}))
    const formatDisplayUtils = inject<FormatDisplay>('formatDisplay', formatDisplay)

    // 修改类型定义
    const metrics = ref<PerformanceMetrics>(createEmptyMetrics());
    const status = ref<Status['value']>('initial');

    // 使用性能监控 hook
    const { 
      performanceMetrics, 
      monitorStatus,
      startMonitoring, 
      stopMonitoring,
      updateMetricsNow 
    } = usePerformanceMonitor({
      updateInterval: props.options.updateInterval || MONITOR_CONFIG.UPDATE_INTERVAL
    })

    // 修改计算属性类型定义
    const formattedMetrics = computed<FormattedMetrics | null>(() => {
      if (!metrics.value) return null;
      
      const { core, navigation, resources, longTasks, system } = metrics.value;
      
      return {
        core: {
          FCP: formatDisplay.time(core.FCP),
          LCP: formatDisplay.time(core.LCP),
          FID: formatDisplay.time(core.FID),
          CLS: core.CLS.toFixed(3),
          TTFB: formatDisplay.time(core.TTFB),
          TTI: formatDisplay.time(core.TTI)
        },
        navigation: {
          loadTime: formatDisplay.time(navigation.loadTime),
          domReady: formatDisplay.time(navigation.domReady),
          firstPaint: formatDisplay.time(navigation.firstPaint),
          domInteractive: formatDisplay.time(navigation.domInteractive),
          domComplete: formatDisplay.time(navigation.domComplete),
          dnsTime: formatDisplay.time(navigation.dnsTime),
          tcpTime: formatDisplay.time(navigation.tcpTime),
          sslTime: formatDisplay.time(navigation.sslTime),
          ttfb: formatDisplay.time(navigation.ttfb),
          responseTime: formatDisplay.time(navigation.responseTime),
          domParseTime: formatDisplay.time(navigation.domParseTime),
          domReadyTime: formatDisplay.time(navigation.domReadyTime)
        },
        resources: resources.map(resource => ({
          ...resource,
          duration: formatDisplay.time(resource.duration),
          size: formatDisplay.bytes(resource.transferSize)
        })),
        longTasks: {
          count: longTasks.count,
          firstInputTime: formatDisplay.time(longTasks.firstInputTime),
          interactionTime: formatDisplay.time(longTasks.interactionTime),
          tasks: longTasks.tasks?.map(task => ({
            ...task,
            duration: formatDisplay.time(task.duration)
          }))
        },
        system: {
          jsHeapSize: system.jsHeapSize > 0 ? formatDisplay.bytes(system.jsHeapSize * 1024 * 1024) : '0 MB',
          domNodes: system.domNodes,
          layoutCount: system.layoutCount,
          deviceInfo: system.deviceMemory ? 
            `${system.deviceMemory}GB RAM, ${system.hardwareConcurrency} Cores` : 'N/A'
        }
      } as const;
    });

    // 修改实时指标计算属性
    const formattedRealTimeMetrics = computed(() => {
      const { fps, memory, network, paint } = performanceMetrics.value;
      
      return {
        fps: Math.round(fps),
        memory: {
          used: formatDisplay.bytes(memory.used),
          total: formatDisplay.bytes(memory.total),
          usage: formatDisplay.percentage(memory.usagePercent)
        },
        network: {
          downlink: network.downlink ? `${network.downlink} Mbps` : 'N/A',
          rtt: network.rtt ? formatDisplay.time(network.rtt) : 'N/A',
          effectiveType: network.effectiveType || 'unknown'
        },
        paint: {
          fp: formatDisplay.time(paint.fpaint),
          fcp: formatDisplay.time(paint.fcpaint),
          lcp: formatDisplay.time(paint.lcpaint)
        }
      };
    });

    // 修改内存使用率计算
    const getMemoryUsageRatio = computed(() => {
      const { memory } = performanceMetrics.value;
      return memory.usagePercent / 100; // 转换为比率
    });

    // 添加计算总时长的方法
    const calculateTotalDuration = (resources: Array<{ duration: string | number }>) => {
      return resources.reduce((total, resource) => {
        const duration = typeof resource.duration === 'string' 
          ? parseFloat(resource.duration) 
          : resource.duration;
        return total + (isNaN(duration) ? 0 : duration);
      }, 0).toFixed(2);
    };

    // 添加防抖函数
    const debounce = (fn: Function, delay: number) => {
      let timer: number;
      return (...args: any[]) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
      };
    };

    // 修改资源时间计算方法
    const calculateResourceTiming = (resources: Array<ResourceTimingItem>) => {
      // 添加日志输出资源类型分布
      console.log('Resource types:', resources.map(r => ({ type: r.initiatorType, entry: r.entryType, name: r.name })));

      // 修改计算逻辑，确保数值转换正确
      const calculateDuration = (items: typeof resources) => {
        const total = items.reduce((sum, resource) => {
          const duration = typeof resource.duration === 'string' 
            ? parseFloat(resource.duration.replace('ms', '')) 
            : resource.duration;
          
          return sum + (isNaN(duration) ? 0 : duration);
        }, 0);
        
        console.log('Calculated duration:', total);
        return total;
      };

      // 修改 Layout Time 的计算
      const layoutTime = performanceMetrics.value.layoutTime || calculateDuration(
        resources.filter(resource => {
          // 检查资源名称和类型
          const name = resource.name.toLowerCase();
          const type = resource.initiatorType.toLowerCase();
          const entry = resource.entryType.toLowerCase();
          
          // 添加更多的布局相关条件
          return type === 'layout' || 
                 entry === 'layout-shift' || 
                 entry === 'layout' ||
                 name.includes('layout') ||
                 type === 'paint' ||
                 entry === 'paint' ||
                 name.includes('paint') ||
                 // 检查 DOM 操作相关的资源
                 type === 'dom' ||
                 entry === 'element' ||
                 name.includes('dom') ||
                 // 检查渲染相关的资源
                 type === 'render' ||
                 entry === 'render' ||
                 name.includes('render');
        })
      );

      console.log('Layout Time:', layoutTime); // 添加日志

      return {
        scriptTime: calculateDuration(
          resources.filter(resource => 
            resource.initiatorType === 'script' || 
            resource.entryType === 'script'
          )
        ).toFixed(2),
        layoutTime: layoutTime.toFixed(2),
        styleTime: performanceMetrics.value.styleTime.toFixed(2)
      } as const;
    };

    // 修改收集指标的处理
    const collectMetrics = async () => {
      try {
        status.value = 'loading';
        
        await updateMetricsNow();
        
        const rawMetrics = await collector.collect();
        const baseMetrics = createEmptyMetrics();
        
        // 获取实时内存使用情况和布局变化次数
        let jsHeapSize = 0;
        let layoutCount = 0;

        // 获取内存使用情况
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          jsHeapSize = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        }

        // 获取布局变化次数
        try {
          const layoutEntries = performance.getEntriesByType('layout-shift');
          layoutCount = layoutEntries.length;
        } catch (error) {
          console.warn('Failed to collect layout entries:', error);
        }

        // 获取导航时间指标
        let navigationTiming = {
          loadTime: 0,
          domReady: 0,
          firstPaint: 0,
          domInteractive: 0,
          domComplete: 0
        };

        try {
          const navEntries = performance.getEntriesByType('navigation');
          if (navEntries.length > 0) {
            const nav = navEntries[0] as PerformanceNavigationTiming;
            const baseTime = nav.fetchStart;

            navigationTiming = {
              loadTime: nav.loadEventEnd - baseTime,
              domReady: nav.domContentLoadedEventEnd - baseTime,
              firstPaint: performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-paint')?.startTime || 0,
              domInteractive: nav.domInteractive - baseTime,
              domComplete: nav.domComplete - baseTime
            };

            // 添加日志
            console.log('Navigation Timing:', navigationTiming);
          }
        } catch (error) {
          console.warn('Failed to collect navigation timing:', error);
        }
        
        // 合并实时指标和收集的指标
        const processedMetrics: PerformanceMetrics = {
          ...baseMetrics,
          core: {
            ...baseMetrics.core,
            ...rawMetrics.core,
            FCP: rawMetrics.core?.FCP || performanceMetrics.value.paint.fcpaint,
            LCP: rawMetrics.core?.LCP || performanceMetrics.value.paint.lcpaint
          },
          navigation: {
            ...baseMetrics.navigation,
            ...rawMetrics.navigation,
            // 使用新采集的导航时间
            loadTime: navigationTiming.loadTime || rawMetrics.navigation?.loadTime || 0,
            domReady: navigationTiming.domReady || rawMetrics.navigation?.domReady || 0,
            firstPaint: navigationTiming.firstPaint || rawMetrics.navigation?.firstPaint || 0,
            domInteractive: navigationTiming.domInteractive || rawMetrics.navigation?.domInteractive || 0,
            domComplete: navigationTiming.domComplete || rawMetrics.navigation?.domComplete || 0
          },
          resources: rawMetrics.resources || [],
          longTasks: rawMetrics.longTasks || { 
            count: 0,
            firstInputTime: 0,
            interactionTime: 0
          },
          system: {
            ...baseMetrics.system,
            ...rawMetrics.system,
            jsHeapSize: jsHeapSize || rawMetrics.system?.jsHeapSize || 0,
            domNodes: document.getElementsByTagName('*').length,
            layoutCount: layoutCount || rawMetrics.system?.layoutCount || 0
          },
          fps: performanceMetrics.value.fps,
          memory: {
            used: performanceMetrics.value.memory.used,
            total: performanceMetrics.value.memory.total,
            limit: performanceMetrics.value.memory.limit,
            usagePercent: performanceMetrics.value.memory.usagePercent
          },
          network: {
            downlink: performanceMetrics.value.network.downlink,
            rtt: performanceMetrics.value.network.rtt,
            effectiveType: performanceMetrics.value.network.effectiveType
          },
          paint: {
            fp: performanceMetrics.value.paint.fpaint,
            fcp: performanceMetrics.value.paint.fcpaint,
            lcp: performanceMetrics.value.paint.lcpaint
          }
        };

        console.log('Processed Navigation Timing:', processedMetrics.navigation);

        const result = processor.process(processedMetrics);
        metrics.value = result.data;
        
        if (props.onMetricsCollected) {
          props.onMetricsCollected(result.data);
        }
        
        await reporter.report(result.data);
        status.value = 'success';
      } catch (error) {
        console.error('Failed to collect metrics:', error);
        status.value = 'error';
      }
    };

    // 使用防抖处理定期收集
    const debouncedCollect = debounce(collectMetrics, 1000);

    // 添加定时器和监听器引用
    let collectionTimer: number;
    let visibilityHandler: () => void;

    // 修改定期收集的处理
    const startPeriodicCollection = () => {
      collectMetrics();
      collectionTimer = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          debouncedCollect();
        }
      }, MONITOR_CONFIG.COLLECTION_INTERVAL);
    };

    // 添加可见性变化处理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startMonitoring();
        collectMetrics();
      } else {
        stopMonitoring();
      }
    };

    onMounted(() => {
      marker.mark('component-mounted');
      
      // 启动监控
      startMonitoring();
      startPeriodicCollection();
      
      // 添加可见性变化监听
      visibilityHandler = handleVisibilityChange;
      document.addEventListener('visibilitychange', visibilityHandler);
      
      marker.measure('metrics-collection', 'component-mounted');
    })

    onUnmounted(() => {
      stopMonitoring();
      clearInterval(collectionTimer);
      document.removeEventListener('visibilitychange', visibilityHandler);
    })

    // 监听监控状态变化
    watch(monitorStatus, (newStatus) => {
      if (newStatus === MONITOR_STATUS.ERROR) {
        console.error('Performance monitoring encountered an error');
        status.value = 'error';
      }
    }, { immediate: true });

    return {
      metrics,
      status,
      formattedMetrics,
      formattedRealTimeMetrics,
      monitorStatus,
      getMetricStatus,
      getMetricStatusText,
      calculateTotalDuration,
      getMemoryUsageRatio,
      calculateResourceTiming,
      formatDisplay: formatDisplayUtils,
      PERFORMANCE_METRICS,
      METRIC_THRESHOLDS,
      MONITOR_STATUS
    } as const;
  }
})
</script>

<template>
  <div class="performance-monitor">
    <div v-if="formattedMetrics" class="metrics-container">
      <!-- Core Web Vitals -->
      <section>
        <h3>Core Web Vitals</h3>
        <div class="metrics-group">
          <div class="metric-item">
            <span class="metric-label">{{ PERFORMANCE_METRICS.FCP }}:</span>
            <span class="metric-value">{{ formattedMetrics.core.FCP }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">{{ PERFORMANCE_METRICS.LCP }}:</span>
            <span class="metric-value">{{ formattedMetrics.core.LCP }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">{{ PERFORMANCE_METRICS.FID }}:</span>
            <span class="metric-value">{{ formattedMetrics.core.FID }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">TTI:</span>
            <span class="metric-value">{{ formattedMetrics.core.TTI }}</span>
            <div class="metric-info">
              <span class="metric-description">Time to Interactive</span>
              <span class="metric-status" :class="getMetricStatus(formattedMetrics.core.TTI, METRIC_THRESHOLDS.TTI)">
                {{ getMetricStatusText(formattedMetrics.core.TTI, METRIC_THRESHOLDS.TTI) }}
              </span>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">CLS:</span>
            <span class="metric-value">{{ formattedMetrics.core.CLS }}</span>
            <div class="metric-info">
              <span class="metric-description">Cumulative Layout Shift</span>
              <span class="metric-status" :class="getMetricStatus(formattedMetrics.core.CLS, METRIC_THRESHOLDS.CLS, true)">
                {{ getMetricStatusText(formattedMetrics.core.CLS, METRIC_THRESHOLDS.CLS, true) }}
              </span>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">{{ PERFORMANCE_METRICS.TTFB }}:</span>
            <span class="metric-value">{{ formattedMetrics.core.TTFB }}</span>
          </div>
        </div>
      </section>

      <!-- Performance Metrics -->
      <section>
        <h3>Performance Metrics</h3>
        <div class="metrics-group">
          <!-- FPS -->
          <div class="metric-item">
            <span class="metric-label">FPS</span>
            <span class="metric-value">{{ formattedRealTimeMetrics.fps }}</span>
            <div class="metric-info">
              <span class="metric-description">Frames Per Second</span>
              <span class="metric-status" :class="getMetricStatus(formattedRealTimeMetrics.fps, 60, true)">
                {{ getMetricStatusText(formattedRealTimeMetrics.fps, 60, true) }}
              </span>
            </div>
          </div>

          <!-- Memory -->
          <div class="metric-item">
            <span class="metric-label">Memory Usage</span>
            <span class="metric-value">{{ formattedRealTimeMetrics.memory.used }} / {{ formattedRealTimeMetrics.memory.total }}</span>
            <div class="metric-info">
              <span class="metric-description">JS Heap Usage</span>
              <span class="metric-status" :class="getMetricStatus(getMemoryUsageRatio, 0.8, true)">
                {{ formattedRealTimeMetrics.memory.usage }}
              </span>
            </div>
          </div>

          <!-- Network -->
          <div class="metric-item">
            <span class="metric-label">Network</span>
            <span class="metric-value">{{ formattedRealTimeMetrics.network.effectiveType }}</span>
            <div class="metric-info">
              <span class="metric-description">
                Downlink: {{ formattedRealTimeMetrics.network.downlink }}, 
                RTT: {{ formattedRealTimeMetrics.network.rtt }}
              </span>
            </div>
          </div>

          <!-- Paint Timing -->
          <div class="metric-item">
            <span class="metric-label">Paint Timing</span>
            <div class="metric-value">
              <div>FP: {{ formattedRealTimeMetrics.paint.fp }}</div>
              <div>FCP: {{ formattedRealTimeMetrics.paint.fcp }}</div>
              <div>LCP: {{ formattedRealTimeMetrics.paint.lcp }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Navigation Timing -->
      <section>
        <h3>Navigation Timing</h3>
        <div class="metrics-group">
          <div class="metric-item">
            <span class="metric-label">Load Time:</span>
            <span class="metric-value">{{ formattedMetrics.navigation.loadTime }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">DOM Ready:</span>
            <span class="metric-value">{{ formattedMetrics.navigation.domReady }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">First Paint:</span>
            <span class="metric-value">{{ formattedMetrics.navigation.firstPaint }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">DOM Interactive:</span>
            <span class="metric-value">{{ formattedMetrics.navigation.domInteractive }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">DOM Complete:</span>
            <span class="metric-value">{{ formattedMetrics.navigation.domComplete }}</span>
          </div>
        </div>
      </section>

      <!-- Resource Timing -->
      <section>
        <h3>Resource Timing</h3>
        <div class="metrics-group">
          <div class="metric-item">
            <span class="metric-label">Total Resources:</span>
            <span class="metric-value">{{ formattedMetrics.resources.length }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Script Time:</span>
            <span class="metric-value">{{ calculateResourceTiming(formattedMetrics.resources).scriptTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Layout Time:</span>
            <span class="metric-value">{{ calculateResourceTiming(formattedMetrics.resources).layoutTime }}ms</span>
            <div class="metric-info">
              <span class="metric-description">Layout, Paint and DOM Operations</span>
              <span class="metric-status" :class="getMetricStatus(calculateResourceTiming(formattedMetrics.resources).layoutTime, 100)">
                {{ getMetricStatusText(calculateResourceTiming(formattedMetrics.resources).layoutTime, 100) }}
              </span>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">Style Recalc Time:</span>
            <span class="metric-value">{{ calculateResourceTiming(formattedMetrics.resources).styleTime }}ms</span>
          </div>
        </div>
      </section>

      <!-- Long Tasks -->
      <section>
        <h3>Long Tasks</h3>
        <div class="metrics-group">
          <div class="metric-item">
            <span class="metric-label">Total Long Tasks:</span>
            <span class="metric-value">{{ formattedMetrics.longTasks.count }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">First Input Time:</span>
            <span class="metric-value">{{ formattedMetrics.longTasks.firstInputTime }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Interaction Time:</span>
            <span class="metric-value">{{ formattedMetrics.longTasks.interactionTime }}</span>
          </div>
        </div>
      </section>

      <!-- Memory & System -->
      <section>
        <h3>Memory & System</h3>
        <div class="metrics-group">
          <div class="metric-item">
            <span class="metric-label">JS Heap Size:</span>
            <span class="metric-value">{{ formattedMetrics.system.jsHeapSize }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">DOM Nodes:</span>
            <span class="metric-value">{{ formattedMetrics.system.domNodes }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Layout Count:</span>
            <span class="metric-value">{{ formattedMetrics.system.layoutCount }}</span>
          </div>
        </div>
      </section>

      <!-- Resource Details -->
      <section v-if="formattedMetrics.resources.length > 0">
        <h3>Resource Details</h3>
        <div class="resource-list">
          <div v-for="(resource, index) in formattedMetrics.resources" :key="index" class="resource-item">
            <div class="resource-name">{{ resource.name }}</div>
            <div class="resource-details">
              <span>Type: {{ resource.initiatorType }}</span>
              <span>Duration: {{ resource.duration }}</span>
              <span>Size: {{ resource.size }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Custom Metrics -->
      <section v-if="formattedMetrics?.customMetrics">
        <h3>Custom Metrics</h3>
        <div class="metrics-group">
          <div v-for="(value, key) in formattedMetrics.customMetrics" :key="key" class="metric-item">
            <span class="metric-label">{{ key }}:</span>
            <span class="metric-value">{{ value }}</span>
          </div>
        </div>
      </section>
    </div>
    <div v-else-if="status === 'loading'" class="loading">
      Loading performance metrics...
    </div>
    <div v-else-if="status === 'error'" class="error">
      Failed to load performance metrics
    </div>
  </div>
</template>

<style scoped>
.performance-monitor {
  font-family: Arial, sans-serif;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

section {
  margin-bottom: 24px;
}

h3 {
  margin: 16px 0 8px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.metrics-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.metric-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  color: #666;
  font-size: 14px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.resource-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}

.resource-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.resource-item:last-child {
  border-bottom: none;
}

.resource-name {
  font-weight: bold;
  margin-bottom: 4px;
  word-break: break-all;
}

.resource-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.metric-info {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #eee;
}

.metric-description {
  color: #666;
}

.metric-status {
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  margin-top: 2px;
}

.metric-status.good {
  background-color: #e6f4ea;
  color: #137333;
}

.metric-status.poor {
  background-color: #fce8e6;
  color: #c5221f;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  text-align: center;
  padding: 20px;
  color: #dc3545;
}
</style>