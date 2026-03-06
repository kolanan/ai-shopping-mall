package com.aism.aishoppingmall.product;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryMapper;
import com.aism.aishoppingmall.product.dto.ProductCatalogQueryDTO;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;

@Service
public class ProductService {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;

    public ProductService(ProductMapper productMapper, CategoryMapper categoryMapper, UserMapper userMapper) {
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
        this.userMapper = userMapper;
    }

    public List<ProductResponse> getFeaturedProducts() {
        LambdaQueryWrapper<Product> query = new LambdaQueryWrapper<Product>()
                .eq(Product::getFeatured, true)
                .eq(Product::getActive, true)
                .gt(Product::getStockQuantity, 0)
                .orderByAsc(Product::getDisplayOrder)
                .orderByAsc(Product::getId);

        return productMapper.selectList(query)
                .stream()
                .map(this::hydrateProduct)
                .map(ProductResponse::from)
                .toList();
    }

    public List<ProductResponse> getCatalogProducts(ProductCatalogQueryDTO queryDTO) {
        validatePriceRange(queryDTO);

        LambdaQueryWrapper<Product> query = new LambdaQueryWrapper<Product>()
                .eq(Product::getActive, true);

        applyKeywordFilter(query, queryDTO.getKeyword());
        applyCategoryFilter(query, queryDTO.getCategory());
        applyPriceFilter(query, queryDTO.getMinPrice(), queryDTO.getMaxPrice());
        applyStockFilter(query, queryDTO.getInStock());
        applySort(query, queryDTO.getSortBy(), queryDTO.getSortDir());

        return productMapper.selectList(query)
                .stream()
                .map(this::hydrateProduct)
                .map(ProductResponse::from)
                .toList();
    }

    private void validatePriceRange(ProductCatalogQueryDTO queryDTO) {
        if (queryDTO.getMinPrice() == null || queryDTO.getMaxPrice() == null) {
            return;
        }
        if (queryDTO.getMinPrice().compareTo(queryDTO.getMaxPrice()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minPrice cannot be greater than maxPrice.");
        }
    }

    private void applyKeywordFilter(LambdaQueryWrapper<Product> query, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return;
        }
        String normalized = keyword.trim();
        query.and(wrapper -> wrapper
                .like(Product::getName, normalized)
                .or()
                .like(Product::getDescription, normalized)
                .or()
                .like(Product::getBadge, normalized));
    }

    private void applyCategoryFilter(LambdaQueryWrapper<Product> query, String category) {
        if (!StringUtils.hasText(category) || "all".equalsIgnoreCase(category.trim())) {
            return;
        }
        String categoryInput = category.trim();
        Category matchedCategory = categoryMapper.findAllOrderByDisplayOrderAscIdAsc()
                .stream()
                .filter(item -> item.getSlug().equalsIgnoreCase(categoryInput) || item.getName().equalsIgnoreCase(categoryInput))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category filter is invalid."));

        query.eq(Product::getCategoryId, matchedCategory.getId());
    }

    private void applyPriceFilter(LambdaQueryWrapper<Product> query, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
        if (minPrice != null) {
            query.ge(Product::getPrice, minPrice);
        }
        if (maxPrice != null) {
            query.le(Product::getPrice, maxPrice);
        }
    }

    private void applyStockFilter(LambdaQueryWrapper<Product> query, Boolean inStock) {
        if (inStock == null) {
            return;
        }
        if (Boolean.TRUE.equals(inStock)) {
            query.gt(Product::getStockQuantity, 0);
        } else {
            query.le(Product::getStockQuantity, 0);
        }
    }

    private void applySort(LambdaQueryWrapper<Product> query, String sortByInput, String sortDirInput) {
        String sortBy = StringUtils.hasText(sortByInput) ? sortByInput.trim().toLowerCase(Locale.ROOT) : "featured";
        boolean asc = "asc".equalsIgnoreCase(sortDirInput);

        switch (sortBy) {
            case "price" -> query.orderBy(true, asc, Product::getPrice).orderByDesc(Product::getId);
            case "rating" -> query.orderBy(true, asc, Product::getRating).orderByDesc(Product::getId);
            case "stock" -> query.orderBy(true, asc, Product::getStockQuantity).orderByDesc(Product::getId);
            case "displayorder" -> query.orderBy(true, asc, Product::getDisplayOrder).orderByDesc(Product::getId);
            case "newest" -> query.orderBy(true, !asc, Product::getId);
            case "featured" -> query
                    .orderByDesc(Product::getFeatured)
                    .orderByAsc(Product::getDisplayOrder)
                    .orderByDesc(Product::getId);
            default -> query
                    .orderByDesc(Product::getFeatured)
                    .orderByAsc(Product::getDisplayOrder)
                    .orderByDesc(Product::getId);
        }
    }

    private Product hydrateProduct(Product product) {
        if (product == null) {
            return null;
        }

        if (product.getCategory() == null && product.getCategoryId() != null) {
            Category category = categoryMapper.selectById(product.getCategoryId());
            product.setCategory(category);
        }

        if (product.getMerchant() == null && product.getMerchantId() != null) {
            User merchant = userMapper.selectById(product.getMerchantId());
            product.setMerchant(merchant);
        }

        return product;
    }
}
