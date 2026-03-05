package com.aism.aishoppingmall.cart;

import com.aism.aishoppingmall.product.ProductRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class CartItemRepository {

    private final CartItemMapper cartItemMapper;
    private final ProductRepository productRepository;

    public CartItemRepository(CartItemMapper cartItemMapper, ProductRepository productRepository) {
        this.cartItemMapper = cartItemMapper;
        this.productRepository = productRepository;
    }

    public List<CartItem> findAllByUserIdOrderByUpdatedAtDescIdDesc(Long userId) {
        return cartItemMapper.findAllByUserIdOrderByUpdatedAtDescIdDesc(userId).stream()
                .map(this::hydrate)
                .toList();
    }

    public Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId) {
        return Optional.ofNullable(hydrate(cartItemMapper.findByUserIdAndProductId(userId, productId)));
    }

    public Optional<CartItem> findByIdAndUserId(Long id, Long userId) {
        return Optional.ofNullable(hydrate(cartItemMapper.findByIdAndUserId(id, userId)));
    }

    public CartItem save(CartItem cartItem) {
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
        return hydrate(cartItem);
    }

    public void delete(CartItem cartItem) {
        if (cartItem != null && cartItem.getId() != null) {
            cartItemMapper.deleteById(cartItem.getId());
        }
    }

    public void deleteAll(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            delete(cartItem);
        }
    }

    private CartItem hydrate(CartItem item) {
        if (item == null) {
            return null;
        }
        if (item.getProduct() == null && item.getProductId() != null) {
            productRepository.findById(item.getProductId()).ifPresent(item::setProduct);
        }
        return item;
    }
}
