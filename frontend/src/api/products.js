export async function fetchFeaturedProducts() {
  const response = await fetch("/api/products/featured");

  if (!response.ok) {
    throw new Error("精选商品加载失败。");
  }

  return response.json();
}

export async function fetchCatalogProducts() {
  const response = await fetch("/api/products/catalog");

  if (!response.ok) {
    throw new Error("商品目录加载失败。");
  }

  return response.json();
}
