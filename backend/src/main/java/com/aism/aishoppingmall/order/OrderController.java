package com.aism.aishoppingmall.order;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order", description = "Order APIs")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create order")
    @PostMapping
    public OrderResponse createOrder(
            @Parameter(description = "Create order request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Create order request body", required = true)
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return orderService.createOrder(request);
    }

    @Operation(summary = "Get user orders")
    @GetMapping
    public List<OrderResponse> getOrders(
            @Parameter(description = "User ID", required = true, example = "1")
            @RequestParam @NotNull(message = "User ID must not be null") Long userId
    ) {
        return orderService.getOrders(userId);
    }

    @Operation(summary = "Update order status")
    @PatchMapping("/{orderId}/status")
    public OrderResponse updateOrderStatus(
            @Parameter(description = "Order ID", required = true, example = "1001")
            @PathVariable Long orderId,
            @Parameter(description = "Update order status request", required = true)
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Update order status request body", required = true)
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(orderId, request);
    }
}