package com.aism.aishoppingmall.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "User register request")
public class RegisterRequest {

    @Schema(description = "Full name", example = "Zhang San")
    @NotBlank(message = "Full name must not be blank")
    @Size(min = 2, max = 80, message = "Full name length must be between 2 and 80")
    private String fullName;

    @Schema(description = "Email", example = "zhangsan@example.com")
    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email format is invalid")
    @Size(max = 120, message = "Email length must be less than or equal to 120")
    private String email;

    @Schema(description = "Password", example = "Abc123456")
    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, max = 72, message = "Password length must be between 6 and 72")
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