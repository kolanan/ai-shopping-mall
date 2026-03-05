import { useCallback, useMemo, useState } from "react";
import {
  createMerchantProduct,
  fetchAdminCategories,
  fetchMerchantProducts,
  stockInMerchantProduct
} from "../api/admin";

const DEFAULT_PRODUCT_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  rating: "4.5",
  badge: "",
  imageUrl: "",
  categorySlug: "",
  stockQuantity: "0",
  displayOrder: "1",
  active: true,
  featured: false
};

function createDefaultProductForm() {
  return { ...DEFAULT_PRODUCT_FORM };
}

export function useMerchantModule() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [stockingProductId, setStockingProductId] = useState(null);
  const [productForm, setProductForm] = useState(createDefaultProductForm);

  const loadDashboard = useCallback(async (merchantId) => {
    if (!merchantId) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [categoryData, productData] = await Promise.all([
        fetchAdminCategories(),
        fetchMerchantProducts(merchantId)
      ]);
      setCategories(categoryData);
      setProducts(productData);
      setProductForm((current) => {
        if (current.categorySlug || !categoryData.length) {
          return current;
        }
        return {
          ...current,
          categorySlug: categoryData[0].slug
        };
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async (merchantId) => {
    if (!merchantId) {
      return;
    }

    setError("");
    try {
      const productData = await fetchMerchantProducts(merchantId);
      setProducts(productData);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  const updateProductFormField = useCallback((field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  }, []);

  const resetProductForm = useCallback(() => {
    setProductForm(createDefaultProductForm());
  }, []);

  const createProduct = useCallback(
    async (merchantId) => {
      if (!merchantId) {
        throw new Error("商户信息缺失，请重新登录。");
      }

      setCreateSubmitting(true);
      setError("");
      try {
        const payload = {
          merchantId,
          name: productForm.name.trim(),
          slug: productForm.slug.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price),
          rating: Number(productForm.rating),
          badge: productForm.badge.trim() || null,
          imageUrl: productForm.imageUrl.trim() || null,
          categorySlug: productForm.categorySlug,
          stockQuantity: Number(productForm.stockQuantity),
          displayOrder: Number(productForm.displayOrder),
          active: Boolean(productForm.active),
          featured: Boolean(productForm.featured)
        };

        if (!payload.name || !payload.slug || !payload.description || !payload.categorySlug) {
          throw new Error("请完整填写商品基础信息。");
        }

        if (!Number.isFinite(payload.price) || payload.price <= 0) {
          throw new Error("请输入有效售价。");
        }

        if (!Number.isFinite(payload.rating) || payload.rating < 0 || payload.rating > 5) {
          throw new Error("评分范围应在 0 到 5 之间。");
        }

        if (!Number.isInteger(payload.stockQuantity) || payload.stockQuantity < 0) {
          throw new Error("库存必须是大于等于 0 的整数。");
        }

        if (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 1) {
          throw new Error("展示顺序至少为 1。");
        }

        const created = await createMerchantProduct(payload);
        setProducts((current) => [created, ...current]);
        setProductForm((current) => ({
          ...createDefaultProductForm(),
          categorySlug: current.categorySlug || payload.categorySlug
        }));
        return created;
      } catch (createError) {
        setError(createError.message);
        throw createError;
      } finally {
        setCreateSubmitting(false);
      }
    },
    [productForm]
  );

  const stockInProduct = useCallback(async (merchantId, productId, quantity) => {
    if (!merchantId || !productId) {
      throw new Error("商品信息缺失，请刷新后重试。");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("入库数量必须为正整数。");
    }

    setStockingProductId(productId);
    setError("");
    try {
      const updated = await stockInMerchantProduct(productId, { merchantId, quantity });
      setProducts((current) =>
        current.map((product) => (product.id === updated.id ? updated : product))
      );
      return updated;
    } catch (stockError) {
      setError(stockError.message);
      throw stockError;
    } finally {
      setStockingProductId(null);
    }
  }, []);

  const categoryOptions = useMemo(() => categories || [], [categories]);

  return {
    categories: categoryOptions,
    products,
    loading,
    error,
    createSubmitting,
    stockingProductId,
    productForm,
    loadDashboard,
    refreshProducts,
    updateProductFormField,
    resetProductForm,
    createProduct,
    stockInProduct
  };
}
