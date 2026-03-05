import { useCallback, useState } from "react";
import { addCartItem, fetchCart, removeCartItem, updateCartItem } from "../api/cart";

const EMPTY_CART = { totalItems: 0, totalAmount: 0, items: [] };

function createEmptyCart() {
  return { ...EMPTY_CART, items: [] };
}

export function useCartModule() {
  const [cartData, setCartData] = useState(createEmptyCart);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartBusyItemId, setCartBusyItemId] = useState(null);
  const [cartSubmittingOrder, setCartSubmittingOrder] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const loadCart = useCallback(async (userId) => {
    if (!userId) {
      setCartData(createEmptyCart());
      return;
    }

    setCartLoading(true);
    setCartError("");
    try {
      const data = await fetchCart(userId);
      setCartData(data);
    } catch (error) {
      setCartError(error.message);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (userId, productId) => {
    const data = await addCartItem({ userId, productId, quantity: 1 });
    setCartData(data);
    setCartOpen(true);
  }, []);

  const updateQuantity = useCallback(async (userId, itemId, nextQuantity) => {
    setCartBusyItemId(itemId);
    setCartError("");
    try {
      const data = await updateCartItem(itemId, { userId, quantity: nextQuantity });
      setCartData(data);
    } catch (error) {
      setCartError(error.message);
      throw error;
    } finally {
      setCartBusyItemId(null);
    }
  }, []);

  const removeItem = useCallback(async (userId, itemId) => {
    setCartBusyItemId(itemId);
    setCartError("");
    try {
      const data = await removeCartItem(itemId, userId);
      setCartData(data);
    } catch (error) {
      setCartError(error.message);
      throw error;
    } finally {
      setCartBusyItemId(null);
    }
  }, []);

  const resetCartState = useCallback(() => {
    setCartData(createEmptyCart());
    setCartError("");
    setCartOpen(false);
  }, []);

  return {
    cartData,
    cartLoading,
    cartBusyItemId,
    cartSubmittingOrder,
    setCartSubmittingOrder,
    cartError,
    setCartError,
    cartOpen,
    setCartOpen,
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    resetCartState
  };
}
