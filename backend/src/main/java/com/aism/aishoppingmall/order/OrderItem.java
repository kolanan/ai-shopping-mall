package com.aism.aishoppingmall.order;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;

@TableName("order_items")
public class OrderItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("order_id")
    private Long orderId;

    @TableField(exist = false)
    private Order order;

    @TableField("product_id")
    private Long productId;

    @TableField("product_name")
    private String productName;

    private String category;

    @TableField("unit_price")
    private BigDecimal unitPrice;

    private Integer quantity;

    @TableField("line_total")
    private BigDecimal lineTotal;

    protected OrderItem() {
    }

    public OrderItem(
            Order order,
            Long productId,
            String productName,
            String category,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal lineTotal
    ) {
        setOrder(order);
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.lineTotal = lineTotal;
    }

    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
        this.orderId = order == null ? null : order.getId();
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }
}