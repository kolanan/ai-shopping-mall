import "./CatalogPage.css";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { formatPrice } from "../../utils/formatters";

const HERO_CARDS = [
  {
    title: "新人专享",
    description: "首单限时优惠，爆款低价直降，适合快速入手常用好物。"
  },
  {
    title: "品牌严选",
    description: "优先推荐稳定口碑商户，品质和服务表现更稳定。"
  },
  {
    title: "热销推荐",
    description: "根据近期下单趋势整理高转化单品，选购效率更高。"
  },
  {
    title: "次日达专区",
    description: "优先展示库存充足商品，降低缺货和等待风险。"
  }
];

function CatalogPage({
  currentUser,
  cartTotalItems,
  onToggleCart,
  onLogout,
  onOpenCart,
  feedback,
  productsLoading,
  productsError,
  filteredProducts,
  categoryOptions,
  categoryFilter,
  onCategoryChange,
  searchKeyword,
  onSearchChange,
  onAddToCart
}) {
  const hasProducts = filteredProducts.length > 0;
  const showEmptyState = !productsLoading && !productsError && !hasProducts;
  const showErrorState = !productsLoading && Boolean(productsError);
  const showProducts = !productsLoading && !productsError && hasProducts;

  return (
    <div className="view-shell">
      <SiteHeader
        currentUser={currentUser}
        cartTotalItems={cartTotalItems}
        onToggleCart={onToggleCart}
        onLogout={onLogout}
      />

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="eyebrow">Catalog Module</p>
            <h1>精选好物每日上新，支持加购下单一站完成。</h1>
            <p>首页聚焦推荐专区、热销单品和品牌活动，帮你更快找到想买的商品。</p>
            <div className="hero-actions">
              <button type="button" onClick={onOpenCart}>
                打开购物车
              </button>
              <Link to={APP_ROUTES.ORDERS} className="button-like secondary">
                查看订单
              </Link>
            </div>
            {feedback ? <div className={`inline-feedback ${feedback.type}`}>{feedback.message}</div> : null}
          </div>

          <div className="home-hero-stats">
            {HERO_CARDS.map((card) => (
              <article key={card.title} className="hero-card">
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="product-section">
          <div className="section-head">
            <div>
              <h2>精选商品</h2>
              <p>数据来源：`/api/products/featured`</p>
            </div>
            <div className="search-wrap">
              <select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "全部分类" : option}
                  </option>
                ))}
              </select>
              <input
                value={searchKeyword}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="搜索商品、描述或商户"
              />
              <button type="button">搜索</button>
            </div>
          </div>

          {productsLoading ? <div className="status-panel">商品加载中...</div> : null}
          {showErrorState ? <div className="status-panel error">{productsError}</div> : null}
          {showEmptyState ? <div className="status-panel">当前没有匹配商品</div> : null}

          {showProducts ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card">
                  {product.badge ? <div className="product-badge">{product.badge}</div> : null}
                  <div className="product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="product-image-fallback">暂无图片</div>
                    )}
                    <span>{product.category}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-merchant">商户：{product.merchantName || "平台自营"}</div>
                  <div className="price-row">
                    <strong>{formatPrice(product.price)}</strong>
                    <span>评分 {product.rating}</span>
                  </div>
                  <Link
                    to={APP_ROUTES.PRODUCT_DETAIL.replace(":slug", product.slug)}
                    className="section-link-button"
                  >
                    查看详情
                  </Link>
                  <button
                    type="button"
                    onClick={() => onAddToCart(product.id)}
                    disabled={product.stockQuantity <= 0}
                  >
                    {product.stockQuantity <= 0 ? "暂时缺货" : "加入购物车"}
                  </button>
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

export default CatalogPage;
