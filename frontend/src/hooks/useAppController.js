import { useEffect, useState } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { clearStoredUser, loadStoredUser, login, register, registerMerchant, storeUser } from "../api/auth";
import { createOrder } from "../api/orders";
import { useAuthFormsModule, DEFAULT_AUTH_FORM } from "./useAuthFormsModule";
import { useCartModule } from "./useCartModule";
import { useCatalogModule } from "./useCatalogModule";
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
  const authForms = useAuthFormsModule();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");

    if (location.pathname === APP_ROUTES.LOGIN) {
      authForms.setLoginMode(mode === "register" ? "register" : "login");
      authForms.setLoginForm(DEFAULT_AUTH_FORM);
      authForms.setLoginFeedback(null);
    }

    if (location.pathname === APP_ROUTES.MERCHANT_JOIN) {
      authForms.setMerchantForm(DEFAULT_AUTH_FORM);
      authForms.setMerchantFeedback(null);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!currentUser?.id) {
      cart.resetCartState();
      order.setOrders([]);
      order.setOrdersError("");
      return;
    }

    void Promise.all([cart.loadCart(currentUser.id), order.loadOrders(currentUser.id)]);
  }, [currentUser?.id]);

  function handleLogout() {
    clearStoredUser();
    setCurrentUser(null);
    setFeedback({ type: "success", message: "已退出登录。" });
  }

  async function handleAddToCart(productId) {
    if (!currentUser?.id) {
      setFeedback({ type: "error", message: "请先登录后再加入购物车。" });
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
  }

  async function handleUpdateCartQuantity(itemId, nextQuantity) {
    if (!currentUser?.id || nextQuantity < 1) {
      return;
    }

    try {
      await cart.updateQuantity(currentUser.id, itemId, nextQuantity);
    } catch {
      // error already set in cart module
    }
  }

  async function handleRemoveCartItem(itemId) {
    if (!currentUser?.id) {
      return;
    }

    try {
      await cart.removeItem(currentUser.id, itemId);
    } catch {
      // error already set in cart module
    }
  }

  async function handleCreateOrder() {
    if (!currentUser?.id) {
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
  }

  async function handlePayOrder(orderId) {
    if (!currentUser?.id) {
      return;
    }

    const error = await order.payOrder(orderId, currentUser.id);
    if (!error) {
      await catalog.loadProducts();
      setFeedback({ type: "success", message: "订单支付成功。" });
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    authForms.setLoginSubmitting(true);
    authForms.setLoginFeedback(null);

    try {
      const payload = {
        email: authForms.loginForm.email.trim(),
        password: authForms.loginForm.password
      };

      const user =
        authForms.loginMode === "login"
          ? await login(payload)
          : await register({
              fullName: authForms.loginForm.fullName.trim(),
              email: payload.email,
              password: payload.password
            });

      storeUser(user);
      setCurrentUser(user);
      setFeedback({
        type: "success",
        message: authForms.loginMode === "login" ? "登录成功。" : "注册成功，已自动登录。"
      });
      navigate(APP_ROUTES.CATALOG);
    } catch (error) {
      authForms.setLoginFeedback({ type: "error", message: error.message });
    } finally {
      authForms.setLoginSubmitting(false);
    }
  }

  async function handleMerchantJoinSubmit(event) {
    event.preventDefault();
    authForms.setMerchantSubmitting(true);
    authForms.setMerchantFeedback(null);

    try {
      const user = await registerMerchant({
        fullName: authForms.merchantForm.fullName.trim(),
        email: authForms.merchantForm.email.trim(),
        password: authForms.merchantForm.password
      });
      storeUser(user);
      setCurrentUser(user);
      setFeedback({ type: "success", message: "入驻成功，已自动登录商户账号。" });
      navigate(APP_ROUTES.CATALOG);
    } catch (error) {
      authForms.setMerchantFeedback({ type: "error", message: error.message });
    } finally {
      authForms.setMerchantSubmitting(false);
    }
  }

  const routeElement = useRoutes(
    buildAppRoutes({
      currentUser,
      feedback,
      catalog,
      cart,
      order,
      authForms,
      handlers: {
        handleLogout,
        handleAddToCart,
        handlePayOrder,
        handleLoginSubmit,
        handleMerchantJoinSubmit
      }
    })
  );

  const cartDrawerProps = {
    open: cart.cartOpen,
    currentUser,
    cartData: cart.cartData,
    cartLoading: cart.cartLoading,
    cartError: cart.cartError,
    cartBusyItemId: cart.cartBusyItemId,
    cartSubmittingOrder: cart.cartSubmittingOrder,
    onToggle: () => cart.setCartOpen((prev) => !prev),
    onClose: () => cart.setCartOpen(false),
    onRefresh: () => void cart.loadCart(currentUser?.id),
    onCreateOrder: () => void handleCreateOrder(),
    onUpdateQuantity: (itemId, quantity) => void handleUpdateCartQuantity(itemId, quantity),
    onRemoveItem: (itemId) => void handleRemoveCartItem(itemId)
  };

  return {
    routeElement,
    cartDrawerProps
  };
}
