package com.aism.aishoppingmall.admin;

import com.aism.aishoppingmall.product.Product;

import java.math.BigDecimal;

public record AdminProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        BigDecimal rating,
        String badge,
        String imageUrl,
        String categorySlug,
        String categoryName,
        Integer stockQuantity,
        Integer displayOrder,
        Boolean active,
        Boolean featured,
        Long merchantId,
        String merchantName
) {
    public static AdminProductResponse from(Product product) {
        return new AdminProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getRating(),
                product.getBadge(),
                product.getImageUrl(),
                product.getCategory().getSlug(),
                product.getCategory().getName(),
                product.getStockQuantity(),
                product.getDisplayOrder(),
                product.getActive(),
                product.getFeatured(),
                product.getMerchant() == null ? null : product.getMerchant().getId(),
                product.getMerchant() == null ? "平台自营" : product.getMerchant().getFullName()
        );
    }
}
