package com.aism.aishoppingmall.category;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepository {

    private final CategoryMapper categoryMapper;

    public CategoryRepository(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public List<Category> findAllByOrderByDisplayOrderAscIdAsc() {
        return categoryMapper.findAllOrderByDisplayOrderAscIdAsc();
    }

    public Optional<Category> findBySlug(String slug) {
        return Optional.ofNullable(categoryMapper.findBySlug(slug));
    }

    public Optional<Category> findById(Long id) {
        return Optional.ofNullable(categoryMapper.selectById(id));
    }

    public Category save(Category category) {
        if (category.getId() == null) {
            categoryMapper.insert(category);
        } else {
            categoryMapper.updateById(category);
        }
        return category;
    }
}
