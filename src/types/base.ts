// 状态类型
export type Status = 'initial' | 'loading' | 'success' | 'error';

// 指标单位和类别类型
export type MetricUnit = 
  | 'ms'      // 毫秒
  | 'fps'     // 帧率
  | 'bytes'   // 字节
  | 'MB'      // 兆字节
  | 'Mbps'    // 兆比特每秒
  | '%'       // 百分比
  | 'count';  // 计数

export type MetricCategory = 
  | 'core-vitals'
  | 'navigation'
  | 'resource'
  | 'interaction'
  | 'memory'
  | 'network'
  | 'paint'
  | 'layout'
  | 'style'
  | 'custom'
  | 'mark'
  | 'measure';

// 基础性能指标类型
export interface BaseMetrics {
  name: string;
  value: number;
  timestamp: number;
  status?: Status;
  source?: string;
  unit: MetricUnit;
  category: MetricCategory;
}

// 基础事件类型
export interface BaseEvent<T = any> {
  type: string;           // 事件类型
  timestamp: number;      // 事件时间戳
  data?: T;              // 事件数据
  source?: string;       // 事件来源
  metadata?: {           // 元数据
    version?: string;    // 版本信息
    env?: string;        // 环境信息
    tags?: string[];     // 标签
    processor?: string;  // 处理器信息
    [key: string]: any;  // 其他元数据
  };
}

// 基础性能事件类型
export interface BasePerformanceEvent extends BaseEvent {
  name: string;          // 性能指标名称
  value: number;         // 性能指标值
  unit: MetricUnit;      // 单位（ms, bytes等）
  category: MetricCategory; // 指标分类
}

// 基础配置类型
export interface BaseConfig {
  id?: string;
  version?: string;
  env?: 'development' | 'production' | 'test';
  tags?: string[];
  enabled?: boolean;
  debug?: boolean;
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
  };
}

// 基础结果类型
export interface BaseResult {
  success: boolean;
  timestamp: number;
  duration: number;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

// 基础队列类型
export interface BaseQueue<T> {
  items: T[];
  timestamp: number;
  batch: {
    id: string;
    size: number;
    retryCount: number;
    status: Status;
  };
  metadata?: {
    source?: string;
    version?: string;
    env?: string;
    processor?: string;
  };
}

// 工厂函数类型
export type Factory<T> = (...args: any[]) => T;