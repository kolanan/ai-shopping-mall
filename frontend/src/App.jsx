
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { clearStoredUser, loadStoredUser, login, register, registerMerchant, storeUser } from "./api/auth";
import { fetchCatalogProducts } from "./api/products";

const DEFAULT_AUTH_FORM = {
  fullName: "",
  email: "",
  password: ""
};

function formatPrice(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY"
  }).format(amount);
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentUser, setCurrentUser] = useState(() => loadStoredUser());
  const [feedback, setFeedback] = useState(null);

  const [loginMode, setLoginMode] = useState("login");
  const [loginForm, setLoginForm] = useState(DEFAULT_AUTH_FORM);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  const [merchantForm, setMerchantForm] = useState(DEFAULT_AUTH_FORM);
  const [merchantSubmitting, setMerchantSubmitting] = useState(false);
  const [merchantFeedback, setMerchantFeedback] = useState(null);

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
        (product.merchantName || "").toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [products, categoryFilter, searchKeyword]);

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");

    if (location.pathname === "/login") {
      setLoginMode(mode === "register" ? "register" : "login");
      setLoginForm(DEFAULT_AUTH_FORM);
      setLoginFeedback(null);
    }

    if (location.pathname === "/merchant/join") {
      setMerchantForm(DEFAULT_AUTH_FORM);
      setMerchantFeedback(null);
    }
  }, [location.pathname, location.search]);

  async function loadProducts() {
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

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginSubmitting(true);
    setLoginFeedback(null);

    try {
      let user;
      if (loginMode === "login") {
        user = await login({
          email: loginForm.email.trim(),
          password: loginForm.password
        });
      } else {
        user = await register({
          fullName: loginForm.fullName.trim(),
          email: loginForm.email.trim(),
          password: loginForm.password
        });
      }

      storeUser(user);
      setCurrentUser(user);
      navigate("/");
    } catch (error) {
      setLoginFeedback({ type: "error", message: error.message });
    } finally {
      setLoginSubmitting(false);
    }
  }

  async function handleMerchantJoinSubmit(event) {
    event.preventDefault();
    setMerchantSubmitting(true);
    setMerchantFeedback(null);

    try {
      const user = await registerMerchant({
        fullName: merchantForm.fullName.trim(),
        email: merchantForm.email.trim(),
        password: merchantForm.password
      });
      storeUser(user);
      setCurrentUser(user);
      setFeedback({ type: "success", message: "入驻成功，已自动登录商户账号。" });
      navigate("/");
    } catch (error) {
      setMerchantFeedback({ type: "error", message: error.message });
    } finally {
      setMerchantSubmitting(false);
    }
  }

  function handleLogout() {
    clearStoredUser();
    setCurrentUser(null);
    setFeedback({ type: "success", message: "已退出登录。" });
  }

  function HomePage() {
    return (
      <>
        <header className="topbar">
          <Link to="/" className="brand-block brand-button">
            <div className="brand-mark">商</div>
            <div>
              <div className="brand-name">智选商城</div>
              <div className="brand-tag">商城首页与商户入驻页已拆分</div>
            </div>
          </Link>

          <div className="account-nav">
            {currentUser ? (
              <>
                <div className="account-pill">
                  {currentUser.fullName}
                  {currentUser.role === "MERCHANT" ? " · 商户" : " · 用户"}
                </div>
                <button type="button" className="nav-button secondary" onClick={handleLogout}>
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-button">
                  登录
                </Link>
                <Link to="/login?mode=register" className="nav-button">
                  注册
                </Link>
                <Link to="/merchant/join" className="nav-button secondary">
                  商户入驻
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="subnav">
          <span>首页推荐</span>
          <span>热销好物</span>
          <span>品牌商户</span>
          <span>极速履约</span>
          <span>售后保障</span>
        </div>

        <main>
          <section className="home-hero">
            <div className="home-hero-copy">
              <p className="eyebrow">Mall Homepage</p>
              <h1>重新生成的商城首页，专注商品浏览和购买决策。</h1>
              <p>商户入驻现在是独立页面，登录页也提供了明确的商户入驻入口。</p>
              <div className="hero-actions">
                <Link to="/login" className="button-like">
                  去登录
                </Link>
                <Link to="/merchant/join" className="button-like secondary">
                  商户去入驻
                </Link>
              </div>
              {feedback ? <div className={`inline-feedback ${feedback.type}`}>{feedback.message}</div> : null}
            </div>

            <div className="home-hero-stats">
              <article className="hero-card">
                <h2>{products.length}</h2>
                <p>在线商品</p>
              </article>
              <article className="hero-card">
                <h2>{Math.max(0, categoryOptions.length - 1)}</h2>
                <p>覆盖分类</p>
              </article>
              <article className="hero-card">
                <h2>{currentUser ? "已登录" : "游客"}</h2>
                <p>当前状态</p>
              </article>
              <article className="hero-card">
                <h2>{currentUser?.role === "MERCHANT" ? "商户" : "用户"}</h2>
                <p>账号角色</p>
              </article>
            </div>
          </section>

          <section className="product-section">
            <div className="section-head">
              <div>
                <h2>商品目录</h2>
                <p>商城首页仅负责展示商品。</p>
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
                    <div className="price-row">
                      <strong>{formatPrice(product.price)}</strong>
                      <span>评分 {product.rating}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </main>
      </>
    );
  }

  function LoginPage() {
    return (
      <main className="auth-page-wrap auth-login-wrap">
        <section className="auth-page-card auth-login-card">
          <div className="auth-login-layout">
            <aside className="auth-login-aside">
              <Link to="/" className="back-link">
                返回商城首页
              </Link>
              <h1>欢迎登录</h1>
              <p className="auth-intro">用户登录后可下单、查看订单和管理收货信息。</p>
              <Link to="/merchant/join" className="ghost-link">
                我是商户，去入驻
              </Link>
            </aside>

            <div className="auth-login-main">
              <div className="auth-group">
                <div className="auth-group-label">用户账号</div>
                <div className="auth-tabs">
                  <button
                    type="button"
                    className={loginMode === "login" ? "active" : ""}
                    onClick={() => {
                      setLoginMode("login");
                      setLoginFeedback(null);
                    }}
                  >
                    登录
                  </button>
                  <button
                    type="button"
                    className={loginMode === "register" ? "active" : ""}
                    onClick={() => {
                      setLoginMode("register");
                      setLoginFeedback(null);
                    }}
                  >
                    注册
                  </button>
                </div>
              </div>

              {loginFeedback ? <div className={`auth-feedback ${loginFeedback.type}`}>{loginFeedback.message}</div> : null}

              <form className="auth-form" onSubmit={handleLoginSubmit}>
                {loginMode === "register" ? (
                  <label>
                    姓名
                    <input
                      name="fullName"
                      value={loginForm.fullName}
                      onChange={(event) => setLoginForm((current) => ({ ...current, fullName: event.target.value }))}
                      placeholder="请输入姓名"
                    />
                  </label>
                ) : null}
                <label>
                  邮箱
                  <input
                    name="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="请输入邮箱"
                  />
                </label>
                <label>
                  密码
                  <input
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="请输入密码"
                  />
                </label>
                <button type="submit" disabled={loginSubmitting}>
                  {loginSubmitting ? "提交中..." : loginMode === "login" ? "立即登录" : "立即注册"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }
  function MerchantJoinPage() {
    return (
      <main className="auth-page-wrap">
        <section className="auth-page-card">
          <Link to="/login" className="back-link">
            返回登录页
          </Link>
          <h1>商户入驻</h1>
          <p className="auth-intro">商城首页与入驻流程已完全分离。</p>

          {merchantFeedback ? <div className={`auth-feedback ${merchantFeedback.type}`}>{merchantFeedback.message}</div> : null}

          <form className="auth-form" onSubmit={handleMerchantJoinSubmit}>
            <label>
              商户名称
              <input
                name="fullName"
                value={merchantForm.fullName}
                onChange={(event) => setMerchantForm((current) => ({ ...current, fullName: event.target.value }))}
                placeholder="请输入商户名称"
              />
            </label>
            <label>
              登录邮箱
              <input
                name="email"
                type="email"
                value={merchantForm.email}
                onChange={(event) => setMerchantForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="请输入邮箱"
              />
            </label>
            <label>
              登录密码
              <input
                name="password"
                type="password"
                value={merchantForm.password}
                onChange={(event) => setMerchantForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="请输入密码"
              />
            </label>
            <button type="submit" disabled={merchantSubmitting}>
              {merchantSubmitting ? "提交中..." : "提交入驻"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="page-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/merchant/join" element={<MerchantJoinPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;









