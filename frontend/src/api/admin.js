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
  return parseResponse(response, "商户商品加载失败。");
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

export async function uploadMerchantProductImage(merchantId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/admin/uploads/product-image?merchantId=${encodeURIComponent(merchantId)}`, {
    method: "POST",
    body: formData
  });
  return parseResponse(response, "商品图片上传失败。");
}
