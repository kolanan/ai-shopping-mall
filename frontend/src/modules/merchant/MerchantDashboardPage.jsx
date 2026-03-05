import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { APP_ROUTES } from "../../router/paths";
import { formatPrice } from "../../utils/formatters";
import "./MerchantDashboardPage.css";

function MerchantDashboardPage({
  currentUser,
  onLogout,
  merchant,
  onRefresh,
  onCreateProduct,
  onStockInProduct
}) {
  const [stockInQuantityMap, setStockInQuantityMap] = useState({});
  const totalStock = useMemo(
    () => merchant.products.reduce((sum, product) => sum + (product.stockQuantity || 0), 0),
    [merchant.products]
  );

  if (!currentUser?.id) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (currentUser.role !== "MERCHANT") {
    return <Navigate to={APP_ROUTES.CATALOG} replace />;
  }

  function updateStockInput(productId, value) {
    setStockInQuantityMap((current) => ({
      ...current,
      [productId]: value
    }));
  }

  async function handleStockIn(productId) {
    const raw = stockInQuantityMap[productId] ?? "1";
    const quantity = Number(raw);
    await onStockInProduct(productId, quantity);
    setStockInQuantityMap((current) => ({
      ...current,
      [productId]: ""
    }));
  }

  return (
    <div className="view-shell">
      <SiteHeader currentUser={currentUser} cartTotalItems={0} onToggleCart={() => {}} onLogout={onLogout} />

      <main className="merchant-dashboard">
        <section className="merchant-hero product-section">
          <div>
            <p className="eyebrow">Merchant Console</p>
            <h1>商户商品管理</h1>
            <p>查看已录入商品、创建新商品并执行库存入库。</p>
          </div>
          <div className="merchant-stats">
            <div className="merchant-stat-card">
              <span>商品总数</span>
              <strong>{merchant.products.length}</strong>
            </div>
            <div className="merchant-stat-card">
              <span>库存总量</span>
              <strong>{totalStock}</strong>
            </div>
          </div>
        </section>

        <section className="product-section merchant-create">
          <div className="section-head">
            <div>
              <h2>新增商品</h2>
              <p>商品创建后会直接进入你的商品列表。</p>
            </div>
          </div>

          {merchant.error ? <div className="status-panel error">{merchant.error}</div> : null}

          <form
            className="merchant-form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              void onCreateProduct();
            }}
          >
            <label>
              商品名称
              <input
                value={merchant.productForm.name}
                onChange={(event) => merchant.updateProductFormField("name", event.target.value)}
                placeholder="例如：无线耳机"
              />
            </label>
            <label>
              商品标识(slug)
              <input
                value={merchant.productForm.slug}
                onChange={(event) => merchant.updateProductFormField("slug", event.target.value)}
                placeholder="例如：wireless-earbuds"
              />
            </label>
            <label>
              价格
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={merchant.productForm.price}
                onChange={(event) => merchant.updateProductFormField("price", event.target.value)}
              />
            </label>
            <label>
              评分
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={merchant.productForm.rating}
                onChange={(event) => merchant.updateProductFormField("rating", event.target.value)}
              />
            </label>
            <label>
              分类
              <select
                value={merchant.productForm.categorySlug}
                onChange={(event) => merchant.updateProductFormField("categorySlug", event.target.value)}
              >
                <option value="">请选择分类</option>
                {merchant.categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              初始库存
              <input
                type="number"
                min="0"
                step="1"
                value={merchant.productForm.stockQuantity}
                onChange={(event) => merchant.updateProductFormField("stockQuantity", event.target.value)}
              />
            </label>
            <label>
              展示顺序
              <input
                type="number"
                min="1"
                step="1"
                value={merchant.productForm.displayOrder}
                onChange={(event) => merchant.updateProductFormField("displayOrder", event.target.value)}
              />
            </label>
            <label>
              标签
              <input
                value={merchant.productForm.badge}
                onChange={(event) => merchant.updateProductFormField("badge", event.target.value)}
                placeholder="例如：新品"
              />
            </label>
            <label className="merchant-full-width">
              图片地址
              <input
                value={merchant.productForm.imageUrl}
                onChange={(event) => merchant.updateProductFormField("imageUrl", event.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="merchant-full-width">
              商品描述
              <textarea
                rows={3}
                value={merchant.productForm.description}
                onChange={(event) => merchant.updateProductFormField("description", event.target.value)}
                placeholder="请填写商品卖点和规格说明"
              />
            </label>
            <label className="merchant-checkbox">
              <input
                type="checkbox"
                checked={merchant.productForm.active}
                onChange={(event) => merchant.updateProductFormField("active", event.target.checked)}
              />
              上架可售
            </label>
            <label className="merchant-checkbox">
              <input
                type="checkbox"
                checked={merchant.productForm.featured}
                onChange={(event) => merchant.updateProductFormField("featured", event.target.checked)}
              />
              首页精选
            </label>

            <div className="merchant-actions merchant-full-width">
              <button type="submit" disabled={merchant.createSubmitting}>
                {merchant.createSubmitting ? "创建中..." : "创建商品"}
              </button>
              <button
                type="button"
                className="section-link-button"
                onClick={merchant.resetProductForm}
                disabled={merchant.createSubmitting}
              >
                重置表单
              </button>
              <button type="button" className="section-link-button" onClick={onRefresh}>
                刷新列表
              </button>
            </div>
          </form>
        </section>

        <section className="product-section">
          <div className="section-head">
            <div>
              <h2>我的商品</h2>
              <p>可执行库存入库，库存会立即同步。</p>
            </div>
          </div>

          {merchant.loading ? <div className="status-panel">商品加载中...</div> : null}
          {!merchant.loading && !merchant.products.length ? (
            <div className="status-panel">你还没有录入商品。</div>
          ) : null}

          {!merchant.loading && merchant.products.length ? (
            <div className="merchant-table-wrap">
              <table className="merchant-table">
                <thead>
                  <tr>
                    <th>商品</th>
                    <th>分类</th>
                    <th>售价</th>
                    <th>库存</th>
                    <th>状态</th>
                    <th>入库</th>
                  </tr>
                </thead>
                <tbody>
                  {merchant.products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        <div className="merchant-sub">{product.slug}</div>
                      </td>
                      <td>{product.categoryName}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{product.stockQuantity}</td>
                      <td>{product.active ? "上架" : "下架"}</td>
                      <td>
                        <div className="stock-in-row">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={stockInQuantityMap[product.id] ?? ""}
                            onChange={(event) => updateStockInput(product.id, event.target.value)}
                            placeholder="数量"
                          />
                          <button
                            type="button"
                            onClick={() => void handleStockIn(product.id)}
                            disabled={merchant.stockingProductId === product.id}
                          >
                            {merchant.stockingProductId === product.id ? "入库中..." : "入库"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default MerchantDashboardPage;