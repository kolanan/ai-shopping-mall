import { useEffect, useMemo, useState } from "react";
import {
  clearStoredUser,
  loadStoredUser,
  login,
  register,
  registerMerchant,
  storeUser
} from "./api/auth";
import {
  fetchAdminCategories,
  fetchMerchantProducts,
  createMerchantProduct,
  updateMerchantProduct,
  uploadMerchantProductImage
} from "./api/admin";
import {
  addCartItem,
  fetchCart,
  removeCartItem,
  updateCartItem,
  validateCartCheckout
} from "./api/cart";
import { createOrder, fetchOrders, updateOrderStatus } from "./api/orders";
import { fetchCatalogProducts } from "./api/products";

const ORDER_STATUS_LABELS = {
  CREATED: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};

const DEFAULT_AUTH_FORM = {
  fullName: "",
  email: "",
  password: ""
};

const DEFAULT_PRODUCT_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  rating: "4.8",
  badge: "",
  imageUrl: "",
  categorySlug: "",
  stockQuantity: "0",
  displayOrder: "1",
  active: true,
  featured: false
};

function formatPrice(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY"
  }).format(amount);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function buildProductPayload(form, merchantId) {
  return {
    merchantId,
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    rating: Number(form.rating),
    badge: form.badge.trim(),
    imageUrl: form.imageUrl.trim(),
    categorySlug: form.categorySlug,
    stockQuantity: Number(form.stockQuantity),
    displayOrder: Number(form.displayOrder),
    active: Boolean(form.active),
    featured: Boolean(form.featured)
  };
}

