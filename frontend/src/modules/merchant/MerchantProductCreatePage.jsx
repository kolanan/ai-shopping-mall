import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import SiteHeader from "../../components/layout/SiteHeader";
import SiteFooter from "../../components/layout/SiteFooter";
import { APP_ROUTES } from "../../router/paths";
import "./MerchantDashboardPage.css";

function MerchantProductCreatePage({
  currentUser,
  onLogout,
  merchant,
  onCreateProduct,
  onRefresh,
  onUploadProductImage
}) {
  const [selectedImageFile, setSelectedImageFile] = useState(null);

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
            <h1>新增商品</h1>
            <p>创建成功后将返回商品列表页第一页。</p>
          </div>
        </section>

        <section className="product-section merchant-create">
          <div className="section-head">
            <div>
              <h2>商品信息</h2>
              <p>请填写商品基础信息并提交创建。</p>
            </div>
            <Link to={APP_ROUTES.MERCHANT_DASHBOARD} className="section-link-button">
              返回我的商品
            </Link>
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
                      void onUploadProductImage(selectedImageFile).then(() => {
                        setSelectedImageFile(null);
                      });
                    }}
                  >
                    {merchant.imageUploading ? "上传中..." : "上传图片"}
                  </button>
                </div>
                {merchant.productForm.imageUrl ? (
                  <div className="merchant-upload-preview merchant-upload-preview-card">
                    <img src={merchant.productForm.imageUrl} alt="商品图片" />
                    <a href={merchant.productForm.imageUrl} target="_blank" rel="noreferrer">
                      查看原图
                    </a>
                  </div>
                ) : (
                  <div className="merchant-upload-preview">未上传图片</div>
                )}
              </div>
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
      </main>

      <SiteFooter />
    </div>
  );
}

export default MerchantProductCreatePage;
