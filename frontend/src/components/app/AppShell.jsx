import "../../styles/common.css";
import CartDrawer from "../../modules/cart/CartDrawer";

function AppShell({ routeElement, cartDrawerProps }) {
  return (
    <div className="page-shell">
      {routeElement}
      <CartDrawer {...cartDrawerProps} />
    </div>
  );
}

export default AppShell;

