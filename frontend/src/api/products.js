const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function fetchFeaturedProducts() {
  const response = await fetch(buildApiUrl("/api/products/featured"));

  if (!response.ok) {
    throw new Error("精选商品加载失败。");
  }

  return response.json();
}

export async function fetchCatalogProducts() {
  const response = await fetch(buildApiUrl("/api/products/catalog"));

  if (!response.ok) {
    throw new Error("商品目录加载失败。");
  }

  return response.json();
}
