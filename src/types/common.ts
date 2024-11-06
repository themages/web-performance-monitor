// 通用工具类型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Primitive = string | number | boolean | undefined | null;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 通用回调函数类型
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;
export type ErrorCallback = (error: Error) => void;

// 通用错误类型
export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp?: number;
  source?: string;
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
  };
}

// 通用配置类型
export interface CommonConfig {
  enabled?: boolean;
  debug?: boolean;
  timeout?: number;
  retryTimes?: number;
  retryDelay?: number;
  maxSize?: number;
  maxWait?: number;
  sampling?: {
    rate: number;
    rules?: Record<string, any>;
  };
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
  };
}

// 通用响应类型
export interface CommonResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  timestamp: number;
  duration?: number;
  metadata?: {
    version?: string;
    env?: string;
    tags?: string[];
    processor?: string;
  };
}

// 通用分页类型
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore?: boolean;
}

// 通用排序类型
export interface Sorting {
  field: string;
  order: 'asc' | 'desc';
}

// 通用过滤类型
export interface Filtering {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'like' | 'between';
  value: any;
} 