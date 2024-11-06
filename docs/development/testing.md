# 测试指南

## 测试架构

我们使用以下工具进行测试：
- Vitest: 单元测试框架
- @testing-library/vue: Vue 组件测试
- @vitest/coverage-c8: 测试覆盖率报告

## 测试类型

### 1. 单元测试
测试独立的功能模块：

```typescript
import { describe, it, expect } from 'vitest'
import { PerformanceCollector } from '../src/core/collector'

describe('PerformanceCollector', () => {
  it('should collect FCP metric', async () => {
    const collector = new PerformanceCollector()
    const metrics = await collector.collect()
    expect(metrics.FCP).toBeDefined()
  })
})
```

### 2. 集成测试
测试模块间的交互：

```typescript
import { describe, it, expect } from 'vitest'
import { PerformanceCollector } from '../src/core/collector'
import { PerformanceReporter } from '../src/core/reporter'

describe('Performance Monitoring Integration', () => {
  it('should collect and report metrics', async () => {
    const collector = new PerformanceCollector()
    const reporter = new PerformanceReporter({
      url: 'http://test.com',
      batch: false
    })
    
    const metrics = await collector.collect()
    await expect(reporter.report(metrics)).resolves.not.toThrow()
  })
})
```

### 3. E2E 测试
使用 Playwright 进行端到端测试：

```typescript
import { test, expect } from '@playwright/test'

test('should monitor page performance', async ({ page }) => {
  await page.goto('/')
  const performanceData = await page.evaluate(() => {
    return window.performance.getEntriesByType('navigation')
  })
  expect(performanceData).toBeDefined()
})
```

## 测试覆盖率要求

- 单元测试覆盖率 > 80%
- 集成测试覆盖率 > 70%
- 关键路径覆盖率 100%

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单个测试文件
pnpm test src/core/collector.test.ts

# 生成覆盖率报告
pnpm test:coverage
```

## 测试规范

### 1. 命名规范
- 测试文件：`*.test.ts` 或 `*.spec.ts`
- 测试套件：描述被测试的模块/功能
- 测试用例：描述具体的测试场景

### 2. 测试结构
```typescript
describe('ModuleName', () => {
  // 测试准备
  beforeEach(() => {
    // 设置测试环境
  })

  // 测试清理
  afterEach(() => {
    // 清理测试环境
  })

  // 测试用例
  it('should do something', () => {
    // 准备数据
    // 执行操作
    // 验证结果
  })
})
```

### 3. 断言最佳实践
- 使用精确的匹配器
- 避免过度断言
- 测试边界条件

## 持续集成

在 GitHub Actions 中配置测试：

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
```

## 调试测试

使用 VS Code 调试配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
``` 