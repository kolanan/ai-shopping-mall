import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { APP_ROUTES } from "../../router/paths";
import "./MerchantDashboardPage.css";

function toEditForm(product) {
  return {
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: String(product?.price ?? ""),
    rating: String(product?.rating ?? ""),
    badge: product?.badge || "",
    imageUrl: product?.imageUrl || "",
    categorySlug: product?.categorySlug || "",
    stockQuantity: String(product?.stockQuantity ?? 0),
    displayOrder: String(product?.displayOrder ?? 1),
    active: Boolean(product?.active),
    featured: Boolean(product?.featured)
  };
}

function MerchantProductEditPage({
  currentUser,
  onLogout,
  merchant,
  onUpdateProduct,
  onUploadProductImage
}) {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const currentProduct = useMemo(() => {
    const fromState = location.state?.product;
    if (fromState?.id && String(fromState.id) === String(productId)) {
      return fromState;
    }
    return merchant.products.find((item) => String(item.id) === String(productId)) || null;
  }, [location.state, merchant.products, productId]);

  const [editForm, setEditForm] = useState(() => toEditForm(currentProduct));

  useEffect(() => {
    setEditForm(toEditForm(currentProduct));
  }, [currentProduct]);

  if (!currentUser?.id) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (currentUser.role !== "MERCHANT") {
    return <Navigate to={APP_ROUTES.CATALOG} replace />;
  }

  return (
    <div className="view-shell">
      <SiteHeader currentUser={currentUser} cartTotalItems={0} onToggleCart={() => {}} onLogout={onLogout} />

      <main className="merchant-dashboard">
        <section className="merchant-hero product-section">
          <div>
            <p className="eyebrow">Merchant Console</p>
            <h1>编辑商品</h1>
            <p>更新商品信息后会返回我的商品列表。</p>
          </div>
        </section>

        <section className="product-section merchant-create">
          <div className="section-head">
            <div>
              <h2>商品编辑</h2>
              <p>{currentProduct ? `正在编辑：${currentProduct.name}` : "未找到目标商品，请返回列表后重试。"}</p>
            </div>
            <Link to={APP_ROUTES.MERCHANT_PRODUCTS} className="section-link-button">
              返回我的商品
            </Link>
          </div>

          {merchant.error ? <div className="status-panel error">{merchant.error}</div> : null}

          {!currentProduct ? (
            <div className="status-panel">请从“我的商品”列表点击“编辑”进入此页面。</div>
          ) : (
            <form
              className="merchant-form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                void onUpdateProduct(currentProduct.id, editForm).then((ok) => {
                  if (ok) {
                    navigate(APP_ROUTES.MERCHANT_PRODUCTS);
                  }
                });
              }}
            >
              <label>
                商品名称
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label>
                商品标识(slug)
                <input
                  value={editForm.slug}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, slug: event.target.value }))}
                />
              </label>
              <label>
                价格
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editForm.price}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </label>
              <label>
                评分
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editForm.rating}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, rating: event.target.value }))}
                />
              </label>
              <label>
                分类
                <select
                  value={editForm.categorySlug}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, categorySlug: event.target.value }))}
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
                库存
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editForm.stockQuantity}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
                />
              </label>
              <label>
                展示顺序
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={editForm.displayOrder}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
                />
              </label>
              <label>
                标签
                <input
                  value={editForm.badge}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, badge: event.target.value }))}
                />
              </label>

              <label className="merchant-full-width">
                商品图片
                <div className="merchant-upload-panel">
                  <div className="merchant-upload-row">
                    <label className="merchant-upload-picker">
                      <input
                        className="merchant-upload-native"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          setSelectedImageFile(event.target.files?.[0] || null);
                        }}
                      />
                      {selectedImageFile ? "重新选择" : "选择图片"}
                    </label>
                    <span className="merchant-upload-file">
                      {selectedImageFile ? selectedImageFile.name : "支持 JPG/PNG/WebP，建议 1:1"}
                    </span>
                    <button
                      type="button"
                      className="merchant-upload-submit"
                      disabled={!selectedImageFile || merchant.imageUploading}
                      onClick={() => {
                        if (!selectedImageFile) {
                          return;
                        }
                        void onUploadProductImage(selectedImageFile).then((imageUrl) => {
                          if (imageUrl) {
                            setEditForm((prev) => ({ ...prev, imageUrl }));
                          }
                          setSelectedImageFile(null);
                        });
                      }}
                    >
                      {merchant.imageUploading ? "上传中..." : "上传图片"}
                    </button>
                  </div>
                  {editForm.imageUrl ? (
                    <div className="merchant-upload-preview merchant-upload-preview-card">
                      <img src={editForm.imageUrl} alt="商品图片" />
                      <a href={editForm.imageUrl} target="_blank" rel="noreferrer">
                        查看原图
                      </a>
                    </div>
                  ) : (
                    <div className="merchant-upload-preview">未设置图片</div>
                  )}
                </div>
              </label>

              <label className="merchant-full-width">
                商品描述
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <label className="merchant-checkbox">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, active: event.target.checked }))}
                />
                上架可售
              </label>
              <label className="merchant-checkbox">
                <input
                  type="checkbox"
                  checked={editForm.featured}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, featured: event.target.checked }))}
                />
                首页精选
              </label>

              <div className="merchant-actions merchant-full-width">
                <button type="submit" disabled={merchant.updateSubmitting}>
                  {merchant.updateSubmitting ? "保存中..." : "保存修改"}
                </button>
                <Link to={APP_ROUTES.MERCHANT_PRODUCTS} className="section-link-button">
                  取消
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default MerchantProductEditPage;

