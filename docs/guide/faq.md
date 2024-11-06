# 常见问题解答 (FAQ)

## 基础问题

### Q: 如何判断性能监控是否正常工作？
A: 可以通过以下方式验证：
1. 检查网络请求中是否有性能数据上报
2. 控制台是否有相关错误信息
3. 使用 `app.config.globalProperties.$performance` 查看收集器状态

### Q: 为什么某些性能指标显示为 0？
A: 可能的原因：
1. 浏览器不支持该性能指标
2. 页面生命周期内未触发该指标
3. 指标收集时机不正确

### Q: 如何处理性能数据上报失败？
A: 推荐的处理方式：
1. 实现重试机制
2. 本地存储失败数据
3. 在合适时机重新发送

## 高级问题

### Q: 如何扩展自定义性能指标？
A: 有两种方式：
1. 继承 PerformanceCollector 类
2. 使用 customMetrics 配置项

```typescript
class CustomCollector extends PerformanceCollector {
  async collect() {
    const metrics = await super.collect();
    return {
      ...metrics,
      customMetric: this.getCustomMetric()
    };
  }
}
```

### Q: 如何优化大量数据的上报？
A: 建议：
1. 使用批量上报
2. 实现数据压缩
3. 采用采样策略

### Q: 如何处理单页应用的路由切换？
A: 可以：
1. 监听路由变化事件
2. 重置相关性能指标
3. 在新页面完成后收集数据

## 性能问题

### Q: 监控代码会影响应用性能吗？
A: 影响很小，因为：
1. 使用异步收集
2. 批量处理数据
3. 采用采样策略

### Q: 如何减少监控对带宽的影响？
A: 可以：
1. 压缩数据
2. 合理设置采样率
3. 使用批量上报

## 兼容性问题

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器：
- Chrome 60+
- Firefox 58+
- Safari 12.1+
- Edge 79+

### Q: 在不支持某些 API 的浏览器中如何处理？
A: 会自动降级：
1. 使用替代性能指标
2. 跳过不支持的指标收集
3. 保证基础功能可用 