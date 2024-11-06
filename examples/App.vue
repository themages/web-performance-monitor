<template>
  <div class="app">
    <h1>Performance Monitor Demo</h1>
    <PerformanceMonitor
      :options="monitorOptions"
      @metrics-collected="handleMetricsCollected"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PerformanceMonitor } from 'web-performance-monitor'
import type { MonitorOptions, PerformanceMetrics } from 'web-performance-monitor'

export default defineComponent({
  name: 'App',
  components: {
    PerformanceMonitor
  },
  setup() {
    const monitorOptions = {
      url: 'https://your-analytics-server.com/collect',
      batch: true,
      batchSize: 10,
      config: {
        url: 'https://your-analytics-server.com/collect',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      batchConfig: {
        maxSize: 10,
        maxWait: 5000,
        flushOnUnload: true,
        enabled: true
      }
    } as MonitorOptions

    const handleMetricsCollected = (metrics: PerformanceMetrics) => {
      console.log('Performance metrics:', metrics)
    }

    return {
      monitorOptions,
      handleMetricsCollected
    }
  }
})
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}
</style> 