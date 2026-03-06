package com.aism.aishoppingmall.order;

import com.aism.aishoppingmall.cart.CartCheckoutValidationResponse;
import com.aism.aishoppingmall.cart.CartItem;
import com.aism.aishoppingmall.cart.CartItemMapper;
import com.aism.aishoppingmall.cart.CartService;
import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryMapper;
import com.aism.aishoppingmall.order.dto.MerchantUpdateOrderStatusDTO;
import com.aism.aishoppingmall.order.vo.MerchantOrderItemVO;
import com.aism.aishoppingmall.order.vo.MerchantOrderStatsVO;
import com.aism.aishoppingmall.order.vo.MerchantOrderVO;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductMapper;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserMapper;
import com.aism.aishoppingmall.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {

    private static final DateTimeFormatter ORDER_NO_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final UserMapper userMapper;
    private final CartItemMapper cartItemMapper;
    private final CartService cartService;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;

    public OrderService(
            UserMapper userMapper,
            CartItemMapper cartItemMapper,
            CartService cartService,
            OrderMapper orderMapper,
            OrderItemMapper orderItemMapper,
            ProductMapper productMapper,
            CategoryMapper categoryMapper
    ) {
        this.userMapper = userMapper;
        this.cartItemMapper = cartItemMapper;
        this.cartService = cartService;
        this.orderMapper = orderMapper;
        this.orderItemMapper = orderItemMapper;
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User user = loadUser(request.getUserId());
        List<CartItem> cartItems = findCartItemsByUserId(user.getId());

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        CartCheckoutValidationResponse validation = cartService.validateCheckout(user.getId());
        if (!validation.valid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart validation failed");
        }

        int totalItems = cartItems.stream().mapToInt(CartItem::getQuantity).sum();
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order(
                buildOrderNo(user.getId()),
                user,
                totalItems,
                totalAmount,
                OrderStatus.CREATED
        );
        saveOrder(order);

        List<OrderItem> orderItems = cartItems.stream()
                .map(item -> {
                    item.getProduct().setStockQuantity(item.getProduct().getStockQuantity() - item.getQuantity());
                    saveProduct(item.getProduct());
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

        saveOrderItems(orderItems);
        deleteCartItems(cartItems);

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
        User user = loadUser(userId);

        return orderMapper.findAllByUserIdOrderByCreatedAtDescIdDesc(user.getId()).stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getOrderNo(),
                        user.getId(),
                        order.getTotalItems(),
                        order.getTotalAmount(),
                        order.getStatus().name(),
                        order.getCreatedAt(),
                        orderItemMapper.findAllByOrderIdOrderByIdAsc(order.getId()).stream()
                                .map(OrderItemResponse::from)
                                .toList()
                ))
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        User user = loadUser(request.getUserId());
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        if (!order.getUserId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No permission to operate this order");
        }

        OrderStatus targetStatus;
        try {
            targetStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid target status");
        }

        validateTransition(order.getStatus(), targetStatus);

        if (targetStatus == OrderStatus.CANCELLED) {
            restoreInventory(order.getId());
        }

        order.setStatus(targetStatus);
        saveOrder(order);

        return toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public MerchantOrderStatsVO getMerchantOrderStats(Long merchantId) {
        loadMerchant(merchantId);
        List<MerchantOrderVO> orders = buildMerchantOrderList(merchantId);
        int soldItems = orders.stream().mapToInt(MerchantOrderVO::getSoldItems).sum();
        int pendingShipmentCount = (int) orders.stream()
                .filter(order -> OrderStatus.PAID.name().equals(order.getStatus()))
                .count();
        BigDecimal soldAmount = orders.stream()
                .map(MerchantOrderVO::getSoldAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MerchantOrderStatsVO(soldItems, orders.size(), pendingShipmentCount, soldAmount);
    }

    @Transactional(readOnly = true)
    public List<MerchantOrderVO> getMerchantOrders(Long merchantId) {
        loadMerchant(merchantId);
        return buildMerchantOrderList(merchantId);
    }

    @Transactional
    public MerchantOrderVO updateMerchantOrderStatus(Long orderId, MerchantUpdateOrderStatusDTO request) {
        loadMerchant(request.getMerchantId());
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        List<OrderItem> merchantItems = getMerchantOrderItems(orderId, request.getMerchantId());
        if (merchantItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No permission to operate this order");
        }

        OrderStatus targetStatus;
        try {
            targetStatus = OrderStatus.valueOf(request.getStatus().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid target status");
        }

        validateMerchantTransition(order.getStatus(), targetStatus);
        order.setStatus(targetStatus);
        saveOrder(order);

        return toMerchantOrderVO(order, merchantItems);
    }

    private void restoreInventory(Long orderId) {
        List<OrderItem> orderItems = orderItemMapper.findAllByOrderIdOrderByIdAsc(orderId);
        for (OrderItem orderItem : orderItems) {
            Product product = productMapper.selectById(orderItem.getProductId());
            if (product == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
            }
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            saveProduct(product);
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status transition is not allowed");
        }
    }

    private void validateMerchantTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return;
        }

        boolean valid = switch (currentStatus) {
            case PAID -> targetStatus == OrderStatus.SHIPPED;
            case SHIPPED -> targetStatus == OrderStatus.COMPLETED;
            case CREATED, COMPLETED, CANCELLED -> false;
        };

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Merchant order status transition is not allowed");
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNo(),
                order.getUserId(),
                order.getTotalItems(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                orderItemMapper.findAllByOrderIdOrderByIdAsc(order.getId()).stream()
                        .map(OrderItemResponse::from)
                        .toList()
        );
    }

    private String buildOrderNo(Long userId) {
        return "ORD" + ORDER_NO_TIME.format(LocalDateTime.now()) + String.format("%04d", userId % 10000);
    }

    private User loadMerchant(Long merchantId) {
        User merchant = userMapper.selectById(merchantId);
        if (merchant == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found");
        }
        if (merchant.getRole() != UserRole.MERCHANT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current account is not merchant");
        }
        return merchant;
    }

    private User loadUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }

    private List<MerchantOrderVO> buildMerchantOrderList(Long merchantId) {
        List<Order> orders = orderMapper.findAllOrderByCreatedAtDescIdDesc();
        List<MerchantOrderVO> result = new ArrayList<>();

        for (Order order : orders) {
            List<OrderItem> merchantItems = getMerchantOrderItems(order.getId(), merchantId);
            if (merchantItems.isEmpty()) {
                continue;
            }
            result.add(toMerchantOrderVO(order, merchantItems));
        }
        return result;
    }

    private MerchantOrderVO toMerchantOrderVO(Order order, List<OrderItem> merchantItems) {
        User buyer = userMapper.selectById(order.getUserId());
        int soldItems = merchantItems.stream().mapToInt(OrderItem::getQuantity).sum();
        BigDecimal soldAmount = merchantItems.stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        MerchantOrderVO vo = new MerchantOrderVO();
        vo.setOrderId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setBuyerId(order.getUserId());
        vo.setBuyerName(buyer == null ? "未知用户" : buyer.getFullName());
        vo.setStatus(order.getStatus().name());
        vo.setCreatedAt(order.getCreatedAt());
        vo.setSoldItems(soldItems);
        vo.setSoldAmount(soldAmount);
        vo.setItems(merchantItems.stream().map(MerchantOrderItemVO::from).toList());
        return vo;
    }

    private List<OrderItem> getMerchantOrderItems(Long orderId, Long merchantId) {
        return orderItemMapper.findAllByOrderIdOrderByIdAsc(orderId).stream()
                .filter(item -> {
                    Product product = productMapper.selectById(item.getProductId());
                    return product != null && merchantId.equals(product.getMerchantId());
                })
                .toList();
    }

    private List<CartItem> findCartItemsByUserId(Long userId) {
        return cartItemMapper.findAllByUserIdOrderByUpdatedAtDescIdDesc(userId).stream()
                .map(this::hydrateCartItem)
                .toList();
    }

    private CartItem hydrateCartItem(CartItem item) {
        if (item == null) {
            return null;
        }
        if (item.getProduct() == null && item.getProductId() != null) {
            Product product = productMapper.selectById(item.getProductId());
            item.setProduct(hydrateProduct(product));
        }
        return item;
    }

    private Product hydrateProduct(Product product) {
        if (product == null) {
            return null;
        }
        if (product.getCategory() == null && product.getCategoryId() != null) {
            Category category = categoryMapper.selectById(product.getCategoryId());
            product.setCategory(category);
        }
        return product;
    }

    private void saveProduct(Product product) {
        if (product.getCategoryId() == null && product.getCategory() != null) {
            product.setCategoryId(product.getCategory().getId());
        }
        if (product.getMerchantId() == null && product.getMerchant() != null) {
            product.setMerchantId(product.getMerchant().getId());
        }

        if (product.getId() == null) {
            productMapper.insert(product);
        } else {
            productMapper.updateById(product);
        }
    }

    private void saveOrder(Order order) {
        if (order.getUserId() == null && order.getUser() != null) {
            order.setUserId(order.getUser().getId());
        }

        if (order.getId() == null) {
            if (order.getCreatedAt() == null) {
                order.setCreatedAt(LocalDateTime.now());
            }
            orderMapper.insert(order);
        } else {
            orderMapper.updateById(order);
        }
    }

    private void saveOrderItems(List<OrderItem> orderItems) {
        for (OrderItem orderItem : orderItems) {
            if (orderItem.getOrderId() == null && orderItem.getOrder() != null) {
                orderItem.setOrderId(orderItem.getOrder().getId());
            }
            orderItemMapper.insert(orderItem);
        }
    }

    private void deleteCartItems(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            if (cartItem.getId() != null) {
                cartItemMapper.deleteById(cartItem.getId());
            }
        }
    }
}
