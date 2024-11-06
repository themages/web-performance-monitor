import type { DefineComponent } from 'vue'
import type { PerformanceInstance, MonitorOptions, MonitorComponentProps } from './vue'

// Vue 组件类型声明
declare module '*.vue' {
  const component: DefineComponent<MonitorComponentProps, {}, any>
  export default component
}

// Vue 全局属性扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $performance: PerformanceInstance;
  }
}

// 导出类型
export type {
  PerformanceInstance,
  MonitorOptions,
  MonitorComponentProps
} 