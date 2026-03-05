package com.aism.aishoppingmall.cart;

import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductRepository;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。"));

        return buildCartResponse(user.getId(), cartItemRepository.findAllByUserIdOrderByUpdatedAtDescIdDesc(userId));
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "商品不存在。"));

        int targetQuantity = request.getQuantity();

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId())
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity() + targetQuantity);
                    return existingItem;
                })
                .orElseGet(() -> new CartItem(user, product, targetQuantity));

        if (cartItem.getQuantity() > product.getStockQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "加入数量超过库存上限。"
            );
        }

        cartItemRepository.save(cartItem);

        return buildCartResponse(user.getId(), cartItemRepository.findAllByUserIdOrderByUpdatedAtDescIdDesc(user.getId()));
    }

    @Transactional
    public CartResponse updateItem(Long itemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findByIdAndUserId(itemId, request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "购物车商品不存在。"));

        int quantity = request.getQuantity();
        if (quantity > cartItem.getProduct().getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "修改后的数量超过库存上限。");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return buildCartResponse(
                request.getUserId(),
                cartItemRepository.findAllByUserIdOrderByUpdatedAtDescIdDesc(request.getUserId())
        );
    }

    @Transactional
    public CartResponse removeItem(Long itemId, Long userId) {
        CartItem cartItem = cartItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "购物车商品不存在。"));

        cartItemRepository.delete(cartItem);

        return buildCartResponse(userId, cartItemRepository.findAllByUserIdOrderByUpdatedAtDescIdDesc(userId));
    }

    @Transactional(readOnly = true)
    public CartCheckoutValidationResponse validateCheckout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。"));
        List<CartItem> cartItems = cartItemRepository.findAllByUserIdOrderByUpdatedAtDescIdDesc(user.getId());

        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "购物车为空，无法结算。");
        }

        List<CartCheckoutIssueResponse> issues = new ArrayList<>();

        for (CartItem item : cartItems) {
            int requestedQuantity = item.getQuantity();
            int availableStock = item.getProduct().getStockQuantity();
            if (availableStock <= 0) {
                issues.add(new CartCheckoutIssueResponse(
                        item.getId(),
                        item.getProduct().getName(),
                        requestedQuantity,
                        availableStock,
                        "该商品当前无库存。"
                ));
            } else if (requestedQuantity > availableStock) {
                issues.add(new CartCheckoutIssueResponse(
                        item.getId(),
                        item.getProduct().getName(),
                        requestedQuantity,
                        availableStock,
                        "购买数量超过当前库存。"
                ));
            }
        }

        CartResponse cart = buildCartResponse(user.getId(), cartItems);
        boolean valid = issues.isEmpty();
        String message = valid ? "库存校验通过，可以继续结算。" : "部分商品库存不足，请先调整购物车。";

        return new CartCheckoutValidationResponse(valid, cart.totalItems(), cart.totalAmount(), issues, message);
    }

    private CartResponse buildCartResponse(Long userId, List<CartItem> cartItems) {
        List<CartItemResponse> items = cartItems.stream()
                .map(CartItemResponse::from)
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(userId, totalItems, totalAmount, items);
    }
}
