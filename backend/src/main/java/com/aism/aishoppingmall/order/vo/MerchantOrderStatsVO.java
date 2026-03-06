package com.aism.aishoppingmall.order.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class MerchantOrderStatsVO {

    private Integer soldItems;
    private Integer orderCount;
    private Integer pendingShipmentCount;
    private BigDecimal soldAmount;
}
