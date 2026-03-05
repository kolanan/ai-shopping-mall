package com.aism.aishoppingmall.user;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT COUNT(1) FROM app_users WHERE LOWER(email) = LOWER(#{email})")
    long countByEmailIgnoreCase(String email);

    @Select("SELECT * FROM app_users WHERE LOWER(email) = LOWER(#{email}) LIMIT 1")
    User findByEmailIgnoreCase(String email);
}
