package com.aism.aishoppingmall.product;

import com.aism.aishoppingmall.category.CategoryRepository;
import com.aism.aishoppingmall.user.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductRepository {

    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductRepository(
            ProductMapper productMapper,
            CategoryRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.productMapper = productMapper;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public boolean existsBySlug(String slug) {
        return productMapper.countBySlug(slug) > 0;
    }

    public Optional<Product> findBySlug(String slug) {
        return Optional.ofNullable(hydrate(productMapper.findBySlug(slug)));
    }

    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(hydrate(productMapper.selectById(id)));
    }

    public List<Product> findAllByFeaturedTrueOrderByDisplayOrderAscIdAsc() {
        return productMapper.findAllByFeaturedTrueOrderByDisplayOrderAscIdAsc().stream().map(this::hydrate).toList();
    }

    public List<Product> findAllByActiveTrueOrderByFeaturedDescDisplayOrderAscIdAsc() {
        return productMapper.findAllByActiveTrueOrderByFeaturedDescDisplayOrderAscIdAsc().stream().map(this::hydrate).toList();
    }

    public List<Product> findAllByMerchantIdOrderByDisplayOrderAscIdDesc(Long merchantId) {
        return productMapper.findAllByMerchantIdOrderByDisplayOrderAscIdDesc(merchantId).stream().map(this::hydrate).toList();
    }

    public Product save(Product product) {
        syncForeignKeys(product);
        if (product.getId() == null) {
            productMapper.insert(product);
        } else {
            productMapper.updateById(product);
        }
        return hydrate(product);
    }

    private Product hydrate(Product product) {
        if (product == null) {
            return null;
        }
        if (product.getCategory() == null && product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId()).ifPresent(product::setCategory);
        }
        if (product.getMerchant() == null && product.getMerchantId() != null) {
            userRepository.findById(product.getMerchantId()).ifPresent(product::setMerchant);
        }
        return product;
    }

    private void syncForeignKeys(Product product) {
        if (product.getCategoryId() == null && product.getCategory() != null) {
            product.setCategoryId(product.getCategory().getId());
        }
        if (product.getMerchantId() == null && product.getMerchant() != null) {
            product.setMerchantId(product.getMerchant().getId());
        }
    }
}
