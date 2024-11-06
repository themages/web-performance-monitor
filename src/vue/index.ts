import type { App } from 'vue'
import type { MonitorOptions, ReportOptions, PerformanceMarker } from '../types'
import { PerformanceCollector } from '../core/collector'
import { PerformanceReporter } from '../core/reporter'
import { MetricsProcessorImpl } from '../core/processor'
import { PerformanceMarkerImpl } from '../utils/performance'
import PerformanceMonitor from '../components/PerformanceMonitor.vue'
import { DEFAULT } from '../constants/config'

export const VuePerformanceMonitor = {
  install(app: App, options: MonitorOptions) {
    // 创建实例
    const collector = new PerformanceCollector()
    const processor = new MetricsProcessorImpl()
    const marker = new PerformanceMarkerImpl()
    
    // 从 MonitorOptions 中提取 ReportOptions
    const reporterOptions: ReportOptions = {
      url: options.url,
      batch: options.batch ?? false,
      batchSize: options.batchSize ?? DEFAULT.BATCH_SIZE,
      config: options.config,
      batchConfig: {
        maxSize: options.batchConfig?.maxSize ?? DEFAULT.BATCH_SIZE,
        maxWait: options.batchConfig?.maxWait ?? DEFAULT.MAX_WAIT,
        flushOnUnload: options.batchConfig?.flushOnUnload ?? DEFAULT.FLUSH_ON_UNLOAD,
        enabled: options.batch ?? false
      },
      report: {
        timeout: options.report?.timeout,
        retryTimes: options.report?.retryTimes ?? DEFAULT.RETRY_TIMES,
        retryDelay: options.report?.retryDelay ?? DEFAULT.RETRY_DELAY
      }
    }
    
    const reporter = new PerformanceReporter(reporterOptions)

    // 注册组件
    app.component('PerformanceMonitor', PerformanceMonitor)
    
    // 提供依赖
    app.provide('monitorOptions', options)
    app.provide('performanceCollector', collector)
    app.provide('performanceReporter', reporter)
    app.provide('metricsProcessor', processor)
    app.provide('performanceMarker', marker)

    // 全局属性
    app.config.globalProperties.$performance = {
      collector,
      reporter,
      processor,
      marker
    }

    // 自动收集
    if (options.customMetrics?.collect) {
      app.mixin({
        async mounted() {
          const metrics = await collector.collect()
          const customMetrics = await options.customMetrics!.collect()
          const processedMetrics = processor.process({
            ...metrics,
            customMetrics
          }).data
          
          await reporter.report(processedMetrics)
        }
      })
    }
  }
} 