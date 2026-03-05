package com.aism.aishoppingmall.user;

import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {

    private final UserMapper userMapper;

    public UserRepository(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public boolean existsByEmailIgnoreCase(String email) {
        return userMapper.countByEmailIgnoreCase(email) > 0;
    }

    public Optional<User> findByEmailIgnoreCase(String email) {
        return Optional.ofNullable(userMapper.findByEmailIgnoreCase(email));
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(userMapper.selectById(id));
    }

    public User save(User user) {
        if (user.getId() == null) {
            userMapper.insert(user);
        } else {
            userMapper.updateById(user);
        }
        return user;
    }
}
