package com.aism.aishoppingmall.auth;

import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserRole;
import com.aism.aishoppingmall.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        return register(request, UserRole.USER, "注册成功。");
    }

    public AuthResponse registerMerchant(RegisterRequest request) {
        return register(request, UserRole.MERCHANT, "商户注册成功。");
    }

    private AuthResponse register(RegisterRequest request, UserRole role, String successMessage) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "该邮箱已被注册。");
        }

        User user = userRepository.save(new User(
                request.getFullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                role
        ));

        return new AuthResponse(successMessage, AuthUserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = authenticateUser(request);
        return new AuthResponse("登录成功。", AuthUserResponse.from(user));
    }

    public AuthResponse merchantLogin(LoginRequest request) {
        User user = authenticateUser(request);
        if (user.getRole() != UserRole.MERCHANT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "当前账号不是商户账号。");
        }
        return new AuthResponse("商户登录成功。", AuthUserResponse.from(user));
    }

    private User authenticateUser(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "邮箱或密码错误。"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "邮箱或密码错误。");
        }

        return user;
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
