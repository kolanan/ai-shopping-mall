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
