import type { 
  PerformanceMetrics, 
  ReportOptions, 
  ReportQueue,
  ReportResult,
  ReportConfig,
  BatchConfig 
} from '../types'
import type { ErrorInfo } from '../types/common'
import type { RetryOptions } from '../types/utils'
import { retry } from '../utils'
import { DEFAULT, STATUS } from '../constants/config'

export class PerformanceReporter {
  private queue: ReportQueue;
  private options: ReportOptions;
  private config: ReportConfig;
  private batchConfig: BatchConfig;

  constructor(options: ReportOptions) {
    this.options = options;
    this.config = this.initConfig(options);
    this.batchConfig = this.initBatchConfig(options);
    this.queue = this.createQueue();

    if (this.batchConfig.flushOnUnload) {
      this.setupUnloadHandler();
    }
  }

  private initConfig(options: ReportOptions): ReportConfig {
    return {
      url: options.url,
      method: options.config?.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.config?.headers
      },
      timeout: options.report?.timeout,
      credentials: options.config?.credentials
    };
  }

  private initBatchConfig(options: ReportOptions): BatchConfig {
    return {
      maxSize: options.batchConfig?.maxSize || DEFAULT.BATCH_SIZE,
      maxWait: options.batchConfig?.maxWait || DEFAULT.MAX_WAIT,
      flushOnUnload: options.batchConfig?.flushOnUnload ?? DEFAULT.FLUSH_ON_UNLOAD,
      enabled: options.batch
    };
  }

  private createQueue(): ReportQueue {
    return {
      metrics: [],
      items: [],
      timestamp: Date.now(),
      batch: {
        id: crypto.randomUUID(),
        size: 0,
        retryCount: 0,
        status: STATUS.INITIAL
      },
      metadata: {
        source: 'performance-reporter',
        version: '1.0.0',
        env: import.meta.env?.MODE || 'production'
      }
    };
  }

  private setupUnloadHandler(): void {
    window.addEventListener('unload', () => {
      if (this.queue.metrics.length > 0) {
        navigator.sendBeacon(
          this.config.url,
          JSON.stringify(this.queue)
        );
      }
    });
  }

  public async report(metrics: PerformanceMetrics): Promise<void> {
    if (this.batchConfig.enabled) {
      this.queue.metrics.push(metrics);
      this.queue.batch.size = this.queue.metrics.length;
      
      if (this.queue.batch.size >= this.batchConfig.maxSize) {
        await this.sendBatch();
      }
    } else {
      await this.send(metrics);
    }
  }

  private async sendBatch(): Promise<void> {
    if (this.queue.metrics.length === 0) return;
    
    const currentQueue = this.queue;
    this.queue = this.createQueue();
    
    await this.send(currentQueue);
  }

  private async send(data: any): Promise<ReportResult> {
    const retryOptions: RetryOptions = {
      times: this.options.report?.retryTimes ?? DEFAULT.RETRY_TIMES,
      delay: this.options.report?.retryDelay ?? DEFAULT.RETRY_DELAY,
      onRetry: (retryCount, error) => {
        this.queue.batch.retryCount = retryCount;
        console.warn(`Retry attempt ${retryCount}:`, error);
      }
    };

    try {
      const startTime = performance.now();
      
      await retry(
        async () => {
          const response = await fetch(this.config.url, {
            method: this.config.method,
            headers: this.config.headers,
            credentials: this.config.credentials,
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        },
        retryOptions
      );

      return {
        success: true,
        timestamp: Date.now(),
        duration: performance.now() - startTime
      };
    } catch (error) {
      console.error('Performance data report failed:', error);
      
      const errorInfo: ErrorInfo = {
        code: 'REPORT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          retryCount: this.queue.batch.retryCount,
          timestamp: Date.now()
        },
        stack: error instanceof Error ? error.stack : undefined
      };

      return {
        success: false,
        timestamp: Date.now(),
        duration: 0,
        error: errorInfo,
        retries: this.queue.batch.retryCount
      };
    }
  }
} 