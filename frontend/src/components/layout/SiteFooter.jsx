import { memo } from "react";
import "./SiteFooter.css";

const CURRENT_YEAR = new Date().getFullYear();

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>智选商城 · 订单、购物车、商品数据实时同步</div>
      <div>© {CURRENT_YEAR} AI Shopping Mall</div>
    </footer>
  );
}

export default memo(SiteFooter);
