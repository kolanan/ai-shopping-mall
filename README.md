---

## 🔮 后续规划

### 短期迭代 (v1.1)
1. **完善订单流程** - 支付对接、物流跟踪
2. **库存管理** - 库存预警、补货通知
3. **评价系统** - 商品评价、晒单功能
4. **优惠券系统** - 满减、折扣券

### 中期迭代 (v1.2)
1. **搜索优化** - Elasticsearch 全文检索
2. **推荐算法** - 基于用户行为的智能推荐
3. **消息推送** - 订单状态短信/邮件通知
4. **数据报表** - 销售统计、用户行为分析

### 长期规划 (v2.0)
1. **微服务拆分** - 用户服务、商品服务、订单服务
2. **分布式缓存** - Redis 缓存热点数据
3. **消息队列** - RabbitMQ/Kafka 异步解耦
4. **容器化部署** - Kubernetes 集群部署

---

## 📝 常见问题

### Q1: 数据库连接失败？
**A**: 检查以下配置：
- MySQL 服务是否启动
- 防火墙是否开放 3306/3534 端口
- 数据库账号密码是否正确
- 尝试使用 Docker Compose 启动本地 MySQL

### Q2: 前端跨域问题？
**A**: 后端已配置 CORS，确保：
- `application.yml` 中 `app.cors.allowed-origin` 配置正确
- 前端请求携带凭证（如需要）
- 开发环境使用 Vite 代理配置

### Q3: 种子数据未插入？
**A**: 检查日志：
- 查看启动日志是否有 SQL 错误
- 确认表是否为空（有数据则不插入）
- 手动执行 `bootstrap-db.sql`

### Q4: Swagger 文档无法访问？
**A**: 访问 http://localhost:8080/swagger-ui/index.html，确保：
- Knife4j 依赖已正确引入
- Spring Boot 应用完全启动
- 浏览器清除缓存

---

## 📄 开源协议

MIT License

---

## 👥 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

**最后更新时间**: 2026-03-06
