package com.aism.aishoppingmall.order;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderItemRepository {

    private final OrderItemMapper orderItemMapper;

    public OrderItemRepository(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public List<OrderItem> findAllByOrderIdOrderByIdAsc(Long orderId) {
        return orderItemMapper.findAllByOrderIdOrderByIdAsc(orderId);
    }

    public void saveAll(List<OrderItem> orderItems) {
        for (OrderItem orderItem : orderItems) {
            if (orderItem.getOrderId() == null && orderItem.getOrder() != null) {
                orderItem.setOrderId(orderItem.getOrder().getId());
            }
            orderItemMapper.insert(orderItem);
        }
    }
}
