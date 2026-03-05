package com.aism.aishoppingmall.admin;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryRepository;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductRepository;
import com.aism.aishoppingmall.product.SeaweedFsImageStorageService;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserRepository;
import com.aism.aishoppingmall.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final SeaweedFsImageStorageService imageStorageService;

    public AdminProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            SeaweedFsImageStorageService imageStorageService
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.imageStorageService = imageStorageService;
    }

    @Transactional(readOnly = true)
    public List<AdminCategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(AdminCategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminProductResponse> getMerchantProducts(Long merchantId) {
        User merchant = loadMerchant(merchantId);
        return productRepository.findAllByMerchantIdOrderByDisplayOrderAscIdDesc(merchant.getId()).stream()
                .map(AdminProductResponse::from)
                .toList();
    }

    @Transactional
    public AdminProductResponse createProduct(AdminProductRequest request) {
        User merchant = loadMerchant(request.getMerchantId());
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "商品标识已存在。");
        }

        Category category = loadCategory(request.getCategorySlug());
        Product product = new Product(
                request.getName().trim(),
                request.getSlug().trim(),
                request.getDescription().trim(),
                request.getPrice(),
                request.getRating(),
                request.getBadge(),
                request.getImageUrl(),
                request.getActive(),
                request.getFeatured(),
                request.getStockQuantity(),
                request.getDisplayOrder(),
                category,
                merchant
        );

        return AdminProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public AdminProductResponse updateProduct(Long productId, AdminProductRequest request) {
        User merchant = loadMerchant(request.getMerchantId());
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "商品不存在。"));

        if (product.getMerchant() == null || !product.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权修改该商品。");
        }

        productRepository.findBySlug(request.getSlug())
                .filter(existing -> !existing.getId().equals(product.getId()))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "商品标识已存在。");
                });

        product.setName(request.getName().trim());
        product.setSlug(request.getSlug().trim());
        product.setDescription(request.getDescription().trim());
        product.setPrice(request.getPrice());
        product.setRating(request.getRating());
        product.setBadge(request.getBadge());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(loadCategory(request.getCategorySlug()));
        product.setStockQuantity(request.getStockQuantity());
        product.setDisplayOrder(request.getDisplayOrder());
        product.setActive(request.getActive());
        product.setFeatured(request.getFeatured());

        return AdminProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public AdminProductResponse stockInProduct(Long productId, AdminStockInRequest request) {
        User merchant = loadMerchant(request.getMerchantId());
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "商品不存在。"));

        if (product.getMerchant() == null || !product.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权操作该商品库存。");
        }

        product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
        return AdminProductResponse.from(productRepository.save(product));
    }

    public AdminUploadResponse uploadProductImage(Long merchantId, MultipartFile file) {
        loadMerchant(merchantId);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请先选择图片文件。");
        }

        String imageUrl = imageStorageService.storeUploadedImage(file, "merchant-" + merchantId);
        return new AdminUploadResponse(imageUrl);
    }

    private User loadMerchant(Long merchantId) {
        User merchant = userRepository.findById(merchantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "商户不存在。"));
        if (merchant.getRole() != UserRole.MERCHANT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "当前账号不是商户账号。");
        }
        return merchant;
    }

    private Category loadCategory(String categorySlug) {
        return categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "商品分类不存在。"));
    }
}
