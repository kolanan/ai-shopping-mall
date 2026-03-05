package com.aism.aishoppingmall.cart;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @EntityGraph(attributePaths = {"product", "product.category"})
    List<CartItem> findAllByUserIdOrderByUpdatedAtDescIdDesc(Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    @EntityGraph(attributePaths = {"product", "product.category"})
    Optional<CartItem> findByIdAndUserId(Long id, Long userId);
}
