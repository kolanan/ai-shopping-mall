import "./CartDrawer.css";
import { formatPrice } from "../../utils/formatters";

function CartDrawer({
  open,
  currentUser,
  cartData,
  cartLoading,
  cartError,
  cartBusyItemId,
  cartSubmittingOrder,
  onToggle,
  onClose,
  onRefresh,
  onCreateOrder,
  onUpdateQuantity,
  onRemoveItem
}) {
  if (!currentUser || currentUser.role === "MERCHANT") {
    return null;
  }

  return (
    <>
      <button type="button" className={`cart-tab ${open ? "open" : ""}`} onClick={onToggle}>
        购物车 {cartData.totalItems || 0}
      </button>

      <aside className={`cart-drawer ${open ? "open" : ""}`}>
        <div className="cart-drawer-head">
          <h3>购物车</h3>
          <button type="button" className="cart-drawer-close" onClick={onClose}>
            关闭
          </button>
        </div>

        {cartError ? <div className="checkout-feedback error">{cartError}</div> : null}
        {cartLoading ? <div className="status-panel">购物车加载中...</div> : null}

        {!cartLoading ? (
          <>
            <div className="cart-list">
              {cartData.items?.length ? (
                cartData.items.map((item) => (
                  <article key={item.id} className="cart-item">
                    <div>
                      <h3>{item.productName}</h3>
                      <p>{item.category}</p>
                    </div>
                    <div className="cart-item-meta">
                      <strong>{formatPrice(item.lineTotal)}</strong>
                      <div className="quantity-control">
                        <button
                          type="button"
                          disabled={cartBusyItemId === item.id || item.quantity <= 1}
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          disabled={cartBusyItemId === item.id}
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-button"
                        disabled={cartBusyItemId === item.id}
                        onClick={() => onRemoveItem(item.id)}
                      >
                        删除
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="status-panel">购物车为空</div>
              )}
            </div>

            <div className="cart-summary">
              <span>共 {cartData.totalItems || 0} 件商品</span>
              <strong>{formatPrice(cartData.totalAmount)}</strong>
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="checkout-button secondary-check"
                onClick={onRefresh}
                disabled={cartSubmittingOrder}
              >
                刷新
              </button>
              <button
                type="button"
                className="checkout-button"
                onClick={onCreateOrder}
                disabled={cartSubmittingOrder || !cartData.items?.length}
              >
                {cartSubmittingOrder ? "提交中..." : "创建订单"}
              </button>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

export default CartDrawer;
