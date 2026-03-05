package com.aism.aishoppingmall.cart;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.category.CategoryMapper;
import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.product.ProductMapper;
import com.aism.aishoppingmall.user.User;
import com.aism.aishoppingmall.user.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartItemMapper cartItemMapper;
    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;

    public CartService(
            CartItemMapper cartItemMapper,
            UserMapper userMapper,
            ProductMapper productMapper,
            CategoryMapper categoryMapper
    ) {
        this.cartItemMapper = cartItemMapper;
        this.userMapper = userMapper;
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        User user = loadUser(userId);
        return buildCartResponse(user.getId(), findCartItemsByUserId(userId));
    }

    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        User user = loadUser(request.getUserId());
        Product product = loadProduct(request.getProductId());

        int targetQuantity = request.getQuantity();
        CartItem cartItem = cartItemMapper.findByUserIdAndProductId(user.getId(), product.getId());
        if (cartItem != null) {
            cartItem = hydrateCartItem(cartItem);
            cartItem.setQuantity(cartItem.getQuantity() + targetQuantity);
        } else {
            cartItem = new CartItem(user, product, targetQuantity);
        }

        if (cartItem.getQuantity() > product.getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "加入数量超过库存上限。");
        }

        saveCartItem(cartItem);
        return buildCartResponse(user.getId(), findCartItemsByUserId(user.getId()));
    }

    @Transactional
    public CartResponse updateItem(Long itemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemMapper.findByIdAndUserId(itemId, request.getUserId());
        if (cartItem == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "购物车商品不存在。");
        }

        cartItem = hydrateCartItem(cartItem);
        int quantity = request.getQuantity();
        if (quantity > cartItem.getProduct().getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "修改后的数量超过库存上限。");
        }

        cartItem.setQuantity(quantity);
        saveCartItem(cartItem);

        return buildCartResponse(request.getUserId(), findCartItemsByUserId(request.getUserId()));
    }

    @Transactional
    public CartResponse removeItem(Long itemId, Long userId) {
        CartItem cartItem = cartItemMapper.findByIdAndUserId(itemId, userId);
        if (cartItem == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "购物车商品不存在。");
        }

        cartItemMapper.deleteById(cartItem.getId());
        return buildCartResponse(userId, findCartItemsByUserId(userId));
    }

    @Transactional(readOnly = true)
    public CartCheckoutValidationResponse validateCheckout(Long userId) {
        User user = loadUser(userId);
        List<CartItem> cartItems = findCartItemsByUserId(user.getId());

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

    private User loadUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在。");
        }
        return user;
    }

    private Product loadProduct(Long productId) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "商品不存在。");
        }
        return hydrateProduct(product);
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

    private void saveCartItem(CartItem cartItem) {
        if (cartItem.getUserId() == null && cartItem.getUser() != null) {
            cartItem.setUserId(cartItem.getUser().getId());
        }
        if (cartItem.getProductId() == null && cartItem.getProduct() != null) {
            cartItem.setProductId(cartItem.getProduct().getId());
        }

        LocalDateTime now = LocalDateTime.now();
        if (cartItem.getId() == null) {
            if (cartItem.getCreatedAt() == null) {
                cartItem.setCreatedAt(now);
            }
            cartItem.setUpdatedAt(now);
            cartItemMapper.insert(cartItem);
        } else {
            cartItem.setUpdatedAt(now);
            cartItemMapper.updateById(cartItem);
        }
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
