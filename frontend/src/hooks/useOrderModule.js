import { useState } from "react";
import { fetchOrders, updateOrderStatus } from "../api/orders";

export function useOrderModule() {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderActionBusyId, setOrderActionBusyId] = useState(null);

  async function loadOrders(userId) {
    if (!userId) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await fetchOrders(userId);
      setOrders(data);
    } catch (error) {
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function payOrder(orderId, userId) {
    setOrderActionBusyId(orderId);
    setOrdersError("");
    try {
      await updateOrderStatus(orderId, { userId, status: "PAID" });
      await loadOrders(userId);
      return null;
    } catch (error) {
      setOrdersError(error.message);
      return error;
    } finally {
      setOrderActionBusyId(null);
    }
  }

  return {
    orders,
    ordersLoading,
    ordersError,
    orderActionBusyId,
    loadOrders,
    payOrder,
    setOrders,
    setOrdersError
  };
}