function Modal({ title, className = "", onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`auth-modal ${className}`.trim()} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [catalogFeedback, setCatalogFeedback] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentUser, setCurrentUser] = useState(() => loadStoredUser());
  const [authModal, setAuthModal] = useState({ open: false, accountType: "user", mode: "login" });
  const [authForm, setAuthForm] = useState(DEFAULT_AUTH_FORM);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authFeedback, setAuthFeedback] = useState(null);

  const [cart, setCart] = useState({ userId: null, totalItems: 0, totalAmount: 0, items: [] });
  const [cartFeedback, setCartFeedback] = useState(null);
  const [checkoutValidation, setCheckoutValidation] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [busyCartItemId, setBusyCartItemId] = useState(null);
  const [cartSubmitting, setCartSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState(null);
  const [busyOrderId, setBusyOrderId] = useState(null);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminCategories, setAdminCategories] = useState([]);
  const [merchantProducts, setMerchantProducts] = useState([]);
  const [adminForm, setAdminForm] = useState(DEFAULT_PRODUCT_FORM);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const categoryOptions = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      if (product.category && !map.has(product.category)) {
        map.set(product.category, product.category);
      }
    });
    return ["all", ...map.keys()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchKeyword =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.merchantName.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [products, categoryFilter, searchKeyword]);

  useEffect(() => {
    void loadCatalogProducts();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      setCart({ userId: null, totalItems: 0, totalAmount: 0, items: [] });
      setOrders([]);
      return;
    }

    void Promise.all([loadCart(currentUser.id), loadOrders(currentUser.id)]);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!adminOpen || currentUser?.role !== "MERCHANT") {
      return;
    }

    void loadAdminData(currentUser.id);
  }, [adminOpen, currentUser?.id, currentUser?.role]);

  async function loadCatalogProducts() {
    setProductsLoading(true);
    setProductsError("");

    try {
      const data = await fetchCatalogProducts();
      setProducts(data);
    } catch (error) {
      setProductsError(error.message);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadCart(userId) {
    try {
      const data = await fetchCart(userId);
      setCart(data);
    } catch (error) {
      setCartFeedback({ type: "error", message: error.message });
    }
  }

  async function loadOrders(userId) {
    try {
      const data = await fetchOrders(userId);
      setOrders(data);
    } catch (error) {
      setOrderFeedback({ type: "error", message: error.message });
    }
  }

  async function loadAdminData(merchantId) {
    setAdminLoading(true);
    setAdminFeedback(null);

    try {
      const [categories, productsData] = await Promise.all([
        fetchAdminCategories(),
        fetchMerchantProducts(merchantId)
      ]);
      setAdminCategories(categories);
      setMerchantProducts(productsData);
      setAdminForm((current) => ({
        ...current,
        categorySlug: current.categorySlug || categories[0]?.slug || ""
      }));
    } catch (error) {
      setAdminFeedback({ type: "error", message: error.message });
    } finally {
      setAdminLoading(false);
    }
  }

  function openAuth(accountType, mode) {
    setAuthFeedback(null);
    setAuthForm(DEFAULT_AUTH_FORM);
    setAuthModal({ open: true, accountType, mode });
  }

  function closeAuth() {
    setAuthModal((current) => ({ ...current, open: false }));
    setAuthFeedback(null);
    setAuthSubmitting(false);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthFeedback(null);

    try {
      const payload = {
        email: authForm.email.trim(),
        password: authForm.password
      };

      let user;
      if (authModal.mode === "login") {
        user = await login(payload);
        if (authModal.accountType === "merchant" && user.role !== "MERCHANT") {
          throw new Error("当前账号不是商户账号");
        }
      } else if (authModal.accountType === "merchant") {
        user = await registerMerchant({
          fullName: authForm.fullName.trim(),
          email: authForm.email.trim(),
          password: authForm.password
        });
      } else {
        user = await register({
          fullName: authForm.fullName.trim(),
          email: authForm.email.trim(),
          password: authForm.password
        });
      }

      storeUser(user);
      setCurrentUser(user);
      closeAuth();
      if (user.role === "MERCHANT") {
        setAdminOpen(true);
      }
    } catch (error) {
      setAuthFeedback({ type: "error", message: error.message });
    } finally {
      setAuthSubmitting(false);
    }
  }

  function handleLogout() {
    clearStoredUser();
    setCurrentUser(null);
    setCartOpen(false);
    setOrdersOpen(false);
    setAdminOpen(false);
    setCartFeedback(null);
    setOrderFeedback(null);
    setAdminFeedback(null);
    setOrderResult(null);
    setCheckoutValidation(null);
  }

  async function handleAddToCart(productId) {
    if (!currentUser?.id) {
      openAuth("user", "login");
      setCatalogFeedback({ type: "error", message: "请先登录后再加入购物车" });
      return;
    }

    try {
      setCatalogFeedback(null);
      const data = await addCartItem({ userId: currentUser.id, productId, quantity: 1 });
      setCart(data);
      setCatalogFeedback({ type: "success", message: "已加入购物车" });
    } catch (error) {
      setCatalogFeedback({ type: "error", message: error.message });
    }
  }

  async function handleUpdateCartQuantity(itemId, quantity) {
    if (!currentUser?.id) {
      return;
    }

    setBusyCartItemId(itemId);
    setCartFeedback(null);
    try {
      const data = await updateCartItem(itemId, { userId: currentUser.id, quantity });
      setCart(data);
    } catch (error) {
      setCartFeedback({ type: "error", message: error.message });
    } finally {
      setBusyCartItemId(null);
    }
  }

  async function handleRemoveCartItem(itemId) {
    if (!currentUser?.id) {
      return;
    }

    setBusyCartItemId(itemId);
    setCartFeedback(null);
    try {
      const data = await removeCartItem(itemId, currentUser.id);
      setCart(data);
    } catch (error) {
      setCartFeedback({ type: "error", message: error.message });
    } finally {
      setBusyCartItemId(null);
    }
  }

  async function handleValidateCheckout() {
    if (!currentUser?.id) {
      return;
    }

    setCartSubmitting(true);
    setCartFeedback(null);
    try {
      const data = await validateCartCheckout(currentUser.id);
      setCheckoutValidation(data);
      setCartFeedback({ type: data.valid ? "success" : "error", message: data.message });
    } catch (error) {
      setCartFeedback({ type: "error", message: error.message });
    } finally {
      setCartSubmitting(false);
    }
  }

  async function handleCheckout() {
    if (!currentUser?.id) {
      return;
    }

    setCartSubmitting(true);
    setCartFeedback(null);
    try {
      const result = await createOrder({ userId: currentUser.id });
      setOrderResult(result);
      setCartFeedback({ type: "success", message: "订单已创建" });
      setCheckoutValidation(null);
      await Promise.all([loadCart(currentUser.id), loadOrders(currentUser.id), loadCatalogProducts()]);
    } catch (error) {
      setCartFeedback({ type: "error", message: error.message });
    } finally {
      setCartSubmitting(false);
    }
  }

  async function handleOrderStatus(orderId, status) {
    if (!currentUser?.id) {
      return;
    }

    setBusyOrderId(orderId);
    setOrderFeedback(null);
    try {
      const updated = await updateOrderStatus(orderId, { userId: currentUser.id, status });
      setOrders((current) => current.map((order) => (order.orderId === orderId ? updated : order)));
      setOrderFeedback({ type: "success", message: "订单状态已更新" });
      await loadCatalogProducts();
    } catch (error) {
      setOrderFeedback({ type: "error", message: error.message });
    } finally {
      setBusyOrderId(null);
    }
  }

  function openAdmin() {
    if (!currentUser) {
      openAuth("merchant", "login");
      return;
    }

    if (currentUser.role !== "MERCHANT") {
      setCatalogFeedback({ type: "error", message: "请使用商户账号登录后台" });
      openAuth("merchant", "login");
      return;
    }

    setAdminOpen(true);
  }

  function resetAdminForm() {
    setEditingProductId(null);
    setAdminForm({
      ...DEFAULT_PRODUCT_FORM,
      categorySlug: adminCategories[0]?.slug || ""
    });
  }

  function handleAdminFieldChange(event) {
    const { name, value, type, checked } = event.target;
    setAdminForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value
      };

      if (name === "name" && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  async function handleAdminImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) {
      return;
    }

    setUploadingImage(true);
    setAdminFeedback(null);
    try {
      const response = await uploadMerchantProductImage(currentUser.id, file);
      setAdminForm((current) => ({ ...current, imageUrl: response.imageUrl }));
      setAdminFeedback({ type: "success", message: "图片上传成功" });
    } catch (error) {
      setAdminFeedback({ type: "error", message: error.message });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleAdminSubmit(event) {
    event.preventDefault();
    if (!currentUser?.id) {
      return;
    }

    setAdminSubmitting(true);
    setAdminFeedback(null);
    try {
      const payload = buildProductPayload(adminForm, currentUser.id);
      const saved = editingProductId
        ? await updateMerchantProduct(editingProductId, payload)
        : await createMerchantProduct(payload);

      setAdminFeedback({ type: "success", message: editingProductId ? "商品更新成功" : "商品创建成功" });
      setMerchantProducts((current) => {
        if (editingProductId) {
          return current.map((product) => (product.id === saved.id ? saved : product));
        }
        return [saved, ...current];
      });
      resetAdminForm();
      await loadCatalogProducts();
    } catch (error) {
      setAdminFeedback({ type: "error", message: error.message });
    } finally {
      setAdminSubmitting(false);
    }
  }

  function handleEditMerchantProduct(product) {
    setEditingProductId(product.id);
    setAdminForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      rating: String(product.rating ?? "4.8"),
      badge: product.badge || "",
      imageUrl: product.imageUrl || "",
      categorySlug: product.categorySlug || adminCategories[0]?.slug || "",
      stockQuantity: String(product.stockQuantity ?? 0),
      displayOrder: String(product.displayOrder ?? 1),
      active: Boolean(product.active),
      featured: Boolean(product.featured)
    });
    setAdminFeedback(null);
  }

  function renderOrderActions(order) {
    if (order.status === "CREATED") {
      return (
        <div className="order-actions">
          <button
            type="button"
            className="order-action-button"
            disabled={busyOrderId === order.orderId}
            onClick={() => handleOrderStatus(order.orderId, "PAID")}
          >
            标记支付
          </button>
          <button
            type="button"
            className="order-action-button"
            disabled={busyOrderId === order.orderId}
            onClick={() => handleOrderStatus(order.orderId, "CANCELLED")}
          >
            取消订单
          </button>
        </div>
      );
    }

    if (order.status === "PAID") {
      return (
        <div className="order-actions">
          <button
            type="button"
            className="order-action-button"
            disabled={busyOrderId === order.orderId}
            onClick={() => handleOrderStatus(order.orderId, "SHIPPED")}
          >
            标记发货
          </button>
          <button
            type="button"
            className="order-action-button"
            disabled={busyOrderId === order.orderId}
            onClick={() => handleOrderStatus(order.orderId, "CANCELLED")}
          >
            取消订单
          </button>
        </div>
      );
    }

    if (order.status === "SHIPPED") {
      return (
        <div className="order-actions">
          <button
            type="button"
            className="order-action-button"
            disabled={busyOrderId === order.orderId}
            onClick={() => handleOrderStatus(order.orderId, "COMPLETED")}
          >
            确认完成
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">商</div>
          <div>
            <div className="brand-name">智选商城</div>
            <div className="brand-tag">商户录入商品，前台实时展示</div>
          </div>
        </div>

        <div className="search-wrap">
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "全部分类" : option}
              </option>
            ))}
          </select>
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="搜索商品、描述或商户"
          />
          <button type="button">搜索</button>
        </div>

        <div className="account-nav">
          {currentUser ? (
            <>
              <div className="account-pill">
                {currentUser.fullName}
                {currentUser.role === "MERCHANT" ? " · 商户" : " · 用户"}
              </div>
              <button type="button" className="nav-button" onClick={() => setOrdersOpen(true)}>
                我的订单
              </button>
              <button type="button" className="nav-button" onClick={() => setCartOpen(true)}>
                购物车 {cart.totalItems || 0}
              </button>
              <button type="button" className="nav-button" onClick={openAdmin}>
                商户后台
              </button>
              <button type="button" className="nav-button secondary" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <>
              <button type="button" className="nav-button" onClick={() => openAuth("user", "login")}>
                登录
              </button>
              <button type="button" className="nav-button" onClick={() => openAuth("user", "register")}>
                注册
              </button>
              <button type="button" className="nav-button secondary" onClick={() => openAuth("merchant", "login")}>
                商户登录
              </button>
            </>
          )}
        </div>
      </header>

      <div className="subnav">
        <span>首页推荐</span>
        <span>商户入驻</span>
        <span>新品上架</span>
        <span>库存直连</span>
        <span>订单跟踪</span>
      </div>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">中文首页 + 商户后台</p>
            <h1>商户录入商品信息后，前台立即展示。</h1>
            <p>
              商户可登录后台维护商品名称、分类、价格、库存、图片和上下架状态，用户前台查看的是同一套真实数据。
            </p>
            <div className="hero-actions">
              <button type="button" onClick={() => openAuth("merchant", "register")}>
                商户入驻
              </button>
              <button type="button" className="secondary" onClick={openAdmin}>
                进入商户后台
              </button>
            </div>
            {catalogFeedback ? <div className={`inline-feedback ${catalogFeedback.type}`}>{catalogFeedback.message}</div> : null}
          </div>

          <div className="hero-grid">
            <article className="hero-card">
              <h2>商户管理</h2>
              <p>录入商品、上传图片、设置库存、上下架和首页推荐位。</p>
            </article>
            <article className="hero-card">
              <h2>用户前台</h2>
              <p>首页商品列表直接读取后台录入内容，支持加购、下单和查看订单。</p>
            </article>
            <article className="hero-card">
              <h2>演示商户账号</h2>
              <p>邮箱 merchant@aism.com，密码 merchant123。</p>
            </article>
            <article className="hero-card">
              <h2>图片存储</h2>
              <p>商品图片上传后存入 SeaweedFS，并把 URL 返回给前端展示。</p>
            </article>
          </div>
        </section>

        <section className="product-section">
          <div className="section-head">
            <div>
              <h2>商品目录</h2>
              <p>首页展示的是商户后台和平台现有的上架商品。</p>
            </div>
            <button type="button" className="section-link-button" onClick={openAdmin}>
              管理我的商品
            </button>
          </div>

          {productsLoading ? <div className="status-panel">商品加载中...</div> : null}
          {!productsLoading && productsError ? <div className="status-panel error">{productsError}</div> : null}
          {!productsLoading && !productsError && filteredProducts.length === 0 ? (
            <div className="status-panel">当前没有匹配商品</div>
          ) : null}

          {!productsLoading && !productsError && filteredProducts.length > 0 ? (
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
                  <div className="product-merchant">库存：{product.stockQuantity}</div>
                  <div className="price-row">
                    <strong>{formatPrice(product.price)}</strong>
                    <span>评分 {product.rating}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.id)}
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

      {authModal.open ? (
        <Modal
          title={`${authModal.accountType === "merchant" ? "商户" : "用户"}${authModal.mode === "login" ? "登录" : "注册"}`}
          onClose={closeAuth}
        >
          <p className="auth-intro">
            {authModal.accountType === "merchant"
              ? "商户登录后可进入后台录入商品、图片和库存。"
              : "用户登录后可加入购物车、下单和查看订单。"}
          </p>
          <div className="auth-tabs">
            <button
              type="button"
              className={authModal.mode === "login" ? "active" : ""}
              onClick={() => setAuthModal((current) => ({ ...current, mode: "login" }))}
            >
              登录
            </button>
            <button
              type="button"
              className={authModal.mode === "register" ? "active" : ""}
              onClick={() => setAuthModal((current) => ({ ...current, mode: "register" }))}
            >
              注册
            </button>
          </div>
          {authFeedback ? <div className={`auth-feedback ${authFeedback.type}`}>{authFeedback.message}</div> : null}
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authModal.mode === "register" ? (
              <label>
                姓名
                <input
                  name="fullName"
                  value={authForm.fullName}
                  onChange={(event) => setAuthForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="请输入姓名"
                />
              </label>
            ) : null}
            <label>
              邮箱
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="请输入邮箱"
              />
            </label>
            <label>
              密码
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="请输入密码"
              />
            </label>
            <button type="submit" disabled={authSubmitting}>
              {authSubmitting ? "提交中..." : authModal.mode === "login" ? "立即登录" : "立即注册"}
            </button>
          </form>
        </Modal>
      ) : null}

      {cartOpen ? (
        <Modal title="购物车" className="cart-modal" onClose={() => setCartOpen(false)}>
          {cartFeedback ? <div className={`checkout-feedback ${cartFeedback.type}`}>{cartFeedback.message}</div> : null}
          <div className="cart-list">
            {cart.items?.length ? (
              cart.items.map((item) => (
                <article key={item.id} className="cart-item">
                  <div>
                    <h3>{item.productName}</h3>
                    <p>{item.category}</p>
                  </div>
                  <div className="cart-item-meta">
                    <strong>{formatPrice(item.lineTotal)}</strong>
                    <div className="quantity-control">
                      <button
                        type="button"
                        disabled={busyCartItemId === item.id || item.quantity <= 1}
                        onClick={() => handleUpdateCartQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        disabled={busyCartItemId === item.id}
                        onClick={() => handleUpdateCartQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-remove-button"
                      disabled={busyCartItemId === item.id}
                      onClick={() => handleRemoveCartItem(item.id)}
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="status-panel">购物车还是空的</div>
            )}
          </div>

          <div className="cart-summary">
            <span>共 {cart.totalItems || 0} 件商品</span>
            <strong>{formatPrice(cart.totalAmount)}</strong>
          </div>

          {checkoutValidation ? (
            <div className={`checkout-feedback ${checkoutValidation.valid ? "success" : "error"}`}>
              <p>{checkoutValidation.message}</p>
              {checkoutValidation.issues?.length ? (
                <div className="checkout-issues">
                  {checkoutValidation.issues.map((issue, index) => (
                    <div key={`${issue.productId}-${index}`} className="checkout-issue-item">
                      <strong>{issue.productName}</strong>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {orderResult ? (
            <div className="order-result">
              <h3>下单成功</h3>
              <div className="order-result-row">
                <span>订单号</span>
                <strong>{orderResult.orderNo}</strong>
              </div>
              <div className="order-result-row">
                <span>订单金额</span>
                <strong>{formatPrice(orderResult.totalAmount)}</strong>
              </div>
            </div>
          ) : null}

          <div className="checkout-actions">
            <button type="button" className="checkout-button secondary-check" onClick={handleValidateCheckout} disabled={cartSubmitting || !cart.items?.length}>
              先校验库存
            </button>
            <button type="button" className="checkout-button" onClick={handleCheckout} disabled={cartSubmitting || !cart.items?.length}>
              去结算
            </button>
          </div>
        </Modal>
      ) : null}

      {ordersOpen ? (
        <Modal title="我的订单" className="orders-modal" onClose={() => setOrdersOpen(false)}>
          {orderFeedback ? <div className={`auth-feedback ${orderFeedback.type}`}>{orderFeedback.message}</div> : null}
          <div className="orders-list">
            {orders.length ? (
              orders.map((order) => (
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
                    {order.items.map((item) => (
                      <div key={`${order.orderId}-${item.productId}`} className="order-result-row">
                        <span>{item.productName} × {item.quantity}</span>
                        <strong>{formatPrice(item.lineTotal)}</strong>
                      </div>
                    ))}
                  </div>
                  {renderOrderActions(order)}
                </article>
              ))
            ) : (
              <div className="status-panel">还没有订单记录</div>
            )}
          </div>
        </Modal>
      ) : null}

      {adminOpen ? (
        <Modal title="商户后台" className="admin-modal" onClose={() => setAdminOpen(false)}>
          <div className="admin-head">
            <div>
              <strong>{currentUser?.fullName || "商户"}</strong>
              <p>录入商品信息、库存和图片，首页商品区会直接读取这些数据。</p>
            </div>
            <button type="button" className="section-link-button" onClick={resetAdminForm}>
              新建商品
            </button>
          </div>

          {adminFeedback ? <div className={`auth-feedback ${adminFeedback.type}`}>{adminFeedback.message}</div> : null}

          <div className="admin-layout">
            <form className="auth-form admin-form" onSubmit={handleAdminSubmit}>
              <div className="admin-grid">
                <label>
                  商品名称
                  <input name="name" value={adminForm.name} onChange={handleAdminFieldChange} placeholder="请输入商品名称" />
                </label>
                <label>
                  商品标识
                  <input name="slug" value={adminForm.slug} onChange={handleAdminFieldChange} placeholder="用于唯一标识商品" />
                </label>
                <label>
                  销售价
                  <input name="price" type="number" min="0.01" step="0.01" value={adminForm.price} onChange={handleAdminFieldChange} />
                </label>
                <label>
                  评分
                  <input name="rating" type="number" min="0" max="5" step="0.1" value={adminForm.rating} onChange={handleAdminFieldChange} />
                </label>
                <label>
                  分类
                  <select name="categorySlug" value={adminForm.categorySlug} onChange={handleAdminFieldChange}>
                    {adminCategories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  标签
                  <input name="badge" value={adminForm.badge} onChange={handleAdminFieldChange} placeholder="如：新品首发" />
                </label>
                <label>
                  库存
                  <input name="stockQuantity" type="number" min="0" value={adminForm.stockQuantity} onChange={handleAdminFieldChange} />
                </label>
                <label>
                  展示顺序
                  <input name="displayOrder" type="number" min="1" value={adminForm.displayOrder} onChange={handleAdminFieldChange} />
                </label>
              </div>

              <label>
                商品描述
                <input name="description" value={adminForm.description} onChange={handleAdminFieldChange} placeholder="请输入商品描述" />
              </label>
              <label>
                图片地址
                <input name="imageUrl" value={adminForm.imageUrl} onChange={handleAdminFieldChange} placeholder="可直接填写 URL，或使用下面的上传功能" />
              </label>
              <label>
                上传商品图片
                <input type="file" accept="image/*" onChange={handleAdminImageUpload} disabled={uploadingImage} />
              </label>
              <div className="admin-switches">
                <label className="checkbox-row">
                  <input type="checkbox" name="active" checked={adminForm.active} onChange={handleAdminFieldChange} />
                  <span>上架展示</span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" name="featured" checked={adminForm.featured} onChange={handleAdminFieldChange} />
                  <span>首页推荐</span>
                </label>
              </div>
              <button type="submit" disabled={adminSubmitting || adminLoading || uploadingImage || !adminCategories.length}>
                {adminSubmitting ? "保存中..." : editingProductId ? "保存商品" : "创建商品"}
              </button>
            </form>

            <section className="admin-products-panel">
              <h3>我的商品</h3>
              {adminLoading ? <div className="status-panel">商户商品加载中...</div> : null}
              {!adminLoading && merchantProducts.length === 0 ? <div className="status-panel">还没有录入商品</div> : null}
              <div className="admin-products-list">
                {merchantProducts.map((product) => (
                  <article key={product.id} className="admin-product-card">
                    <div className="admin-product-meta">
                      <strong>{product.name}</strong>
                      <span>{product.categoryName}</span>
                      <span>库存 {product.stockQuantity}</span>
                      <span>{product.active ? "已上架" : "未上架"}</span>
                      <span>{formatPrice(product.price)}</span>
                    </div>
                    <div className="admin-product-actions">
                      <button type="button" className="order-action-button" onClick={() => handleEditMerchantProduct(product)}>
                        编辑
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default App;
