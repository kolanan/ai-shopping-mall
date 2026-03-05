package com.aism.aishoppingmall.product;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.user.User;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@TableName("products")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String slug;

    private String description;

    private BigDecimal price;

    private BigDecimal rating;

    private String badge;

    @TableField("image_url")
    private String imageUrl;

    private Boolean active;

    private Boolean featured;

    @TableField("stock_quantity")
    private Integer stockQuantity;

    @TableField("display_order")
    private Integer displayOrder;

    @TableField("category_id")
    private Long categoryId;

    @TableField("merchant_id")
    private Long merchantId;

    @TableField(exist = false)
    private Category category;

    @TableField(exist = false)
    private User merchant;

    public Product(
            String name,
            String slug,
            String description,
            BigDecimal price,
            BigDecimal rating,
            String badge,
            String imageUrl,
            Boolean active,
            Boolean featured,
            Integer stockQuantity,
            Integer displayOrder,
            Category category,
            User merchant
    ) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.rating = rating;
        this.badge = badge;
        this.imageUrl = imageUrl;
        this.active = active;
        this.featured = featured;
        this.stockQuantity = stockQuantity;
        this.displayOrder = displayOrder;
        setCategory(category);
        setMerchant(merchant);
    }

    public void setCategory(Category category) {
        this.category = category;
        this.categoryId = category == null ? null : category.getId();
    }

    public void setMerchant(User merchant) {
        this.merchant = merchant;
        this.merchantId = merchant == null ? null : merchant.getId();
    }
}
