package com.aism.aishoppingmall.order;

import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "用户不能为空。")
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
