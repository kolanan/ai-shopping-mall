package com.aism.aishoppingmall.order.vo;

import com.aism.aishoppingmall.order.OrderItem;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MerchantOrderItemVO {

    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    public static MerchantOrderItemVO from(OrderItem item) {
        MerchantOrderItemVO vo = new MerchantOrderItemVO();
        vo.setProductId(item.getProductId());
        vo.setProductName(item.getProductName());
        vo.setQuantity(item.getQuantity());
        vo.setUnitPrice(item.getUnitPrice());
        vo.setLineTotal(item.getLineTotal());
        return vo;
    }
}
