package com.aism.aishoppingmall.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/admin")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @GetMapping("/categories")
    public List<AdminCategoryResponse> getCategories() {
        return adminProductService.getCategories();
    }

    @GetMapping("/products")
    public List<AdminProductResponse> getMerchantProducts(
            @RequestParam @NotNull(message = "商户不能为空。") Long merchantId
    ) {
        return adminProductService.getMerchantProducts(merchantId);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse createProduct(@Valid @RequestBody AdminProductRequest request) {
        return adminProductService.createProduct(request);
    }

    @PatchMapping("/products/{productId}")
    public AdminProductResponse updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody AdminProductRequest request
    ) {
        return adminProductService.updateProduct(productId, request);
    }

    @PostMapping("/uploads/product-image")
    public AdminUploadResponse uploadProductImage(
            @RequestParam @NotNull(message = "商户不能为空。") Long merchantId,
            @RequestPart("file") MultipartFile file
    ) {
        return adminProductService.uploadProductImage(merchantId, file);
    }
}
