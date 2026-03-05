import { Navigate } from "react-router-dom";
import LoginPage from "../modules/auth/LoginPage";
import MerchantJoinPage from "../modules/auth/MerchantJoinPage";
import CatalogPage from "../modules/catalog/CatalogPage";
import OrdersPage from "../modules/order/OrdersPage";
import MerchantDashboardPage from "../modules/merchant/MerchantDashboardPage";
import { APP_ROUTES } from "./paths";

export function buildAppRoutes({
  currentUser,
  feedback,
  catalog,
  cart,
  order,
  merchant,
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
          onToggleCart={handlers.toggleCart}
          onLogout={handlers.handleLogout}
          onOpenCart={handlers.openCart}
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
          onToggleCart={handlers.toggleCart}
          onLogout={handlers.handleLogout}
          orders={order.orders}
          ordersLoading={order.ordersLoading}
          ordersError={order.ordersError}
          orderActionBusyId={order.orderActionBusyId}
          onRefreshOrders={handlers.handleRefreshOrders}
          onPayOrder={handlers.handlePayOrder}
        />
      )
    },
    {
      path: APP_ROUTES.MERCHANT_DASHBOARD,
      element: (
        <MerchantDashboardPage
          currentUser={currentUser}
          onLogout={handlers.handleLogout}
          merchant={merchant}
          onRefresh={handlers.handleRefreshMerchantProducts}
          onCreateProduct={handlers.handleCreateMerchantProduct}
          onStockInProduct={handlers.handleStockInMerchantProduct}
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
          merchantMode={authForms.merchantMode}
          onMerchantModeChange={handlers.handleMerchantModeChange}
          merchantForm={authForms.merchantForm}
          onMerchantFieldChange={authForms.updateMerchantField}
          merchantSubmitting={authForms.merchantSubmitting}
          merchantFeedback={authForms.merchantFeedback}
          onSubmit={handlers.handleMerchantSubmit}
        />
      )
    },
    {
      path: "*",
      element: <Navigate to={APP_ROUTES.CATALOG} replace />
    }
  ];
}
