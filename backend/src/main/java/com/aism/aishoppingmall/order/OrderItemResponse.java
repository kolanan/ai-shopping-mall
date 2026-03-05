package com.aism.aishoppingmall.order;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String productName,
        String category,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal lineTotal
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
                item.getProductId(),
                item.getProductName(),
                item.getCategory(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }
}
