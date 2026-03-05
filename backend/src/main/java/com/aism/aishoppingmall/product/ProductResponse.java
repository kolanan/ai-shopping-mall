package com.aism.aishoppingmall.product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String category,
        String description,
        BigDecimal price,
        BigDecimal rating,
        String badge,
        String imageUrl,
        Integer stockQuantity,
        Boolean active,
        Boolean featured,
        String merchantName
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getCategory().getName(),
                product.getDescription(),
                product.getPrice(),
                product.getRating(),
                product.getBadge(),
                product.getImageUrl(),
                product.getStockQuantity(),
                product.getActive(),
                product.getFeatured(),
                product.getMerchant() == null ? "平台自营" : product.getMerchant().getFullName()
        );
    }
}
