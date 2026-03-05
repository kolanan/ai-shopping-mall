import { useCallback } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";
import "./AuthPages.css";

function MerchantJoinPage({
  merchantMode,
  onMerchantModeChange,
  merchantForm,
  onMerchantFieldChange,
  merchantSubmitting,
  merchantFeedback,
  onSubmit
}) {
  const handleFieldChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      onMerchantFieldChange(name, value);
    },
    [onMerchantFieldChange]
  );

  const isLoginMode = merchantMode === "login";

  return (
    <main className="auth-page-wrap auth-login-wrap">
      <section className="auth-page-card auth-login-card">
        <div className="auth-login-layout">
          <aside className="auth-login-aside">
            <Link to={APP_ROUTES.CATALOG} className="back-link">
              返回商城首页
            </Link>
            <h1>{isLoginMode ? "商户登录" : "商户入驻"}</h1>
            <p className="auth-intro">
              {isLoginMode ? "商户登录后进入独立管理页，维护商品与库存。" : "完成入驻后自动登录商户账号。"}
            </p>
            <Link to={APP_ROUTES.LOGIN} className="ghost-link">
              返回用户登录
            </Link>
          </aside>

          <div className="auth-login-main">
            <div className="auth-group">
              <div className="auth-group-label">商户账号</div>
              <div className="auth-tabs" role="tablist" aria-label="商户模式">
                <button
                  type="button"
                  className={isLoginMode ? "active" : ""}
                  onClick={() => onMerchantModeChange("login")}
                  aria-pressed={isLoginMode}
                >
                  商户登录
                </button>
                <button
                  type="button"
                  className={!isLoginMode ? "active" : ""}
                  onClick={() => onMerchantModeChange("register")}
                  aria-pressed={!isLoginMode}
                >
                  商户入驻
                </button>
              </div>
            </div>

            {merchantFeedback ? (
              <div className={`auth-feedback ${merchantFeedback.type}`} role="status" aria-live="polite">
                {merchantFeedback.message}
              </div>
            ) : null}

            <form className="auth-form" onSubmit={onSubmit} noValidate>
              {!isLoginMode ? (
                <label htmlFor="merchant-fullName">
                  商户名称
                  <input
                    id="merchant-fullName"
                    name="fullName"
                    value={merchantForm.fullName}
                    onChange={handleFieldChange}
                    placeholder="请输入商户名称"
                    autoComplete="organization"
                    required
                  />
                </label>
              ) : null}
              <label htmlFor="merchant-email">
                登录邮箱
                <input
                  id="merchant-email"
                  name="email"
                  type="email"
                  value={merchantForm.email}
                  onChange={handleFieldChange}
                  placeholder="请输入邮箱"
                  autoComplete="email"
                  required
                />
              </label>
              <label htmlFor="merchant-password">
                登录密码
                <input
                  id="merchant-password"
                  name="password"
                  type="password"
                  value={merchantForm.password}
                  onChange={handleFieldChange}
                  placeholder="请输入密码"
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                  required
                />
              </label>
              <button type="submit" disabled={merchantSubmitting}>
                {merchantSubmitting ? "提交中..." : isLoginMode ? "进入商户后台" : "提交入驻"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MerchantJoinPage;
