import "./OrdersPage.css";
import { Navigate } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatDateTime, formatPrice } from "../../utils/formatters";

function OrdersPage({
  currentUser,
  cartTotalItems,
  onToggleCart,
  onLogout,
  orders,
  ordersLoading,
  ordersError,
  orderActionBusyId,
  onRefreshOrders,
  onPayOrder
}) {
  if (!currentUser?.id) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (currentUser.role === "MERCHANT") {
    return <Navigate to={APP_ROUTES.MERCHANT_DASHBOARD} replace />;
  }

  return (
    <div className="view-shell">
      <SiteHeader
        currentUser={currentUser}
        cartTotalItems={cartTotalItems}
        onToggleCart={onToggleCart}
        onLogout={onLogout}
      />

      <main className="orders-page">
        <section className="product-section">
          <div className="section-head">
            <div>
              <h2>我的订单</h2>
              <p>Order 模块：订单状态更新与明细查看</p>
            </div>
            <button type="button" className="section-link-button" onClick={onRefreshOrders}>
              刷新订单
            </button>
          </div>

          {ordersLoading ? <div className="status-panel">订单加载中...</div> : null}
          {!ordersLoading && ordersError ? <div className="status-panel error">{ordersError}</div> : null}
          {!ordersLoading && !ordersError && !orders.length ? <div className="status-panel">暂无订单</div> : null}

          {!ordersLoading && !ordersError && orders.length ? (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.orderId} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <h3>{order.orderNo}</h3>
                      <p>{formatDateTime(order.createdAt)}</p>
                    </div>
                    <strong>{ORDER_STATUS_LABELS[order.status] || order.status}</strong>
                  </div>
                  <div className="order-card-summary">
                    <span>{order.totalItems} 件商品</span>
                    <strong>{formatPrice(order.totalAmount)}</strong>
                  </div>
                  <div className="order-card-items">
                    {(order.items || []).map((item) => (
                      <div key={`${order.orderId}-${item.productId}`} className="order-result-row">
                        <span>
                          {item.productName} x {item.quantity}
                        </span>
                        <strong>{formatPrice(item.lineTotal)}</strong>
                      </div>
                    ))}
                  </div>
                  {order.status === "CREATED" ? (
                    <div className="order-actions">
                      <button
                        type="button"
                        className="order-action-button"
                        disabled={orderActionBusyId === order.orderId}
                        onClick={() => onPayOrder(order.orderId)}
                      >
                        {orderActionBusyId === order.orderId ? "支付中..." : "去支付"}
                      </button>
                    </div>
                  ) : null}
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

export default OrdersPage;
