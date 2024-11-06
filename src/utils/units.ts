// 单位转换常量
export const UNITS = {
  BYTES_TO_MB: 1024 * 1024,
  BYTES_TO_KB: 1024,
  MS_TO_S: 1000
} as const;

// 单位转换函数
export const convertUnits = {
  // 字节转换
  bytesToMB: (bytes: number): number => Math.round(bytes / UNITS.BYTES_TO_MB),
  bytesToKB: (bytes: number): number => Math.round(bytes / UNITS.BYTES_TO_KB),
  
  // 时间转换
  msToSeconds: (ms: number): number => Number((ms / UNITS.MS_TO_S).toFixed(2)),
  
  // 百分比转换
  toPercentage: (value: number): number => Number((value * 100).toFixed(1)),
  
  // 格式化数字
  formatNumber: (value: number, precision: number = 2): number => {
    return Number(value.toFixed(precision));
  }
};

// 格式化展示
export const formatDisplay = {
  bytes: (bytes: number): string => {
    if (bytes >= UNITS.BYTES_TO_MB) {
      return `${convertUnits.bytesToMB(bytes)} MB`;
    }
    return `${convertUnits.bytesToKB(bytes)} KB`;
  },
  
  time: (ms: number): string => {
    if (ms >= UNITS.MS_TO_S) {
      return `${convertUnits.msToSeconds(ms)} s`;
    }
    return `${Math.round(ms)} ms`;
  },
  
  percentage: (value: number): string => {
    return `${convertUnits.toPercentage(value)}%`;
  }
}; 