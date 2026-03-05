package com.aism.aishoppingmall.admin;

import com.aism.aishoppingmall.category.Category;

public record AdminCategoryResponse(Long id, String name, String slug, Integer displayOrder) {
    public static AdminCategoryResponse from(Category category) {
        return new AdminCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDisplayOrder()
        );
    }
}
