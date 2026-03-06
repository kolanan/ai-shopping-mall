import { Link, Navigate } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { APP_ROUTES } from "../../router/paths";
import { formatPrice } from "../../utils/formatters";
import "./MerchantHomePage.css";

function MerchantHomePage({ currentUser, onLogout, merchant, merchantOrder, onRefreshProducts, onRefreshOrders }) {
  if (!currentUser?.id) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (currentUser.role !== "MERCHANT") {
    return <Navigate to={APP_ROUTES.CATALOG} replace />;
  }

  const totalProducts = merchant.productPage?.total || merchant.products.length;
  const totalStock = merchant.products.reduce((sum, product) => sum + Number(product.stockQuantity || 0), 0);
  const lowStockCount = merchant.products.filter((product) => Number(product.stockQuantity || 0) <= 5).length;

  return (
    <div className="view-shell">
      <SiteHeader currentUser={currentUser} cartTotalItems={0} onToggleCart={() => {}} onLogout={onLogout} />

      <main className="merchant-home-page">
        <section className="product-section merchant-home-hero">
          <div className="section-head">
            <div>
              <p className="eyebrow">Merchant Console</p>
              <h1>商户销售统计首页</h1>
              <p>按路由拆分后的入口页，先看核心销售指标，再进入商品和订单模块。</p>
            </div>
            <div className="merchant-home-actions">
              <Link to={APP_ROUTES.MERCHANT_PRODUCTS} className="section-link-button">
                商品管理
              </Link>
              <Link to={APP_ROUTES.MERCHANT_ORDERS} className="section-link-button">
                订单管理
              </Link>
              <button type="button" className="section-link-button" onClick={onRefreshProducts}>
                刷新商品
              </button>
              <button type="button" className="section-link-button" onClick={onRefreshOrders}>
                刷新订单
              </button>
            </div>
          </div>

          <div className="merchant-home-grid">
            <article className="merchant-home-card">
              <span>销售总额</span>
              <strong>{formatPrice(merchantOrder.stats.soldAmount)}</strong>
            </article>
            <article className="merchant-home-card">
              <span>已售件数</span>
              <strong>{merchantOrder.stats.soldItems}</strong>
            </article>
            <article className="merchant-home-card">
              <span>订单数量</span>
              <strong>{merchantOrder.stats.orderCount}</strong>
            </article>
            <article className="merchant-home-card warn">
              <span>待发货订单</span>
              <strong>{merchantOrder.stats.pendingShipmentCount}</strong>
            </article>
            <article className="merchant-home-card">
              <span>商品总数</span>
              <strong>{totalProducts}</strong>
            </article>
            <article className="merchant-home-card warn">
              <span>低库存商品(≤5)</span>
              <strong>{lowStockCount}</strong>
              <small>当前页库存合计 {totalStock}</small>
            </article>
          </div>

          {merchantOrder.error ? <div className="status-panel error">{merchantOrder.error}</div> : null}
          {merchant.error ? <div className="status-panel error">{merchant.error}</div> : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default MerchantHomePage;

