package com.aism.aishoppingmall.category;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {

    @Select("SELECT * FROM categories ORDER BY display_order ASC, id ASC")
    List<Category> findAllOrderByDisplayOrderAscIdAsc();

    @Select("SELECT * FROM categories WHERE slug = #{slug} LIMIT 1")
    Category findBySlug(String slug);
}
