package com.aism.aishoppingmall.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByDisplayOrderAscIdAsc();

    Optional<Category> findBySlug(String slug);
}

