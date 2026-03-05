package com.aism.aishoppingmall.user;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("app_users")
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

    protected User() {
    }

    public User(String fullName, String email, String passwordHash, UserRole role) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role == null ? UserRole.USER : role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}