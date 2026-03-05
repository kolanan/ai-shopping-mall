import "./AuthPages.css";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";

function MerchantJoinPage({ merchantForm, setMerchantForm, merchantSubmitting, merchantFeedback, onSubmit }) {
  return (
    <main className="auth-page-wrap">
      <section className="auth-page-card">
        <Link to={APP_ROUTES.LOGIN} className="back-link">
          返回登录页
        </Link>
        <h1>商户入驻</h1>
        <p className="auth-intro">商城首页与入驻流程已完全分离。</p>

        {merchantFeedback ? <div className={`auth-feedback ${merchantFeedback.type}`}>{merchantFeedback.message}</div> : null}

        <form className="auth-form" onSubmit={onSubmit}>
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

export default MerchantJoinPage;



