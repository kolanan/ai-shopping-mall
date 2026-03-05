package com.aism.aishoppingmall.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddCartItemRequest {

    @NotNull(message = "用户不能为空。")
    private Long userId;

    @NotNull(message = "商品不能为空。")
    private Long productId;

    @NotNull(message = "购买数量不能为空。")
    @Min(value = 1, message = "购买数量至少为 1。")
    private Integer quantity;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
