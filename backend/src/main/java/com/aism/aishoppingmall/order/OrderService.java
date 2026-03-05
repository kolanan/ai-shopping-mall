package com.aism.aishoppingmall.order;

import com.aism.aishoppingmall.cart.CartCheckoutValidationResponse;
import com.aism.aishoppingmall.cart.CartItem;
import com.aism.aishoppingmall.cart.CartItemRepository;
import com.aism.aishoppingmall.cart.CartService;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductRepository;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {

    private static final DateTimeFormatter ORDER_NO_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final CartService cartService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderService(
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            CartService cartService,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository
    ) {
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.cartService = cartService;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。"));
        List<CartItem> cartItems = cartItemRepository.findAllByUserIdOrderByUpdatedAtDescIdDesc(user.getId());

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "购物车为空，无法下单。");
        }

        CartCheckoutValidationResponse validation = cartService.validateCheckout(user.getId());
        if (!validation.valid()) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "库存校验未通过，无法下单。");
        }

        int totalItems = cartItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = orderRepository.save(new Order(
                buildOrderNo(user.getId()),
                user,
                totalItems,
                totalAmount,
                OrderStatus.CREATED
        ));

        List<OrderItem> orderItems = cartItems.stream()
                .map(item -> {
                    item.getProduct().setStockQuantity(item.getProduct().getStockQuantity() - item.getQuantity());
                    return new OrderItem(
                            order,
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getProduct().getCategory().getName(),
                            item.getProduct().getPrice(),
                            item.getQuantity(),
                            item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                    );
                })
                .toList();

        orderItemRepository.saveAll(orderItems);
        cartItemRepository.deleteAll(cartItems);

        return new OrderResponse(
                order.getId(),
                order.getOrderNo(),
                user.getId(),
                order.getTotalItems(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                orderItems.stream().map(OrderItemResponse::from).toList()
        );
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。"));

        return orderRepository.findAllByUserIdOrderByCreatedAtDescIdDesc(user.getId()).stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getOrderNo(),
                        user.getId(),
                        order.getTotalItems(),
                        order.getTotalAmount(),
                        order.getStatus().name(),
                        order.getCreatedAt(),
                        orderItemRepository.findAllByOrderIdOrderByIdAsc(order.getId()).stream()
                                .map(OrderItemResponse::from)
                                .toList()
                ))
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "订单不存在。"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权操作该订单。");
        }

        OrderStatus targetStatus;
        try {
            targetStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "目标状态不合法。");
        }

        validateTransition(order.getStatus(), targetStatus);

        if (targetStatus == OrderStatus.CANCELLED) {
            restoreInventory(order.getId());
        }

        order.setStatus(targetStatus);
        orderRepository.save(order);

        return toOrderResponse(order);
    }

    private void restoreInventory(Long orderId) {
        List<OrderItem> orderItems = orderItemRepository.findAllByOrderIdOrderByIdAsc(orderId);
        for (OrderItem orderItem : orderItems) {
            Product product = productRepository.findById(orderItem.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "商品不存在。"));
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
        }
    }

    private void validateTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }

        boolean valid = switch (currentStatus) {
            case CREATED -> targetStatus == OrderStatus.PAID || targetStatus == OrderStatus.CANCELLED;
            case PAID -> targetStatus == OrderStatus.SHIPPED || targetStatus == OrderStatus.CANCELLED;
            case SHIPPED -> targetStatus == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "当前订单状态不允许这样流转。");
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNo(),
                order.getUser().getId(),
                order.getTotalItems(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                orderItemRepository.findAllByOrderIdOrderByIdAsc(order.getId()).stream()
                        .map(OrderItemResponse::from)
                        .toList()
        );
    }

    private String buildOrderNo(Long userId) {
        return "ORD" + ORDER_NO_TIME.format(LocalDateTime.now()) + String.format("%04d", userId % 10000);
    }
}
