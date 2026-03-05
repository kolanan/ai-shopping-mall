import "./SiteFooter.css";
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>智选商城 · 订单、购物车、商品数据实时同步</div>
      <div>© {new Date().getFullYear()} AI Shopping Mall</div>
    </footer>
  );
}

export default SiteFooter;

