package com.aism.aishoppingmall.user;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@TableName("app_users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("full_name")
    private String fullName;

    private String email;

    @TableField("password_hash")
    private String passwordHash;

    private UserRole role;

    @TableField("created_at")
    private LocalDateTime createdAt;

    public User(String fullName, String email, String passwordHash, UserRole role) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    public UserRole getRole() {
        return role == null ? UserRole.USER : role;
    }
}
