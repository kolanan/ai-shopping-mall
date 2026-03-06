package com.aism.aishoppingmall.product.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductCatalogQueryDTO {

    private String keyword;

    private String category;

    @DecimalMin(value = "0.0", message = "minPrice must be >= 0")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "maxPrice must be >= 0")
    private BigDecimal maxPrice;

    private Boolean inStock;

    private String sortBy = "featured";

    private String sortDir = "desc";
}
