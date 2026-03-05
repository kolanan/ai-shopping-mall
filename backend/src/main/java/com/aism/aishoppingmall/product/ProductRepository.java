package com.aism.aishoppingmall.product;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySlug(String slug);

    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByFeaturedTrueOrderByDisplayOrderAscIdAsc();

    @EntityGraph(attributePaths = {"category", "merchant"})
    List<Product> findAllByActiveTrueOrderByFeaturedDescDisplayOrderAscIdAsc();

    @EntityGraph(attributePaths = {"category", "merchant"})
    List<Product> findAllByMerchantIdOrderByDisplayOrderAscIdDesc(Long merchantId);
}
