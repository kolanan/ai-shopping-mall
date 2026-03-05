package com.aism.aishoppingmall.product;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {

    @Select("SELECT COUNT(1) FROM products WHERE slug = #{slug}")
    long countBySlug(String slug);

    @Select("SELECT * FROM products WHERE slug = #{slug} LIMIT 1")
    Product findBySlug(String slug);

    @Select("SELECT * FROM products WHERE featured = 1 ORDER BY display_order ASC, id ASC")
    List<Product> findAllByFeaturedTrueOrderByDisplayOrderAscIdAsc();

    @Select("SELECT * FROM products WHERE active = 1 ORDER BY featured DESC, display_order ASC, id ASC")
    List<Product> findAllByActiveTrueOrderByFeaturedDescDisplayOrderAscIdAsc();

    @Select("SELECT * FROM products WHERE merchant_id = #{merchantId} ORDER BY display_order ASC, id DESC")
    List<Product> findAllByMerchantIdOrderByDisplayOrderAscIdDesc(Long merchantId);
}
