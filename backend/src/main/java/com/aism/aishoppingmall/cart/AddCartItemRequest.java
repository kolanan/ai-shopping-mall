package com.aism.aishoppingmall.cart;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Add cart item request")
public class AddCartItemRequest {

    @Schema(description = "User ID", example = "1")
    @NotNull(message = "User ID must not be null")
    private Long userId;

    @Schema(description = "Product ID", example = "101")
    @NotNull(message = "Product ID must not be null")
    private Long productId;

    @Schema(description = "Quantity", example = "2")
    @NotNull(message = "Quantity must not be null")
    @Min(value = 1, message = "Quantity must be at least 1")
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