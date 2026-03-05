package com.aism.aishoppingmall.order;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@TableName("order_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

    public void setOrder(Order order) {
        this.order = order;
        this.orderId = order == null ? null : order.getId();
    }
}
