package com.aism.aishoppingmall.cart;

import com.aism.aishoppingmall.product.Product;
import com.aism.aishoppingmall.user.User;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@TableName("cart_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CartItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("product_id")
    private Long productId;

    @TableField(exist = false)
    private User user;

    @TableField(exist = false)
    private Product product;

    private Integer quantity;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public CartItem(User user, Product product, Integer quantity) {
        setUser(user);
        setProduct(product);
        this.quantity = quantity;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = user == null ? null : user.getId();
    }

    public void setProduct(Product product) {
        this.product = product;
        this.productId = product == null ? null : product.getId();
    }
}
