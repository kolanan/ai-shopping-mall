import { useState } from "react";
import { addCartItem, fetchCart, removeCartItem, updateCartItem } from "../api/cart";

const EMPTY_CART = { totalItems: 0, totalAmount: 0, items: [] };

export function useCartModule() {
  const [cartData, setCartData] = useState(EMPTY_CART);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartBusyItemId, setCartBusyItemId] = useState(null);
  const [cartSubmittingOrder, setCartSubmittingOrder] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  async function loadCart(userId) {
    if (!userId) {
      setCartData(EMPTY_CART);
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
  }

  async function addToCart(userId, productId) {
    const data = await addCartItem({ userId, productId, quantity: 1 });
    setCartData(data);
    setCartOpen(true);
  }

  async function updateQuantity(userId, itemId, nextQuantity) {
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
  }

  async function removeItem(userId, itemId) {
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
  }

  function resetCartState() {
    setCartData(EMPTY_CART);
    setCartError("");
    setCartOpen(false);
  }

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
