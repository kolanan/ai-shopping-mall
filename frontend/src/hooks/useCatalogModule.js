import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFeaturedProducts } from "../api/products";

export function useCatalogModule() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryOptions = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      if (product.category && !map.has(product.category)) {
        map.set(product.category, product.category);
      }
    });
    return ["all", ...map.keys()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchKeyword =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        (product.merchantName || "").toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [products, categoryFilter, searchKeyword]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const data = await fetchFeaturedProducts();
      setProducts(data);
    } catch (error) {
      setProductsError(error.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return {
    products,
    productsLoading,
    productsError,
    searchKeyword,
    setSearchKeyword,
    categoryFilter,
    setCategoryFilter,
    categoryOptions,
    filteredProducts,
    loadProducts
  };
}
