import { useCallback } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";
import "./AuthPages.css";

function LoginPage({
  loginMode,
  onLoginModeChange,
  loginForm,
  onLoginFieldChange,
  loginSubmitting,
  loginFeedback,
  onSubmit
}) {
  const handleFieldChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      onLoginFieldChange(name, value);
    },
    [onLoginFieldChange]
  );

  const isRegisterMode = loginMode === "register";

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
            <Link to={`${APP_ROUTES.MERCHANT_JOIN}?mode=login`} className="ghost-link">
              商户登录 / 入驻
            </Link>
          </aside>

          <div className="auth-login-main">
            <div className="auth-group">
              <div className="auth-group-label">用户账号</div>
              <div className="auth-tabs" role="tablist" aria-label="登录模式">
                <button
                  type="button"
                  className={loginMode === "login" ? "active" : ""}
                  onClick={() => onLoginModeChange("login")}
                  aria-pressed={loginMode === "login"}
                >
                  用户登录
                </button>
                <button
                  type="button"
                  className={loginMode === "register" ? "active" : ""}
                  onClick={() => onLoginModeChange("register")}
                  aria-pressed={loginMode === "register"}
                >
                  用户注册
                </button>
              </div>
            </div>

            {loginFeedback ? (
              <div className={`auth-feedback ${loginFeedback.type}`} role="status" aria-live="polite">
                {loginFeedback.message}
              </div>
            ) : null}

            <form className="auth-form" onSubmit={onSubmit} noValidate>
              {isRegisterMode ? (
                <label htmlFor="login-fullName">
                  姓名
                  <input
                    id="login-fullName"
                    name="fullName"
                    value={loginForm.fullName}
                    onChange={handleFieldChange}
                    placeholder="请输入姓名"
                    autoComplete="name"
                    required
                  />
                </label>
              ) : null}
              <label htmlFor="login-email">
                邮箱
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleFieldChange}
                  placeholder="请输入邮箱"
                  autoComplete="email"
                  required
                />
              </label>
              <label htmlFor="login-password">
                密码
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleFieldChange}
                  placeholder="请输入密码"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                />
              </label>
              <button type="submit" disabled={loginSubmitting}>
                {loginSubmitting ? "提交中..." : isRegisterMode ? "立即注册" : "立即登录"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
