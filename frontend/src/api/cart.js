export async function fetchCart(userId) {
  const response = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "购物车加载失败。");
  }

  return data;
}

export async function addCartItem(payload) {
  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "加入购物车失败。");
  }

  return data;
}

export async function updateCartItem(itemId, payload) {
  const response = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "更新购物车失败。");
  }

  return data;
}

export async function removeCartItem(itemId, userId) {
  const response = await fetch(
    `/api/cart/items/${encodeURIComponent(itemId)}?userId=${encodeURIComponent(userId)}`,
    {
      method: "DELETE"
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "删除购物车商品失败。");
  }

  return data;
}

export async function validateCartCheckout(userId) {
  const response = await fetch(`/api/cart/checkout/validate?userId=${encodeURIComponent(userId)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "结算校验失败。");
  }

  return data;
}
