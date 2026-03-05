package com.aism.aishoppingmall.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        Long userId,
        Integer totalItems,
        BigDecimal totalAmount,
        List<CartItemResponse> items
) {
}
