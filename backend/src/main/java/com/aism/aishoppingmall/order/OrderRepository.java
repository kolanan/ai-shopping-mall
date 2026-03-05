package com.aism.aishoppingmall.order;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = "user")
    List<Order> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
