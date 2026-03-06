export async function createOrder(payload) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "提交订单失败。");
  }

  return data;
}

export async function fetchOrders(userId) {
  const response = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
  const data = await response.json().catch(() => ([]));

  if (!response.ok) {
    throw new Error(data.message || "订单加载失败。");
  }

  return data;
}

export async function updateOrderStatus(orderId, payload) {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "订单状态更新失败。");
  }

  return data;
}

export async function fetchMerchantOrderStats(merchantId) {
  const response = await fetch(`/api/orders/merchant/stats?merchantId=${encodeURIComponent(merchantId)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "商户订单统计加载失败。");
  }

  return data;
}

export async function fetchMerchantOrders(merchantId) {
  const response = await fetch(`/api/orders/merchant?merchantId=${encodeURIComponent(merchantId)}`);
  const data = await response.json().catch(() => ([]));

  if (!response.ok) {
    throw new Error(data.message || "商户订单列表加载失败。");
  }

  return data;
}

export async function updateMerchantOrderStatus(orderId, payload) {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/merchant-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "商户更新订单状态失败。");
  }

  return data;
}
