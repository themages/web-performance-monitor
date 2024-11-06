import { createApp } from 'vue';
import App from './App.vue';
import { VuePerformanceMonitor } from 'web-performance-monitor';
import type { MonitorOptions } from 'web-performance-monitor';

const app = createApp(App);

const monitorOptions: MonitorOptions = {
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
} as MonitorOptions;

app.use(VuePerformanceMonitor, monitorOptions);
app.mount('#app'); 