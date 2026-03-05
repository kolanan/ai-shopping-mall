package com.aism.aishoppingmall.admin.vo;

import com.aism.aishoppingmall.product.Product;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminProductVO {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal rating;
    private String badge;
    private String imageUrl;
    private String categorySlug;
    private String categoryName;
    private Integer stockQuantity;
    private Integer displayOrder;
    private Boolean active;
    private Boolean featured;
    private Long merchantId;
    private String merchantName;

    public static AdminProductVO from(Product product) {
        AdminProductVO vo = new AdminProductVO();
        vo.setId(product.getId());
        vo.setName(product.getName());
        vo.setSlug(product.getSlug());
        vo.setDescription(product.getDescription());
        vo.setPrice(product.getPrice());
        vo.setRating(product.getRating());
        vo.setBadge(product.getBadge());
        vo.setImageUrl(product.getImageUrl());
        vo.setCategorySlug(product.getCategory().getSlug());
        vo.setCategoryName(product.getCategory().getName());
        vo.setStockQuantity(product.getStockQuantity());
        vo.setDisplayOrder(product.getDisplayOrder());
        vo.setActive(product.getActive());
        vo.setFeatured(product.getFeatured());
        vo.setMerchantId(product.getMerchant() == null ? null : product.getMerchant().getId());
        vo.setMerchantName(product.getMerchant() == null ? "平台自营" : product.getMerchant().getFullName());
        return vo;
    }
}
