package com.aism.aishoppingmall.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Admin create or update product DTO")
public class AdminProductDTO {

    @Schema(description = "Merchant ID", example = "10")
    @NotNull(message = "Merchant ID must not be null")
    private Long merchantId;

    @Schema(description = "Product name", example = "Wireless Earbuds")
    @NotBlank(message = "Product name must not be blank")
    @Size(max = 140, message = "Product name length must be less than or equal to 140")
    private String name;

    @Schema(description = "Product slug", example = "wireless-earbuds")
    @NotBlank(message = "Product slug must not be blank")
    @Size(max = 160, message = "Product slug length must be less than or equal to 160")
    private String slug;

    @Schema(description = "Product description", example = "ANC Bluetooth earbuds")
    @NotBlank(message = "Product description must not be blank")
    @Size(max = 1000, message = "Product description length must be less than or equal to 1000")
    private String description;

    @Schema(description = "Price", example = "199.00")
    @NotNull(message = "Price must not be null")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @Schema(description = "Rating", example = "4.8")
    @NotNull(message = "Rating must not be null")
    @DecimalMin(value = "0.0", message = "Rating must be greater than or equal to 0")
    @DecimalMax(value = "5.0", message = "Rating must be less than or equal to 5")
    private BigDecimal rating;

    @Schema(description = "Badge", example = "NEW")
    @Size(max = 40, message = "Badge length must be less than or equal to 40")
    private String badge;

    @Schema(description = "Image URL", example = "https://cdn.example.com/product.jpg")
    @Size(max = 255, message = "Image URL length must be less than or equal to 255")
    private String imageUrl;

    @Schema(description = "Category slug", example = "electronics")
    @NotBlank(message = "Category slug must not be blank")
    private String categorySlug;

    @Schema(description = "Stock quantity", example = "100")
    @NotNull(message = "Stock quantity must not be null")
    @Min(value = 0, message = "Stock quantity must be greater than or equal to 0")
    private Integer stockQuantity;

    @Schema(description = "Display order", example = "1")
    @NotNull(message = "Display order must not be null")
    @Min(value = 1, message = "Display order must be at least 1")
    private Integer displayOrder;

    @Schema(description = "Active status", example = "true")
    @NotNull(message = "Active must not be null")
    private Boolean active;

    @Schema(description = "Featured status", example = "false")
    @NotNull(message = "Featured must not be null")
    private Boolean featured;
}
