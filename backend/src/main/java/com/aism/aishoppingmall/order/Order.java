package com.aism.aishoppingmall.order;

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
import java.time.LocalDateTime;

@TableName("app_orders")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("order_no")
    private String orderNo;

    @TableField("user_id")
    private Long userId;

    @TableField(exist = false)
    private User user;

    @TableField("total_items")
    private Integer totalItems;

    @TableField("total_amount")
    private BigDecimal totalAmount;

    private OrderStatus status;

    @TableField("created_at")
    private LocalDateTime createdAt;

    public Order(String orderNo, User user, Integer totalItems, BigDecimal totalAmount, OrderStatus status) {
        this.orderNo = orderNo;
        setUser(user);
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public void setUser(User user) {
        this.user = user;
        this.userId = user == null ? null : user.getId();
    }
}
