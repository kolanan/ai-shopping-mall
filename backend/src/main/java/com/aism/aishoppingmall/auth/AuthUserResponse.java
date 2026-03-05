package com.aism.aishoppingmall.auth;

import com.aism.aishoppingmall.user.User;

public record AuthUserResponse(Long id, String fullName, String email, String role) {

    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }
}
