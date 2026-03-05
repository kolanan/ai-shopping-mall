package com.aism.aishoppingmall.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "姓名不能为空。")
    @Size(min = 2, max = 80, message = "姓名长度需在 2 到 80 个字符之间。")
    private String fullName;

    @NotBlank(message = "邮箱不能为空。")
    @Email(message = "请输入有效的邮箱地址。")
    @Size(max = 120, message = "邮箱长度不能超过 120 个字符。")
    private String email;

    @NotBlank(message = "密码不能为空。")
    @Size(min = 6, max = 72, message = "密码长度需在 6 到 72 个字符之间。")
    private String password;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
