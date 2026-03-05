package com.aism.aishoppingmall.product;

import com.aism.aishoppingmall.category.Category;
import com.aism.aishoppingmall.user.User;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;

@TableName("products")
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

    protected Product() {
    }

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

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public String getBadge() {
        return badge;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
        this.categoryId = category == null ? null : category.getId();
    }

    public User getMerchant() {
        return merchant;
    }

    public void setMerchant(User merchant) {
        this.merchant = merchant;
        this.merchantId = merchant == null ? null : merchant.getId();
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }
}