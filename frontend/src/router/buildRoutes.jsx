import { Navigate } from "react-router-dom";
import LoginPage from "../modules/auth/LoginPage";
import MerchantJoinPage from "../modules/auth/MerchantJoinPage";
import CatalogPage from "../modules/catalog/CatalogPage";
import OrdersPage from "../modules/order/OrdersPage";
import { APP_ROUTES } from "./paths";

export function buildAppRoutes({
  currentUser,
  feedback,
  catalog,
  cart,
  order,
  authForms,
  handlers
}) {
  return [
    {
      path: APP_ROUTES.CATALOG,
      element: (
        <CatalogPage
          currentUser={currentUser}
          cartTotalItems={cart.cartData.totalItems}
          onToggleCart={() => cart.setCartOpen((prev) => !prev)}
          onLogout={handlers.handleLogout}
          onOpenCart={() => cart.setCartOpen(true)}
          feedback={feedback}
          productsLoading={catalog.productsLoading}
          productsError={catalog.productsError}
          filteredProducts={catalog.filteredProducts}
          categoryOptions={catalog.categoryOptions}
          categoryFilter={catalog.categoryFilter}
          onCategoryChange={catalog.setCategoryFilter}
          searchKeyword={catalog.searchKeyword}
          onSearchChange={catalog.setSearchKeyword}
          onAddToCart={handlers.handleAddToCart}
        />
      )
    },
    {
      path: APP_ROUTES.ORDERS,
      element: (
        <OrdersPage
          currentUser={currentUser}
          cartTotalItems={cart.cartData.totalItems}
          onToggleCart={() => cart.setCartOpen((prev) => !prev)}
          onLogout={handlers.handleLogout}
          orders={order.orders}
          ordersLoading={order.ordersLoading}
          ordersError={order.ordersError}
          orderActionBusyId={order.orderActionBusyId}
          onRefreshOrders={() => void order.loadOrders(currentUser?.id)}
          onPayOrder={(orderId) => void handlers.handlePayOrder(orderId)}
        />
      )
    },
    {
      path: APP_ROUTES.LOGIN,
      element: (
        <LoginPage
          loginMode={authForms.loginMode}
          onLoginModeChange={handlers.handleLoginModeChange}
          loginForm={authForms.loginForm}
          onLoginFieldChange={authForms.updateLoginField}
          loginSubmitting={authForms.loginSubmitting}
          loginFeedback={authForms.loginFeedback}
          onSubmit={handlers.handleLoginSubmit}
        />
      )
    },
    {
      path: APP_ROUTES.MERCHANT_JOIN,
      element: (
        <MerchantJoinPage
          merchantForm={authForms.merchantForm}
          onMerchantFieldChange={authForms.updateMerchantField}
          merchantSubmitting={authForms.merchantSubmitting}
          merchantFeedback={authForms.merchantFeedback}
          onSubmit={handlers.handleMerchantJoinSubmit}
        />
      )
    },
    {
      path: "*",
      element: <Navigate to={APP_ROUTES.CATALOG} replace />
    }
  ];
}
