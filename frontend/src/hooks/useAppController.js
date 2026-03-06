import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import {
  clearStoredUser,
  loadStoredUser,
  login,
  merchantLogin,
  register,
  registerMerchant,
  storeUser
} from "../api/auth";
import { createOrder } from "../api/orders";
import { useAuthFormsModule } from "./useAuthFormsModule";
import { useCartModule } from "./useCartModule";
import { useCatalogModule } from "./useCatalogModule";
import { useMerchantModule } from "./useMerchantModule";
import { useMerchantOrderModule } from "./useMerchantOrderModule";
import { useOrderModule } from "./useOrderModule";
import { buildAppRoutes } from "../router/buildRoutes";
import { APP_ROUTES } from "../router/paths";

export function useAppController() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(() => loadStoredUser());
  const [feedback, setFeedback] = useState(null);

  const catalog = useCatalogModule();
  const cart = useCartModule();
  const order = useOrderModule();
  const merchant = useMerchantModule();
  const merchantOrder = useMerchantOrderModule();
  const authForms = useAuthFormsModule();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");

    if (location.pathname === APP_ROUTES.LOGIN) {
      const loginMode = mode === "register" ? "register" : "login";
      authForms.setLoginMode(loginMode);
      authForms.resetLoginForm({ useRemembered: loginMode === "login" });
      authForms.setLoginFeedback(null);
    }

    if (location.pathname === APP_ROUTES.MERCHANT_JOIN) {
      const merchantMode = mode === "login" ? "login" : "register";
      authForms.setMerchantMode(merchantMode);
      authForms.resetMerchantForm({ useRemembered: merchantMode === "login" });
      authForms.setMerchantFeedback(null);
    }
  }, [
    location.pathname,
    location.search,
    authForms.resetLoginForm,
    authForms.resetMerchantForm,
    authForms.setLoginFeedback,
    authForms.setLoginMode,
    authForms.setMerchantFeedback,
    authForms.setMerchantMode
  ]);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    if (!targetId) {
      return;
    }

    // Wait for routed content to render, then scroll to anchor target.
    const timer = setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!currentUser?.id) {
      cart.resetCartState();
      order.setOrders([]);
      order.setOrdersError("");
      return;
    }

    if (currentUser.role === "MERCHANT") {
      cart.resetCartState();
      order.setOrders([]);
      order.setOrdersError("");
      void Promise.all([merchant.loadDashboard(currentUser.id), merchantOrder.loadMerchantOrders(currentUser.id)]);
      return;
    }

    void Promise.all([cart.loadCart(currentUser.id), order.loadOrders(currentUser.id)]);
  }, [
    currentUser?.id,
    currentUser?.role,
    cart.loadCart,
    cart.resetCartState,
    order.loadOrders,
    order.setOrders,
    order.setOrdersError,
    merchant.loadDashboard,
    merchantOrder.loadMerchantOrders
  ]);

  const toggleCart = useCallback(() => {
    if (currentUser?.role === "MERCHANT") {
      return;
    }
    cart.setCartOpen((prev) => !prev);
  }, [cart.setCartOpen, currentUser?.role]);

  const openCart = useCallback(() => {
    if (currentUser?.role === "MERCHANT") {
      return;
    }
    cart.setCartOpen(true);
  }, [cart.setCartOpen, currentUser?.role]);

  const closeCart = useCallback(() => {
    cart.setCartOpen(false);
  }, [cart.setCartOpen]);

  const handleLogout = useCallback(() => {
    clearStoredUser();
    setCurrentUser(null);
    setFeedback({ type: "success", message: "已退出登录。" });
    navigate(APP_ROUTES.CATALOG);
  }, [navigate]);

  const handleAddToCart = useCallback(
    async (productId) => {
      if (!currentUser?.id || currentUser.role === "MERCHANT") {
        setFeedback({ type: "error", message: "请使用用户账号登录后再加入购物车。" });
        navigate(APP_ROUTES.LOGIN);
        return;
      }

      setFeedback(null);
      try {
        await cart.addToCart(currentUser.id, productId);
        setFeedback({ type: "success", message: "已加入购物车。" });
      } catch (error) {
        setFeedback({ type: "error", message: error.message });
      }
    },
    [cart.addToCart, currentUser?.id, currentUser?.role, navigate]
  );

  const handleUpdateCartQuantity = useCallback(
    async (itemId, nextQuantity) => {
      if (!currentUser?.id || currentUser.role === "MERCHANT" || nextQuantity < 1) {
        return;
      }

      try {
        await cart.updateQuantity(currentUser.id, itemId, nextQuantity);
      } catch {
        // error already set in cart module
      }
    },
    [cart.updateQuantity, currentUser?.id, currentUser?.role]
  );

  const handleRemoveCartItem = useCallback(
    async (itemId) => {
      if (!currentUser?.id || currentUser.role === "MERCHANT") {
        return;
      }

      try {
        await cart.removeItem(currentUser.id, itemId);
      } catch {
        // error already set in cart module
      }
    },
    [cart.removeItem, currentUser?.id, currentUser?.role]
  );

  const handleCreateOrder = useCallback(async () => {
    if (!currentUser?.id || currentUser.role === "MERCHANT") {
      return;
    }

    cart.setCartSubmittingOrder(true);
    cart.setCartError("");
    try {
      await createOrder({ userId: currentUser.id });
      setFeedback({ type: "success", message: "订单创建成功。" });
      await Promise.all([cart.loadCart(currentUser.id), order.loadOrders(currentUser.id), catalog.loadProducts()]);
      navigate(APP_ROUTES.ORDERS);
    } catch (error) {
      cart.setCartError(error.message);
    } finally {
      cart.setCartSubmittingOrder(false);
    }
  }, [
    currentUser?.id,
    currentUser?.role,
    cart.setCartSubmittingOrder,
    cart.setCartError,
    cart.loadCart,
    order.loadOrders,
    catalog.loadProducts,
    navigate
  ]);

  const handleRefreshOrders = useCallback(() => {
    if (currentUser?.role === "MERCHANT") {
      return;
    }
    void order.loadOrders(currentUser?.id);
  }, [order.loadOrders, currentUser?.id, currentUser?.role]);

  const handlePayOrder = useCallback(
    async (orderId) => {
      if (!currentUser?.id || currentUser.role === "MERCHANT") {
        return;
      }

      const error = await order.payOrder(orderId, currentUser.id);
      if (!error) {
        await catalog.loadProducts();
        setFeedback({ type: "success", message: "订单支付成功。" });
      }
    },
    [currentUser?.id, currentUser?.role, order.payOrder, catalog.loadProducts]
  );

  const handleRefreshMerchantProducts = useCallback(() => {
    if (currentUser?.role !== "MERCHANT") {
      return;
    }
    void merchant.refreshProducts(currentUser.id);
  }, [merchant.refreshProducts, currentUser?.id, currentUser?.role]);

  const handleChangeMerchantProductPage = useCallback(
    (page) => {
      if (currentUser?.role !== "MERCHANT") {
        return;
      }
      void merchant.refreshProducts(currentUser.id, page);
    },
    [merchant.refreshProducts, currentUser?.id, currentUser?.role]
  );

  const handleCreateMerchantProduct = useCallback(async () => {
    if (currentUser?.role !== "MERCHANT") {
      return;
    }

    try {
      await merchant.createProduct(currentUser.id);
      setFeedback({ type: "success", message: "商品创建成功。" });
      navigate(APP_ROUTES.MERCHANT_PRODUCTS);
    } catch {
      // merchant module already set error
    }
  }, [merchant.createProduct, currentUser?.id, currentUser?.role, navigate]);

  const handleUploadMerchantProductImage = useCallback(
    async (file) => {
      if (currentUser?.role !== "MERCHANT") {
        return;
      }

      try {
        const imageUrl = await merchant.uploadProductImage(currentUser.id, file);
        setFeedback({ type: "success", message: "图片上传成功。" });
        return imageUrl;
      } catch {
        // merchant module already set error
        return undefined;
      }
    },
    [merchant.uploadProductImage, currentUser?.id, currentUser?.role]
  );

  const handleUpdateMerchantProduct = useCallback(
    async (productId, form) => {
      if (currentUser?.role !== "MERCHANT") {
        return false;
      }

      try {
        await merchant.updateProduct(currentUser.id, productId, form);
        setFeedback({ type: "success", message: "商品更新成功。" });
        return true;
      } catch {
        // merchant module already set error
        return false;
      }
    },
    [merchant.updateProduct, currentUser?.id, currentUser?.role]
  );

  const handleStockInMerchantProduct = useCallback(
    async (productId, quantity) => {
      if (currentUser?.role !== "MERCHANT") {
        return;
      }

      try {
        await merchant.stockInProduct(currentUser.id, productId, quantity);
        setFeedback({ type: "success", message: "入库成功。" });
      } catch {
        // merchant module already set error
      }
    },
    [merchant.stockInProduct, currentUser?.id, currentUser?.role]
  );

  const handleDeleteMerchantProduct = useCallback(
    async (productId) => {
      if (currentUser?.role !== "MERCHANT") {
        return;
      }

      try {
        await merchant.deleteProduct(currentUser.id, productId);
        setFeedback({ type: "success", message: "商品删除成功。" });
      } catch {
        // merchant module already set error
      }
    },
    [merchant.deleteProduct, currentUser?.id, currentUser?.role]
  );

  const handleRefreshMerchantOrders = useCallback(() => {
    if (currentUser?.role !== "MERCHANT") {
      return;
    }
    void merchantOrder.loadMerchantOrders(currentUser.id);
  }, [merchantOrder.loadMerchantOrders, currentUser?.id, currentUser?.role]);

  const handleShipMerchantOrder = useCallback(
    async (orderId) => {
      if (currentUser?.role !== "MERCHANT") {
        return;
      }
      try {
        await merchantOrder.updateStatus(currentUser.id, orderId, "SHIPPED");
        setFeedback({ type: "success", message: "订单已标记为已发货。" });
      } catch {
        // merchant order module already set error
      }
    },
    [merchantOrder.updateStatus, currentUser?.id, currentUser?.role]
  );

  const handleCompleteMerchantOrder = useCallback(
    async (orderId) => {
      if (currentUser?.role !== "MERCHANT") {
        return;
      }
      try {
        await merchantOrder.updateStatus(currentUser.id, orderId, "COMPLETED");
        setFeedback({ type: "success", message: "订单已标记为已完成。" });
      } catch {
        // merchant order module already set error
      }
    },
    [merchantOrder.updateStatus, currentUser?.id, currentUser?.role]
  );

  const handleLoginModeChange = useCallback(
    (mode) => {
      authForms.setLoginMode(mode);
      authForms.setLoginFeedback(null);
    },
    [authForms.setLoginMode, authForms.setLoginFeedback]
  );

  const handleMerchantModeChange = useCallback(
    (mode) => {
      authForms.setMerchantMode(mode);
      authForms.setMerchantFeedback(null);
    },
    [authForms.setMerchantMode, authForms.setMerchantFeedback]
  );

  const handleLoginSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (authForms.loginSubmitting) {
        return;
      }

      authForms.setLoginSubmitting(true);
      authForms.setLoginFeedback(null);

      try {
        const email = authForms.loginForm.email.trim();
        const password = authForms.loginForm.password;
        const fullName = authForms.loginForm.fullName.trim();
        const rememberPassword = Boolean(authForms.loginForm.rememberPassword);

        if (!email || !password || (authForms.loginMode === "register" && !fullName)) {
          throw new Error("请完整填写表单信息。");
        }

        const user =
          authForms.loginMode === "register"
            ? await register({
                fullName,
                email,
                password
              })
            : await login({ email, password });

        if (authForms.loginMode === "login") {
          authForms.persistRememberedLogin(email, password, rememberPassword);
        }

        storeUser(user);
        setCurrentUser(user);
        authForms.resetLoginForm({ useRemembered: true });
        setFeedback({
          type: "success",
          message: authForms.loginMode === "register" ? "注册成功，已自动登录。" : "登录成功。"
        });

        if (user.role === "MERCHANT") {
          navigate(APP_ROUTES.MERCHANT_DASHBOARD);
        } else {
          navigate(APP_ROUTES.CATALOG);
        }
      } catch (error) {
        authForms.setLoginFeedback({ type: "error", message: error.message });
      } finally {
        authForms.setLoginSubmitting(false);
      }
    },
    [
      authForms.loginSubmitting,
      authForms.setLoginSubmitting,
      authForms.setLoginFeedback,
      authForms.loginForm,
      authForms.loginMode,
      authForms.persistRememberedLogin,
      authForms.resetLoginForm,
      navigate
    ]
  );

  const handleMerchantSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (authForms.merchantSubmitting) {
        return;
      }

      authForms.setMerchantSubmitting(true);
      authForms.setMerchantFeedback(null);

      try {
        const fullName = authForms.merchantForm.fullName.trim();
        const email = authForms.merchantForm.email.trim();
        const password = authForms.merchantForm.password;
        const rememberPassword = Boolean(authForms.merchantForm.rememberPassword);

        if (!email || !password || (authForms.merchantMode === "register" && !fullName)) {
          throw new Error("请完整填写表单信息。");
        }

        const user =
          authForms.merchantMode === "login"
            ? await merchantLogin({ email, password })
            : await registerMerchant({
                fullName,
                email,
                password
              });

        if (user.role !== "MERCHANT") {
          throw new Error("当前账号不是商户账号。");
        }

        if (authForms.merchantMode === "login") {
          authForms.persistRememberedMerchantLogin(email, password, rememberPassword);
        }

        storeUser(user);
        setCurrentUser(user);
        authForms.resetMerchantForm({ useRemembered: authForms.merchantMode === "login" });
        setFeedback({
          type: "success",
          message: authForms.merchantMode === "login" ? "商户登录成功。" : "入驻成功，已自动登录商户账号。"
        });
        navigate(APP_ROUTES.MERCHANT_DASHBOARD);
      } catch (error) {
        authForms.setMerchantFeedback({ type: "error", message: error.message });
      } finally {
        authForms.setMerchantSubmitting(false);
      }
    },
    [
      authForms.merchantSubmitting,
      authForms.setMerchantSubmitting,
      authForms.setMerchantFeedback,
      authForms.merchantForm,
      authForms.merchantMode,
      authForms.persistRememberedMerchantLogin,
      authForms.resetMerchantForm,
      navigate
    ]
  );

  const handlers = useMemo(
    () => ({
      toggleCart,
      openCart,
      handleLogout,
      handleAddToCart,
      handleRefreshOrders,
      handlePayOrder,
      handleRefreshMerchantProducts,
      handleChangeMerchantProductPage,
      handleCreateMerchantProduct,
      handleUpdateMerchantProduct,
      handleUploadMerchantProductImage,
      handleStockInMerchantProduct,
      handleDeleteMerchantProduct,
      handleRefreshMerchantOrders,
      handleShipMerchantOrder,
      handleCompleteMerchantOrder,
      handleLoginModeChange,
      handleMerchantModeChange,
      handleLoginSubmit,
      handleMerchantSubmit
    }),
    [
      toggleCart,
      openCart,
      handleLogout,
      handleAddToCart,
      handleRefreshOrders,
      handlePayOrder,
      handleRefreshMerchantProducts,
      handleChangeMerchantProductPage,
      handleCreateMerchantProduct,
      handleUpdateMerchantProduct,
      handleUploadMerchantProductImage,
      handleStockInMerchantProduct,
      handleDeleteMerchantProduct,
      handleRefreshMerchantOrders,
      handleShipMerchantOrder,
      handleCompleteMerchantOrder,
      handleLoginModeChange,
      handleMerchantModeChange,
      handleLoginSubmit,
      handleMerchantSubmit
    ]
  );

  const routeElement = useRoutes(
    buildAppRoutes({
      currentUser,
      feedback,
      catalog,
      cart,
      order,
      merchant,
      merchantOrder,
      authForms,
      handlers
    })
  );

  const cartDrawerProps = useMemo(
    () => ({
      open: cart.cartOpen,
      currentUser,
      cartData: cart.cartData,
      cartLoading: cart.cartLoading,
      cartError: cart.cartError,
      cartBusyItemId: cart.cartBusyItemId,
      cartSubmittingOrder: cart.cartSubmittingOrder,
      onToggle: toggleCart,
      onClose: closeCart,
      onRefresh: () => void cart.loadCart(currentUser?.id),
      onCreateOrder: () => void handleCreateOrder(),
      onUpdateQuantity: (itemId, quantity) => void handleUpdateCartQuantity(itemId, quantity),
      onRemoveItem: (itemId) => void handleRemoveCartItem(itemId)
    }),
    [
      cart.cartOpen,
      currentUser,
      cart.cartData,
      cart.cartLoading,
      cart.cartError,
      cart.cartBusyItemId,
      cart.cartSubmittingOrder,
      toggleCart,
      closeCart,
      cart.loadCart,
      handleCreateOrder,
      handleUpdateCartQuantity,
      handleRemoveCartItem
    ]
  );

  return {
    routeElement,
    cartDrawerProps
  };
}



