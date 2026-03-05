package com.aism.aishoppingmall.admin;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class AdminProductRequest {

    @NotNull(message = "商户不能为空。")
    private Long merchantId;

    @NotBlank(message = "商品名称不能为空。")
    @Size(max = 140, message = "商品名称不能超过 140 个字符。")
    private String name;

    @NotBlank(message = "商品标识不能为空。")
    @Size(max = 160, message = "商品标识不能超过 160 个字符。")
    private String slug;

    @NotBlank(message = "商品描述不能为空。")
    @Size(max = 1000, message = "商品描述不能超过 1000 个字符。")
    private String description;

    @NotNull(message = "价格不能为空。")
    @DecimalMin(value = "0.01", message = "价格必须大于 0。")
    private BigDecimal price;

    @NotNull(message = "评分不能为空。")
    @DecimalMin(value = "0.0", message = "评分不能小于 0。")
    @DecimalMax(value = "5.0", message = "评分不能大于 5。")
    private BigDecimal rating;

    @Size(max = 40, message = "标签不能超过 40 个字符。")
    private String badge;

    @Size(max = 255, message = "图片地址不能超过 255 个字符。")
    private String imageUrl;

    @NotBlank(message = "分类不能为空。")
    private String categorySlug;

    @NotNull(message = "库存不能为空。")
    @Min(value = 0, message = "库存不能小于 0。")
    private Integer stockQuantity;

    @NotNull(message = "展示排序不能为空。")
    @Min(value = 1, message = "展示排序至少为 1。")
    private Integer displayOrder;

    @NotNull(message = "是否上架不能为空。")
    private Boolean active;

    @NotNull(message = "是否首页推荐不能为空。")
    private Boolean featured;

    public Long getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Long merchantId) {
        this.merchantId = merchantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategorySlug() {
        return categorySlug;
    }

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }
}
