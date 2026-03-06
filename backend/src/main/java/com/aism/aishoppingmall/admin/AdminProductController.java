package com.aism.aishoppingmall.admin;

import com.aism.aishoppingmall.admin.dto.AdminProductDTO;
import com.aism.aishoppingmall.admin.dto.AdminStockInDTO;
import com.aism.aishoppingmall.admin.vo.AdminCategoryVO;
import com.aism.aishoppingmall.admin.vo.AdminProductVO;
import com.aism.aishoppingmall.admin.vo.AdminUploadVO;
import com.aism.aishoppingmall.common.dto.PageQueryDTO;
import com.aism.aishoppingmall.common.vo.PageResultVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin APIs")
public class AdminProductController {

    private final AdminProductService adminProductService;

    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    @Operation(summary = "Get categories")
    @GetMapping("/categories")
    public List<AdminCategoryVO> getCategories() {
        return adminProductService.getCategories();
    }

    @Operation(summary = "Get merchant products")
    @GetMapping("/products")
    public PageResultVO<AdminProductVO> getMerchantProducts(
            @Parameter(description = "Merchant ID", required = true, example = "10")
            @RequestParam @NotNull(message = "Merchant ID must not be null") Long merchantId,
            @Valid @ModelAttribute PageQueryDTO pageQuery
    ) {
        return adminProductService.getMerchantProducts(merchantId, pageQuery);
    }

    @Operation(summary = "Create product")
    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductVO createProduct(
            @Parameter(description = "Create product request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Create product request body", required = true)
            @Valid @RequestBody AdminProductDTO request
    ) {
        return adminProductService.createProduct(request);
    }

    @Operation(summary = "Update product")
    @PatchMapping("/products/{productId}")
    public AdminProductVO updateProduct(
            @Parameter(description = "Product ID", required = true, example = "101")
            @PathVariable Long productId,
            @Parameter(description = "Update product request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Update product request body", required = true)
            @Valid @RequestBody AdminProductDTO request
    ) {
        return adminProductService.updateProduct(productId, request);
    }

    @Operation(summary = "Stock in product")
    @PatchMapping("/products/{productId}/stock-in")
    public AdminProductVO stockInProduct(
            @Parameter(description = "Product ID", required = true, example = "101")
            @PathVariable Long productId,
            @Parameter(description = "Stock-in request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Stock-in request body", required = true)
            @Valid @RequestBody AdminStockInDTO request
    ) {
        return adminProductService.stockInProduct(productId, request);
    }

    @Operation(summary = "Delete product")
    @DeleteMapping("/products/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @Parameter(description = "Product ID", required = true, example = "101")
            @PathVariable Long productId,
            @Parameter(description = "Merchant ID", required = true, example = "10")
            @RequestParam @NotNull(message = "Merchant ID must not be null") Long merchantId
    ) {
        adminProductService.deleteProduct(productId, merchantId);
    }

    @Operation(summary = "Upload product image")
    @PostMapping("/uploads/product-image")
    public AdminUploadVO uploadProductImage(
            @Parameter(description = "Merchant ID", required = true, example = "10")
            @RequestParam @NotNull(message = "Merchant ID must not be null") Long merchantId,
            @Parameter(description = "Image file", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return adminProductService.uploadProductImage(merchantId, file);
    }
}
