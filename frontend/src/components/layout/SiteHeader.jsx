import { memo } from "react";
import "./SiteHeader.css";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";

const SUBNAV_ITEMS = [
  { label: "首页推荐", to: `${APP_ROUTES.CATALOG}#home-recommend` },
  { label: "热销好物", to: `${APP_ROUTES.CATALOG}#hot-products` },
  { label: "品牌商户" },
  { label: "极速履约" },
  { label: "售后保障" }
];

function SiteHeader({ currentUser, cartTotalItems, onToggleCart, onLogout }) {
  const isMerchant = currentUser?.role === "MERCHANT";
  const brandTarget = isMerchant ? APP_ROUTES.MERCHANT_DASHBOARD : APP_ROUTES.CATALOG;

  return (
    <>
      <header className="topbar">
        <Link to={brandTarget} className="brand-block brand-button">
          <div className="brand-mark">商</div>
          <div>
            <div className="brand-name">智选商城</div>
            <div className="brand-tag">中文首页 · 模块化开发 · 商城场景</div>
          </div>
        </Link>

        <div className="account-nav">
          {currentUser ? (
            <>
              <div className="account-pill">
                {currentUser.fullName}
                {isMerchant ? " · 商户" : " · 用户"}
              </div>

              {isMerchant ? (
                <Link to={APP_ROUTES.MERCHANT_DASHBOARD} className="nav-button">
                  商户管理
                </Link>
              ) : (
                <>
                  <Link to={APP_ROUTES.ORDERS} className="nav-button">
                    我的订单
                  </Link>
                  <button type="button" className="nav-button" onClick={onToggleCart}>
                    购物车 {cartTotalItems || 0}
                  </button>
                </>
              )}

              <button type="button" className="nav-button secondary" onClick={onLogout}>
                退出
              </button>
            </>
          ) : (
            <>
              <Link to={APP_ROUTES.LOGIN} className="nav-button">
                登录
              </Link>
              <Link to={`${APP_ROUTES.LOGIN}?mode=register`} className="nav-button">
                注册
              </Link>
              <Link to={APP_ROUTES.MERCHANT_JOIN} className="nav-button secondary">
                商户入驻
              </Link>
            </>
          )}
        </div>
      </header>

      {!isMerchant ? (
        <div className="subnav">
          {SUBNAV_ITEMS.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="subnav-link">
                {item.label}
              </Link>
            ) : (
              <span key={item.label}>{item.label}</span>
            )
          )}
        </div>
      ) : null}
    </>
  );
}

export default memo(SiteHeader);
