import { useCallback, useEffect, useState } from "react";
import { fetchCatalogProducts } from "../api/products";

const DEFAULT_SORT = "featured_desc";

function toQueryParams(filters) {
  const [sortBy = "featured", sortDir = "desc"] = (filters.sort || DEFAULT_SORT).split("_");
  return {
    keyword: filters.searchKeyword.trim() || undefined,
    category: filters.categoryFilter === "all" ? undefined : filters.categoryFilter,
    minPrice: filters.minPrice === "" ? undefined : filters.minPrice,
    maxPrice: filters.maxPrice === "" ? undefined : filters.maxPrice,
    inStock: filters.inStockOnly ? true : undefined,
    sortBy,
    sortDir
  };
}

export function useCatalogModule() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [categoryOptions, setCategoryOptions] = useState(["all"]);

  const loadProducts = useCallback(async (overrides = {}) => {
    const filters = {
      searchKeyword,
      categoryFilter,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
      ...overrides
    };

    setProductsLoading(true);
    setProductsError("");
    try {
      const data = await fetchCatalogProducts(toQueryParams(filters));
      setProducts(data);

      const categories = Array.from(
        new Set(
          data
            .map((item) => item.category)
            .filter(Boolean)
        )
      );
      setCategoryOptions((current) => {
        const merged = Array.from(new Set([...(current || []), ...categories])).filter(Boolean);
        return ["all", ...merged.filter((item) => item !== "all")];
      });
    } catch (error) {
      setProductsError(error.message);
    } finally {
      setProductsLoading(false);
    }
  }, [searchKeyword, categoryFilter, minPrice, maxPrice, inStockOnly, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 220);

    return () => clearTimeout(timer);
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
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    inStockOnly,
    setInStockOnly,
    sort,
    setSort,
    filteredProducts: products,
    loadProducts
  };
}
