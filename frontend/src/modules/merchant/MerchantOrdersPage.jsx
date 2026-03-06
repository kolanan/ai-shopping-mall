import { Link, Navigate } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { APP_ROUTES } from "../../router/paths";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import "./MerchantOrdersPage.css";

function MerchantOrdersPage({
  currentUser,
  onLogout,
  merchantOrder,
  onRefresh,
  onShipOrder,
  onCompleteOrder
}) {
  if (!currentUser?.id) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (currentUser.role !== "MERCHANT") {
    return <Navigate to={APP_ROUTES.CATALOG} replace />;
  }

  return (
    <div className="view-shell">
      <SiteHeader currentUser={currentUser} cartTotalItems={0} onToggleCart={() => {}} onLogout={onLogout} />

      <main className="merchant-orders-page">
        <section className="product-section merchant-orders-hero">
          <div className="section-head">
            <div>
              <h2>商户订单管理</h2>
              <p>查看已售数据、订单列表，并更新发货与完成状态。</p>
            </div>
            <div className="merchant-actions">
              <Link to={APP_ROUTES.MERCHANT_DASHBOARD} className="section-link-button">
                首页统计
              </Link>
              <Link to={APP_ROUTES.MERCHANT_PRODUCTS} className="section-link-button">
                商品管理
              </Link>
              <button type="button" className="section-link-button" onClick={onRefresh}>
                刷新订单
              </button>
            </div>
          </div>

          <div className="merchant-orders-stats">
            <article className="merchant-orders-stat">
              <span>已售件数</span>
              <strong>{merchantOrder.stats.soldItems}</strong>
            </article>
            <article className="merchant-orders-stat">
              <span>订单数</span>
              <strong>{merchantOrder.stats.orderCount}</strong>
            </article>
            <article className="merchant-orders-stat warn">
              <span>待发货订单</span>
              <strong>{merchantOrder.stats.pendingShipmentCount}</strong>
            </article>
            <article className="merchant-orders-stat">
              <span>已售金额</span>
              <strong>{formatPrice(merchantOrder.stats.soldAmount)}</strong>
            </article>
          </div>
        </section>

        <section className="product-section">
          {merchantOrder.loading ? <div className="status-panel">订单加载中...</div> : null}
          {!merchantOrder.loading && merchantOrder.error ? (
            <div className="status-panel error">{merchantOrder.error}</div>
          ) : null}
          {!merchantOrder.loading && !merchantOrder.error && !merchantOrder.orders.length ? (
            <div className="status-panel">暂无已售订单</div>
          ) : null}

          {!merchantOrder.loading && !merchantOrder.error && merchantOrder.orders.length ? (
            <div className="merchant-order-list">
              {merchantOrder.orders.map((order) => (
                <article key={order.orderId} className="merchant-order-card">
                  <div className="merchant-order-head">
                    <div>
                      <h3>{order.orderNo}</h3>
                      <p>
                        买家：{order.buyerName} | 时间：{formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <strong>{ORDER_STATUS_LABELS[order.status] || order.status}</strong>
                  </div>
                  <div className="merchant-order-meta">
                    <span>该订单购买你店铺商品 {order.soldItems} 件</span>
                    <strong>{formatPrice(order.soldAmount)}</strong>
                  </div>
                  <div className="merchant-order-items">
                    {order.items.map((item) => (
                      <div key={`${order.orderId}-${item.productId}`} className="merchant-order-item-row">
                        <span>
                          {item.productName} x {item.quantity}
                        </span>
                        <strong>{formatPrice(item.lineTotal)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="merchant-order-actions">
                    {order.status === "PAID" ? (
                      <button
                        type="button"
                        disabled={merchantOrder.busyOrderId === order.orderId}
                        onClick={() => onShipOrder(order.orderId)}
                      >
                        {merchantOrder.busyOrderId === order.orderId ? "处理中..." : "标记已发货"}
                      </button>
                    ) : null}
                    {order.status === "SHIPPED" ? (
                      <button
                        type="button"
                        disabled={merchantOrder.busyOrderId === order.orderId}
                        onClick={() => onCompleteOrder(order.orderId)}
                      >
                        {merchantOrder.busyOrderId === order.orderId ? "处理中..." : "标记已完成"}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default MerchantOrdersPage;
