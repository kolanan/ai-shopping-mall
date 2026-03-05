package com.aism.aishoppingmall.order;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    @Select("SELECT * FROM app_orders WHERE user_id = #{userId} ORDER BY created_at DESC, id DESC")
    List<Order> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
