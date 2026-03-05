package com.aism.aishoppingmall.admin.vo;

import com.aism.aishoppingmall.category.Category;
import lombok.Data;

@Data
public class AdminCategoryVO {

    private Long id;
    private String name;
    private String slug;
    private Integer displayOrder;

    public static AdminCategoryVO from(Category category) {
        AdminCategoryVO vo = new AdminCategoryVO();
        vo.setId(category.getId());
        vo.setName(category.getName());
        vo.setSlug(category.getSlug());
        vo.setDisplayOrder(category.getDisplayOrder());
        return vo;
    }
}
