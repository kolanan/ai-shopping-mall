import { useCallback, useState } from "react";
import {
  fetchMerchantOrderStats,
  fetchMerchantOrders,
  updateMerchantOrderStatus
} from "../api/orders";

const EMPTY_STATS = {
  soldItems: 0,
  orderCount: 0,
  pendingShipmentCount: 0,
  soldAmount: 0
};

export function useMerchantOrderModule() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyOrderId, setBusyOrderId] = useState(null);

  const loadMerchantOrders = useCallback(async (merchantId) => {
    if (!merchantId) {
      setStats(EMPTY_STATS);
      setOrders([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [statsData, orderData] = await Promise.all([
        fetchMerchantOrderStats(merchantId),
        fetchMerchantOrders(merchantId)
      ]);
      setStats({
        soldItems: Number(statsData?.soldItems || 0),
        orderCount: Number(statsData?.orderCount || 0),
        pendingShipmentCount: Number(statsData?.pendingShipmentCount || 0),
        soldAmount: Number(statsData?.soldAmount || 0)
      });
      setOrders(orderData || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (merchantId, orderId, status) => {
      if (!merchantId || !orderId) {
        throw new Error("订单信息缺失，请刷新后重试。");
      }

      setBusyOrderId(orderId);
      setError("");
      try {
        await updateMerchantOrderStatus(orderId, { merchantId, status });
        await loadMerchantOrders(merchantId);
      } catch (updateError) {
        setError(updateError.message);
        throw updateError;
      } finally {
        setBusyOrderId(null);
      }
    },
    [loadMerchantOrders]
  );

  return {
    stats,
    orders,
    loading,
    error,
    busyOrderId,
    loadMerchantOrders,
    updateStatus
  };
}
