package com.aism.aishoppingmall.product;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findAllByFeaturedTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    public List<ProductResponse> getCatalogProducts() {
        return productRepository.findAllByActiveTrueOrderByFeaturedDescDisplayOrderAscIdAsc()
                .stream()
                .map(ProductResponse::from)
                .toList();
    }
}
