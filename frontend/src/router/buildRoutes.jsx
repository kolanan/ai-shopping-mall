import { Navigate } from "react-router-dom";
import LoginPage from "../modules/auth/LoginPage";
import MerchantJoinPage from "../modules/auth/MerchantJoinPage";
import CatalogPage from "../modules/catalog/CatalogPage";
import ProductDetailPage from "../modules/catalog/ProductDetailPage";
import OrdersPage from "../modules/order/OrdersPage";
import MerchantHomePage from "../modules/merchant/MerchantHomePage";
import MerchantDashboardPage from "../modules/merchant/MerchantDashboardPage";
import MerchantProductCreatePage from "../modules/merchant/MerchantProductCreatePage";
import MerchantProductEditPage from "../modules/merchant/MerchantProductEditPage";
import MerchantOrdersPage from "../modules/merchant/MerchantOrdersPage";
import { APP_ROUTES } from "./paths";

export function buildAppRoutes({
  currentUser,
  feedback,
  catalog,
  cart,
  order,
  merchant,
  merchantOrder,
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
          minPrice={catalog.minPrice}
          maxPrice={catalog.maxPrice}
          inStockOnly={catalog.inStockOnly}
          sort={catalog.sort}
          onMinPriceChange={catalog.setMinPrice}
          onMaxPriceChange={catalog.setMaxPrice}
          onInStockOnlyChange={catalog.setInStockOnly}
          onSortChange={catalog.setSort}
          onReload={catalog.loadProducts}
          onAddToCart={handlers.handleAddToCart}
        />
      )
    },
    {
      path: APP_ROUTES.PRODUCT_DETAIL,
      element: (
        <ProductDetailPage
          currentUser={currentUser}
          cartTotalItems={cart.cartData.totalItems}
          onToggleCart={handlers.toggleCart}
          onLogout={handlers.handleLogout}
          products={catalog.products}
          productsLoading={catalog.productsLoading}
          productsError={catalog.productsError}
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
        <MerchantHomePage
          currentUser={currentUser}
          onLogout={handlers.handleLogout}
          merchant={merchant}
          merchantOrder={merchantOrder}
          onRefreshProducts={handlers.handleRefreshMerchantProducts}
          onRefreshOrders={handlers.handleRefreshMerchantOrders}
        />
      )
    },
    {
      path: APP_ROUTES.MERCHANT_PRODUCTS,
      element: (
        <MerchantDashboardPage
          currentUser={currentUser}
          onLogout={handlers.handleLogout}
          merchant={merchant}
          onRefresh={handlers.handleRefreshMerchantProducts}
          onStockInProduct={handlers.handleStockInMerchantProduct}
          onDeleteProduct={handlers.handleDeleteMerchantProduct}
          onChangePage={handlers.handleChangeMerchantProductPage}
        />
      )
    },
    {
      path: APP_ROUTES.MERCHANT_ORDERS,
      element: (
        <MerchantOrdersPage
          currentUser={currentUser}
          onLogout={handlers.handleLogout}
          merchantOrder={merchantOrder}
          onRefresh={handlers.handleRefreshMerchantOrders}
          onShipOrder={handlers.handleShipMerchantOrder}
          onCompleteOrder={handlers.handleCompleteMerchantOrder}
        />
      )
    },
    {
      path: APP_ROUTES.MERCHANT_PRODUCT_CREATE,
      element: (
        <MerchantProductCreatePage
          currentUser={currentUser}
          onLogout={handlers.handleLogout}
          merchant={merchant}
          onRefresh={handlers.handleRefreshMerchantProducts}
          onCreateProduct={handlers.handleCreateMerchantProduct}
          onUploadProductImage={handlers.handleUploadMerchantProductImage}
        />
      )
    },
    {
      path: APP_ROUTES.MERCHANT_PRODUCT_EDIT,
      element: (
        <MerchantProductEditPage
          currentUser={currentUser}
          onLogout={handlers.handleLogout}
          merchant={merchant}
          onUpdateProduct={handlers.handleUpdateMerchantProduct}
          onUploadProductImage={handlers.handleUploadMerchantProductImage}
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
