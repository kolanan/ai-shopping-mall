package com.aism.aishoppingmall.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productSlug,
        String productName,
        String category,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal lineTotal
) {
    public static CartItemResponse from(CartItem item) {
        BigDecimal unitPrice = item.getProduct().getPrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getSlug(),
                item.getProduct().getName(),
                item.getProduct().getCategory().getName(),
                unitPrice,
                item.getQuantity(),
                lineTotal
        );
    }
}
