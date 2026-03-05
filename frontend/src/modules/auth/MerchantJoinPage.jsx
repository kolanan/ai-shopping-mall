import { useCallback } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";
import "./AuthPages.css";

function MerchantJoinPage({ merchantForm, onMerchantFieldChange, merchantSubmitting, merchantFeedback, onSubmit }) {
  const handleFieldChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      onMerchantFieldChange(name, value);
    },
    [onMerchantFieldChange]
  );

  return (
    <main className="auth-page-wrap">
      <section className="auth-page-card">
        <Link to={APP_ROUTES.LOGIN} className="back-link">
          返回登录页
        </Link>
        <h1>商户入驻</h1>
        <p className="auth-intro">商城首页与入驻流程已完全分离。</p>

        {merchantFeedback ? (
          <div className={`auth-feedback ${merchantFeedback.type}`} role="status" aria-live="polite">
            {merchantFeedback.message}
          </div>
        ) : null}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
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
              autoComplete="new-password"
              required
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

export default MerchantJoinPage;
