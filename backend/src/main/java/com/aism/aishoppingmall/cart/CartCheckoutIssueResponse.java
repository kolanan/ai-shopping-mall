package com.aism.aishoppingmall.cart;

public record CartCheckoutIssueResponse(
        Long itemId,
        String productName,
        Integer requestedQuantity,
        Integer availableStock,
        String message
) {
}
