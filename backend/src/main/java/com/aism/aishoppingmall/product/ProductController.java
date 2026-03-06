package com.aism.aishoppingmall.product;

import com.aism.aishoppingmall.product.dto.ProductCatalogQueryDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/products")
@Tag(name = "Product", description = "Product query APIs")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(summary = "Get featured products")
    @GetMapping("/featured")
    public List<ProductResponse> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    @Operation(summary = "Get catalog products")
    @GetMapping("/catalog")
    public List<ProductResponse> getCatalogProducts(@Valid @ModelAttribute ProductCatalogQueryDTO query) {
        return productService.getCatalogProducts(query);
    }
}
