package com.aism.aishoppingmall.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Merchant update order status DTO")
public class MerchantUpdateOrderStatusDTO {

    @Schema(description = "Merchant ID", example = "10")
    @NotNull(message = "Merchant ID must not be null")
    private Long merchantId;

    @Schema(description = "Target order status", example = "SHIPPED")
    @NotBlank(message = "Status must not be blank")
    private String status;
}
