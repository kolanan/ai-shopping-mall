package com.aism.aishoppingmall.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Merchant stock-in request")
public class AdminStockInRequest {

    @Schema(description = "Merchant ID", example = "10")
    @NotNull(message = "Merchant ID must not be null")
    private Long merchantId;

    @Schema(description = "Stock quantity to add", example = "50")
    @NotNull(message = "Stock quantity must not be null")
    @Min(value = 1, message = "Stock quantity must be at least 1")
    private Integer quantity;

    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
