package com.aism.aishoppingmall.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartCheckoutValidationResponse(
        boolean valid,
        Integer totalItems,
        BigDecimal totalAmount,
        List<CartCheckoutIssueResponse> issues,
        String message
) {
}
