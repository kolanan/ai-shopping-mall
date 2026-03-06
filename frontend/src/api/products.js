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

export async function fetchCatalogProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.set(key, String(value));
  });

  const url = query.toString()
    ? buildApiUrl(`/api/products/catalog?${query.toString()}`)
    : buildApiUrl("/api/products/catalog");
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("商品目录加载失败。");
  }

  return response.json();
}
