package com.aism.aishoppingmall.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Update order status request")
public class UpdateOrderStatusRequest {

    @Schema(description = "User ID", example = "1")
    @NotNull(message = "User ID must not be null")
    private Long userId;

    @Schema(description = "Order status", example = "PAID")
    @NotBlank(message = "Status must not be blank")
    private String status;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}