package com.aism.aishoppingmall.cart;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CartItemMapper extends BaseMapper<CartItem> {

    @Select("SELECT * FROM cart_items WHERE user_id = #{userId} ORDER BY updated_at DESC, id DESC")
    List<CartItem> findAllByUserIdOrderByUpdatedAtDescIdDesc(Long userId);

    @Select("SELECT * FROM cart_items WHERE user_id = #{userId} AND product_id = #{productId} LIMIT 1")
    CartItem findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);

    @Select("SELECT * FROM cart_items WHERE id = #{id} AND user_id = #{userId} LIMIT 1")
    CartItem findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
