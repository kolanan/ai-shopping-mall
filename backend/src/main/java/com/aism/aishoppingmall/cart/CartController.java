package com.aism.aishoppingmall.cart;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Cart APIs")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @Operation(summary = "Get cart")
    @GetMapping
    public CartResponse getCart(
            @Parameter(description = "User ID", required = true, example = "1")
            @RequestParam @NotNull(message = "User ID must not be null") Long userId
    ) {
        return cartService.getCart(userId);
    }

    @Operation(summary = "Add cart item")
    @PostMapping("/items")
    public CartResponse addItem(
            @Parameter(description = "Add cart item request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Add cart item request body", required = true)
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return cartService.addItem(request);
    }

    @Operation(summary = "Update cart item")
    @PatchMapping("/items/{itemId}")
    public CartResponse updateItem(
            @Parameter(description = "Cart item ID", required = true, example = "100")
            @PathVariable Long itemId,
            @Parameter(description = "Update cart item request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Update cart item request body", required = true)
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateItem(itemId, request);
    }

    @Operation(summary = "Remove cart item")
    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(
            @Parameter(description = "Cart item ID", required = true, example = "100")
            @PathVariable Long itemId,
            @Parameter(description = "User ID", required = true, example = "1")
            @RequestParam @NotNull(message = "User ID must not be null") Long userId
    ) {
        return cartService.removeItem(itemId, userId);
    }

    @Operation(summary = "Validate checkout")
    @GetMapping("/checkout/validate")
    public CartCheckoutValidationResponse validateCheckout(
            @Parameter(description = "User ID", required = true, example = "1")
            @RequestParam @NotNull(message = "User ID must not be null") Long userId
    ) {
        return cartService.validateCheckout(userId);
    }
}