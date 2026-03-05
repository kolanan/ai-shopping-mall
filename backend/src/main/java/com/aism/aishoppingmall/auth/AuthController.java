package com.aism.aishoppingmall.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register user")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Parameter(description = "Register request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Register request body", required = true)
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @Operation(summary = "Register merchant")
    @PostMapping("/merchant/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registerMerchant(
            @Parameter(description = "Merchant register request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Merchant register request body", required = true)
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.registerMerchant(request);
    }

    @Operation(summary = "Login")
    @PostMapping("/login")
    public AuthResponse login(
            @Parameter(description = "Login request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Login request body", required = true)
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }

    @Operation(summary = "Merchant login")
    @PostMapping("/merchant/login")
    public AuthResponse merchantLogin(
            @Parameter(description = "Merchant login request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Merchant login request body", required = true)
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.merchantLogin(request);
    }
}
