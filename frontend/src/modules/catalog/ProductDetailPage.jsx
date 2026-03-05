import { Link, Navigate, useParams } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { APP_ROUTES } from "../../router/paths";
import { formatPrice } from "../../utils/formatters";
import "./CatalogPage.css";

function ProductDetailPage({
  currentUser,
  cartTotalItems,
  onToggleCart,
  onLogout,
  products,
  productsLoading,
  productsError,
  onAddToCart
}) {
  const { slug } = useParams();

  if (!slug) {
    return <Navigate to={APP_ROUTES.CATALOG} replace />;
  }

  const product = products.find((item) => item.slug === slug);

  return (
    <div className="view-shell">
      <SiteHeader
        currentUser={currentUser}
        cartTotalItems={cartTotalItems}
        onToggleCart={onToggleCart}
        onLogout={onLogout}
      />

      <main>
        <section className="product-section">
          <div className="section-head">
            <div>
              <h2>商品详情</h2>
              <p>查看商品完整信息并可直接加购。</p>
            </div>
            <Link to={APP_ROUTES.CATALOG} className="section-link-button">
              返回商品列表
            </Link>
          </div>

          {productsLoading ? <div className="status-panel">商品加载中...</div> : null}
          {!productsLoading && productsError ? <div className="status-panel error">{productsError}</div> : null}
          {!productsLoading && !productsError && !product ? (
            <div className="status-panel">未找到该商品，可能已下架。</div>
          ) : null}

          {!productsLoading && !productsError && product ? (
            <article className="product-detail">
              <div className="product-detail-image-wrap">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
                ) : (
                  <div className="product-image-fallback">暂无图片</div>
                )}
              </div>
              <div className="product-detail-main">
                <div className="product-detail-top">
                  {product.badge ? <span className="product-badge">{product.badge}</span> : null}
                  <h1>{product.name}</h1>
                  <p className="product-detail-sub">
                    分类：{product.category} | 商户：{product.merchantName || "平台自营"}
                  </p>
                </div>
                <p className="product-detail-desc">{product.description}</p>
                <div className="product-detail-metrics">
                  <div>
                    <span>价格</span>
                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                  <div>
                    <span>评分</span>
                    <strong>{product.rating}</strong>
                  </div>
                  <div>
                    <span>库存</span>
                    <strong>{product.stockQuantity}</strong>
                  </div>
                </div>
                <div className="product-detail-actions">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product.id)}
                    disabled={product.stockQuantity <= 0}
                  >
                    {product.stockQuantity <= 0 ? "暂时缺货" : "加入购物车"}
                  </button>
                  <Link to={APP_ROUTES.CATALOG} className="section-link-button">
                    继续逛逛
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ProductDetailPage;
