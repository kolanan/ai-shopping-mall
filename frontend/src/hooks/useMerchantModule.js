import { useCallback, useMemo, useState } from "react";
import {
  createMerchantProduct,
  deleteMerchantProduct,
  fetchAdminCategories,
  fetchMerchantProductPage,
  stockInMerchantProduct,
  updateMerchantProduct,
  uploadMerchantProductImage
} from "../api/admin";

const PAGE_SIZE = 10;

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

function normalizeProductPage(data) {
  return {
    items: data?.items || data?.records || [],
    total: Number(data?.total || 0),
    page: Number(data?.page || data?.current || 1),
    size: Number(data?.size || PAGE_SIZE),
    totalPages: Number(data?.totalPages || data?.pages || 1)
  };
}

export function useMerchantModule() {
  const [categories, setCategories] = useState([]);
  const [productPage, setProductPage] = useState({
    items: [],
    total: 0,
    page: 1,
    size: PAGE_SIZE,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [stockingProductId, setStockingProductId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productForm, setProductForm] = useState(createDefaultProductForm);

  const loadProductPage = useCallback(async (merchantId, page = 1) => {
    const pageData = await fetchMerchantProductPage(merchantId, page, PAGE_SIZE);
    setProductPage(normalizeProductPage(pageData));
  }, []);

  const loadDashboard = useCallback(
    async (merchantId) => {
      if (!merchantId) {
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [categoryData] = await Promise.all([
          fetchAdminCategories(),
          loadProductPage(merchantId, 1)
        ]);
        setCategories(categoryData);
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
    },
    [loadProductPage]
  );

  const refreshProducts = useCallback(
    async (merchantId, page = productPage.page) => {
      if (!merchantId) {
        return;
      }

      setError("");
      try {
        await loadProductPage(merchantId, page);
      } catch (loadError) {
        setError(loadError.message);
      }
    },
    [loadProductPage, productPage.page]
  );

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
        await loadProductPage(merchantId, 1);
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
    [loadProductPage, productForm]
  );

  const updateProduct = useCallback(
    async (merchantId, productId, form) => {
      if (!merchantId || !productId) {
        throw new Error("商品信息缺失，请刷新后重试。");
      }

      setUpdateSubmitting(true);
      setError("");
      try {
        const payload = {
          merchantId,
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          rating: Number(form.rating),
          badge: (form.badge || "").trim() || null,
          imageUrl: (form.imageUrl || "").trim() || null,
          categorySlug: form.categorySlug,
          stockQuantity: Number(form.stockQuantity),
          displayOrder: Number(form.displayOrder),
          active: Boolean(form.active),
          featured: Boolean(form.featured)
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

        const updated = await updateMerchantProduct(productId, payload);
        await loadProductPage(merchantId, productPage.page);
        return updated;
      } catch (updateError) {
        setError(updateError.message);
        throw updateError;
      } finally {
        setUpdateSubmitting(false);
      }
    },
    [loadProductPage, productPage.page]
  );

  const stockInProduct = useCallback(
    async (merchantId, productId, quantity) => {
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
        await loadProductPage(merchantId, productPage.page);
        return updated;
      } catch (stockError) {
        setError(stockError.message);
        throw stockError;
      } finally {
        setStockingProductId(null);
      }
    },
    [loadProductPage, productPage.page]
  );

  const uploadProductImage = useCallback(async (merchantId, file) => {
    if (!merchantId) {
      throw new Error("商户信息缺失，请重新登录。");
    }
    if (!file) {
      throw new Error("请先选择图片文件。");
    }

    setImageUploading(true);
    setError("");
    try {
      const data = await uploadMerchantProductImage(merchantId, file);
      const imageUrl = data?.imageUrl || "";
      if (!imageUrl) {
        throw new Error("图片上传成功，但未返回图片地址。");
      }
      setProductForm((current) => ({
        ...current,
        imageUrl
      }));
      return imageUrl;
    } catch (uploadError) {
      setError(uploadError.message);
      throw uploadError;
    } finally {
      setImageUploading(false);
    }
  }, []);

  const deleteProduct = useCallback(
    async (merchantId, productId) => {
      if (!merchantId || !productId) {
        throw new Error("商品信息缺失，请刷新后重试。");
      }

      setDeletingProductId(productId);
      setError("");
      try {
        await deleteMerchantProduct(productId, merchantId);
        const currentPage = productPage.page || 1;
        const currentItems = productPage.items || [];
        const targetPage = currentItems.length <= 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        await loadProductPage(merchantId, targetPage);
      } catch (deleteError) {
        setError(deleteError.message);
        throw deleteError;
      } finally {
        setDeletingProductId(null);
      }
    },
    [loadProductPage, productPage.items, productPage.page]
  );

  const categoryOptions = useMemo(() => categories || [], [categories]);

  return {
    categories: categoryOptions,
    products: productPage.items,
    productPage,
    loading,
    error,
    createSubmitting,
    updateSubmitting,
    imageUploading,
    stockingProductId,
    deletingProductId,
    productForm,
    loadDashboard,
    refreshProducts,
    updateProductFormField,
    resetProductForm,
    createProduct,
    updateProduct,
    stockInProduct,
    uploadProductImage,
    deleteProduct
  };
}
