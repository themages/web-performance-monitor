import type { CommonConfig } from './common'
import type { MetricUnit } from './base'

// 采样配置
export interface SamplingOptions extends CommonConfig {
  rate: number;
  always: string[];
  rules?: {
    browser?: string[];    // 浏览器规则
    device?: string[];     // 设备规则
    network?: string[];    // 网络规则
    custom?: Record<string, any>; // 自定义规则
  };
}

// 重试配置
export interface RetryOptions extends CommonConfig {
  times: number;
  delay: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (retryCount: number, error: Error) => void;
  maxRetries?: number;
  backoff?: boolean;
  backoffFactor?: number;
}

// 网络信息
export interface NetworkInformation {
  effectiveType: string;   // 网络类型
  rtt: number;            // 往返时间
  downlink: number;       // 下行速度
  saveData: boolean;      // 省流量模式
  online?: boolean;       // 在线状态
  type?: string;          // 连接类型
  bandwidth?: number;     // 带宽
}

// 设备信息
export interface DeviceInformation {
  memory: {
    total: number;
    used: number;
    limit: number;
    usagePercent: number;
  };
  cpu: {
    cores: number;
    usage: number;
    architecture?: string;
  };
  battery?: {
    level: number;
    charging: boolean;
    chargingTime?: number;
    dischargingTime?: number;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    orientation?: string;
  };
}

// 格式化工具类型
export interface FormatUtils {
  time(value: number): string;
  bytes(value: number): string;
  percentage(value: number): string;
  number(value: number, precision?: number): string;
  duration(value: number): string;
  date(value: number | Date): string;
}

// 单位转换工具类型
export interface UnitConverter {
  bytesToMB(bytes: number): number;
  bytesToKB(bytes: number): number;
  msToSeconds(ms: number): number;
  toPercentage(value: number): number;
  formatNumber(value: number, precision?: number): number;
  formatUnit(value: number, unit: MetricUnit): string;
  roundToDecimals(value: number, decimals: number): number;
}

// 格式化显示工具类型
export interface FormatDisplay extends FormatUtils {
  formatUnit(value: number, unit: MetricUnit): string;
  roundToDecimals(value: number, decimals: number): number;
}