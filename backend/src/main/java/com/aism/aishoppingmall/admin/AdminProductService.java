package com.aism.aishoppingmall.admin;

import com.aism.aishoppingmall.admin.dto.AdminProductDTO;
import com.aism.aishoppingmall.admin.dto.AdminStockInDTO;
import com.aism.aishoppingmall.admin.vo.AdminCategoryVO;
import com.aism.aishoppingmall.admin.vo.AdminProductVO;
import com.aism.aishoppingmall.admin.vo.AdminUploadVO;
import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryMapper;
import com.aism.aishoppingmall.common.dto.PageQueryDTO;
import com.aism.aishoppingmall.common.vo.PageResultVO;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductMapper;
import com.aism.aishoppingmall.product.SeaweedFsImageStorageService;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserMapper;
import com.aism.aishoppingmall.user.UserRole;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminProductService {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;
    private final SeaweedFsImageStorageService imageStorageService;

    public AdminProductService(
            ProductMapper productMapper,
            CategoryMapper categoryMapper,
            UserMapper userMapper,
            SeaweedFsImageStorageService imageStorageService
    ) {
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
        this.userMapper = userMapper;
        this.imageStorageService = imageStorageService;
    }

    @Transactional(readOnly = true)
    public List<AdminCategoryVO> getCategories() {
        return categoryMapper.findAllOrderByDisplayOrderAscIdAsc().stream()
                .map(AdminCategoryVO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResultVO<AdminProductVO> getMerchantProducts(Long merchantId, PageQueryDTO pageQuery) {
        User merchant = loadMerchant(merchantId);

        Page<Product> page = pageQuery.toPage(50);
        LambdaQueryWrapper<Product> query = new LambdaQueryWrapper<Product>()
                .eq(Product::getMerchantId, merchant.getId())
                .orderByAsc(Product::getDisplayOrder)
                .orderByDesc(Product::getId);

        Page<Product> productPage = productMapper.selectPage(page, query);
        List<AdminProductVO> items = productPage.getRecords().stream()
                .map(this::hydrateProduct)
                .map(AdminProductVO::from)
                .toList();

        PageResultVO<AdminProductVO> result = new PageResultVO<>();
        result.setRecords(items);
        result.setTotal(productPage.getTotal());
        result.setCurrent(productPage.getCurrent());
        result.setSize(productPage.getSize());
        result.setPages(productPage.getPages());
        return result;
    }

    @Transactional
    public AdminProductVO createProduct(AdminProductDTO request) {
        User merchant = loadMerchant(request.getMerchantId());
        if (productMapper.countBySlug(request.getSlug()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product slug already exists.");
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

        return AdminProductVO.from(saveProduct(product));
    }

    @Transactional
    public AdminProductVO updateProduct(Long productId, AdminProductDTO request) {
        User merchant = loadMerchant(request.getMerchantId());
        Product product = findProductById(productId);

        if (product.getMerchant() == null || !product.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No permission to update this product.");
        }

        Product existingBySlug = productMapper.findBySlug(request.getSlug());
        if (existingBySlug != null && !existingBySlug.getId().equals(product.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product slug already exists.");
        }

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

        return AdminProductVO.from(saveProduct(product));
    }

    @Transactional
    public AdminProductVO stockInProduct(Long productId, AdminStockInDTO request) {
        User merchant = loadMerchant(request.getMerchantId());
        Product product = findProductById(productId);

        if (product.getMerchant() == null || !product.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No permission to stock in this product.");
        }

        product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
        return AdminProductVO.from(saveProduct(product));
    }

    public AdminUploadVO uploadProductImage(Long merchantId, MultipartFile file) {
        loadMerchant(merchantId);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image file first.");
        }

        String imageUrl = imageStorageService.storeUploadedImage(file, "merchant-" + merchantId);
        return new AdminUploadVO(imageUrl);
    }

    @Transactional
    public void deleteProduct(Long productId, Long merchantId) {
        User merchant = loadMerchant(merchantId);
        Product product = findProductById(productId);

        if (product.getMerchant() == null || !product.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No permission to delete this product.");
        }

        productMapper.deleteById(product.getId());
    }

    private Product findProductById(Long productId) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found.");
        }
        return hydrateProduct(product);
    }

    private Product saveProduct(Product product) {
        if (product.getCategoryId() == null && product.getCategory() != null) {
            product.setCategoryId(product.getCategory().getId());
        }
        if (product.getMerchantId() == null && product.getMerchant() != null) {
            product.setMerchantId(product.getMerchant().getId());
        }

        if (product.getId() == null) {
            productMapper.insert(product);
        } else {
            productMapper.updateById(product);
        }
        return hydrateProduct(product);
    }

    private Product hydrateProduct(Product product) {
        if (product.getCategory() == null && product.getCategoryId() != null) {
            product.setCategory(categoryMapper.selectById(product.getCategoryId()));
        }
        if (product.getMerchant() == null && product.getMerchantId() != null) {
            product.setMerchant(userMapper.selectById(product.getMerchantId()));
        }
        return product;
    }

    private User loadMerchant(Long merchantId) {
        User merchant = userMapper.selectById(merchantId);
        if (merchant == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found.");
        }
        if (merchant.getRole() != UserRole.MERCHANT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current account is not a merchant account.");
        }
        return merchant;
    }

    private Category loadCategory(String categorySlug) {
        Category category = categoryMapper.findBySlug(categorySlug);
        if (category == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found.");
        }
        return category;
    }
}
