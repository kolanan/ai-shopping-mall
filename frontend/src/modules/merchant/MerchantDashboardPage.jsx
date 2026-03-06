import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
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
  onStockInProduct,
  onDeleteProduct,
  onChangePage
}) {
  const [stockInQuantityMap, setStockInQuantityMap] = useState({});
  const totalStock = useMemo(
    () => merchant.products.reduce((sum, product) => sum + (product.stockQuantity || 0), 0),
    [merchant.products]
  );
  const activeCount = useMemo(
    () => merchant.products.filter((product) => product.active).length,
    [merchant.products]
  );
  const lowStockCount = useMemo(
    () => merchant.products.filter((product) => (product.stockQuantity || 0) <= 5).length,
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

  async function handleDelete(productId, name) {
    const confirmed = window.confirm(`确认删除商品「${name}」吗？此操作不可恢复。`);
    if (!confirmed) {
      return;
    }
    await onDeleteProduct(productId);
  }

  const currentPage = merchant.productPage?.page || 1;
  const totalPages = merchant.productPage?.totalPages || 1;
  const total = merchant.productPage?.total || 0;

  return (
    <div className="view-shell">
      <SiteHeader currentUser={currentUser} cartTotalItems={0} onToggleCart={() => {}} onLogout={onLogout} />

      <main className="merchant-dashboard">
        <section className="merchant-hero product-section merchant-hero-surface">
          <div>
            <p className="eyebrow">Merchant Console</p>
            <h1>商品管理</h1>
            <p>按分页管理店铺商品，支持入库、编辑和删除。</p>
          </div>
          <div className="merchant-stats">
            <div className="merchant-stat-card">
              <span>当前页商品数</span>
              <strong>{merchant.products.length}</strong>
            </div>
            <div className="merchant-stat-card">
              <span>当前页库存总量</span>
              <strong>{totalStock}</strong>
            </div>
            <div className="merchant-stat-card merchant-stat-card-warn">
              <span>低库存预警(≤5)</span>
              <strong>{lowStockCount}</strong>
              <small>上架商品 {activeCount} 件</small>
            </div>
          </div>
        </section>

        <section className="product-section">
          <div className="section-head">
            <div>
              <h2>我的商品</h2>
              <p>
                第 {currentPage} / {totalPages} 页，共 {total} 条。
              </p>
            </div>
            <div className="merchant-actions">
              <Link to={APP_ROUTES.MERCHANT_DASHBOARD} className="section-link-button">
                首页统计
              </Link>
              <Link to={APP_ROUTES.MERCHANT_ORDERS} className="section-link-button">
                订单管理
              </Link>
              <Link to={APP_ROUTES.MERCHANT_PRODUCT_CREATE} className="button-like merchant-action-link">
                新增商品
              </Link>
              <button type="button" className="section-link-button" onClick={onRefresh}>
                刷新列表
              </button>
            </div>
          </div>

          {merchant.error ? <div className="status-panel error">{merchant.error}</div> : null}
          {merchant.loading ? <div className="status-panel">商品加载中...</div> : null}
          {!merchant.loading && !merchant.products.length ? (
            <div className="status-panel">你还没有录入商品。</div>
          ) : null}

          {!merchant.loading && merchant.products.length ? (
            <>
              <div className="merchant-table-wrap">
                <table className="merchant-table">
                  <thead>
                    <tr>
                      <th>商品</th>
                      <th>图片</th>
                      <th>分类</th>
                      <th>售价</th>
                      <th>评分</th>
                      <th>标签</th>
                      <th>库存</th>
                      <th>排序</th>
                      <th>状态</th>
                      <th>入库</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchant.products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>
                          <div className="merchant-sub">{product.slug}</div>
                        </td>
                        <td>
                          {product.imageUrl ? (
                            <img className="merchant-thumb" src={product.imageUrl} alt={product.name} />
                          ) : (
                            <span className="merchant-sub">无图</span>
                          )}
                        </td>
                        <td>{product.categoryName}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.rating}</td>
                        <td>{product.badge || "-"}</td>
                        <td>{product.stockQuantity}</td>
                        <td>{product.displayOrder}</td>
                        <td>
                          {product.active ? "上架" : "下架"}
                          {product.featured ? " / 精选" : ""}
                        </td>
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
                        <td>
                          <div className="merchant-row-actions">
                            <Link
                              to={APP_ROUTES.MERCHANT_PRODUCT_EDIT.replace(":productId", String(product.id))}
                              state={{ product }}
                              className="section-link-button"
                            >
                              编辑
                            </Link>
                            <button
                              type="button"
                              className="merchant-delete-button"
                              onClick={() => void handleDelete(product.id, product.name)}
                              disabled={merchant.deletingProductId === product.id}
                            >
                              {merchant.deletingProductId === product.id ? "删除中..." : "删除"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="merchant-pagination">
                <button
                  type="button"
                  className="section-link-button"
                  onClick={() => onChangePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  上一页
                </button>
                <span>第 {currentPage} 页</span>
                <button
                  type="button"
                  className="section-link-button"
                  onClick={() => onChangePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  下一页
                </button>
              </div>
            </>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default MerchantDashboardPage;

