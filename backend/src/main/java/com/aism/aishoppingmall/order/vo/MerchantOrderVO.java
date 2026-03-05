package com.aism.aishoppingmall.order.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MerchantOrderVO {

    private Long orderId;
    private String orderNo;
    private Long buyerId;
    private String buyerName;
    private String status;
    private LocalDateTime createdAt;
    private Integer soldItems;
    private BigDecimal soldAmount;
    private List<MerchantOrderItemVO> items;
}
