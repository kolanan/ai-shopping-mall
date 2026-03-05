import { memo } from "react";
import "./SiteHeader.css";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../router/paths";

const SUBNAV_ITEMS = ["首页推荐", "热销好物", "品牌商户", "极速履约", "售后保障"];

function SiteHeader({ currentUser, cartTotalItems, onToggleCart, onLogout }) {
  return (
    <>
      <header className="topbar">
        <Link to={APP_ROUTES.CATALOG} className="brand-block brand-button">
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
                {currentUser.role === "MERCHANT" ? " · 商户" : " · 用户"}
              </div>

              {currentUser.role === "MERCHANT" ? (
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

      <div className="subnav">
        {SUBNAV_ITEMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </>
  );
}

export default memo(SiteHeader);
