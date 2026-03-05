import "./AuthPages.css";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";

function LoginPage({
  loginMode,
  setLoginMode,
  loginForm,
  setLoginForm,
  loginSubmitting,
  loginFeedback,
  onSubmit
}) {
  return (
    <main className="auth-page-wrap auth-login-wrap">
      <section className="auth-page-card auth-login-card">
        <div className="auth-login-layout">
          <aside className="auth-login-aside">
            <Link to={APP_ROUTES.CATALOG} className="back-link">
              返回商城首页
            </Link>
            <h1>欢迎登录</h1>
            <p className="auth-intro">用户登录后可下单、查看订单和管理收货信息。</p>
            <Link to={APP_ROUTES.MERCHANT_JOIN} className="ghost-link">
              我是商户，去入驻
            </Link>
          </aside>

          <div className="auth-login-main">
            <div className="auth-group">
              <div className="auth-group-label">用户账号</div>
              <div className="auth-tabs">
                <button type="button" className={loginMode === "login" ? "active" : ""} onClick={() => setLoginMode("login")}>
                  登录
                </button>
                <button
                  type="button"
                  className={loginMode === "register" ? "active" : ""}
                  onClick={() => setLoginMode("register")}
                >
                  注册
                </button>
              </div>
            </div>

            {loginFeedback ? <div className={`auth-feedback ${loginFeedback.type}`}>{loginFeedback.message}</div> : null}

            <form className="auth-form" onSubmit={onSubmit}>
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

export default LoginPage;



