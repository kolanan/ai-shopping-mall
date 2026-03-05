package com.aism.aishoppingmall.order;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Create order request")
public class CreateOrderRequest {

    @Schema(description = "User ID", example = "1")
    @NotNull(message = "User ID must not be null")
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}