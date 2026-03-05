async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export async function fetchAdminCategories() {
  const response = await fetch("/api/admin/categories");
  return parseResponse(response, "商品分类加载失败。");
}

export async function fetchMerchantProducts(merchantId) {
  const response = await fetch(`/api/admin/products?merchantId=${encodeURIComponent(merchantId)}`);
  const data = await parseResponse(response, "商户商品加载失败。");
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      size: data.length || 10,
      totalPages: 1
    };
  }
  return data;
}

export async function fetchMerchantProductPage(merchantId, page = 1, size = 10) {
  const query = new URLSearchParams({
    merchantId: String(merchantId),
    current: String(page),
    size: String(size)
  });
  const response = await fetch(`/api/admin/products?${query.toString()}`);
  const data = await parseResponse(response, "商户商品加载失败。");
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      size,
      totalPages: 1
    };
  }
  return data;
}

export async function createMerchantProduct(payload) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseResponse(response, "商品创建失败。");
}

export async function updateMerchantProduct(productId, payload) {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseResponse(response, "商品更新失败。");
}

export async function stockInMerchantProduct(productId, payload) {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/stock-in`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  return parseResponse(response, "商品入库失败。");
}

export async function uploadMerchantProductImage(merchantId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/admin/uploads/product-image?merchantId=${encodeURIComponent(merchantId)}`, {
    method: "POST",
    body: formData
  });
  return parseResponse(response, "商品图片上传失败。");
}
