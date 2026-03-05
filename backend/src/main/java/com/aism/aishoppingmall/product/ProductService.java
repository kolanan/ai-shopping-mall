package com.aism.aishoppingmall.product;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryMapper;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserMapper;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return productMapper.findAllByFeaturedTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(this::hydrateProduct)
                .map(ProductResponse::from)
                .toList();
    }

    public List<ProductResponse> getCatalogProducts() {
        return productMapper.findAllByActiveTrueOrderByFeaturedDescDisplayOrderAscIdAsc()
                .stream()
                .map(this::hydrateProduct)
                .map(ProductResponse::from)
                .toList();
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
