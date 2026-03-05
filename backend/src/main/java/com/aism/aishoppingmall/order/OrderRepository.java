package com.aism.aishoppingmall.order;

import com.aism.aishoppingmall.user.UserRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {

    private final OrderMapper orderMapper;
    private final UserRepository userRepository;

    public OrderRepository(OrderMapper orderMapper, UserRepository userRepository) {
        this.orderMapper = orderMapper;
        this.userRepository = userRepository;
    }

    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(hydrate(orderMapper.selectById(id)));
    }

    public List<Order> findAllByUserIdOrderByCreatedAtDescIdDesc(Long userId) {
        return orderMapper.findAllByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(this::hydrate)
                .toList();
    }

    public Order save(Order order) {
        if (order.getUserId() == null && order.getUser() != null) {
            order.setUserId(order.getUser().getId());
        }
        if (order.getId() == null) {
            if (order.getCreatedAt() == null) {
                order.setCreatedAt(LocalDateTime.now());
            }
            orderMapper.insert(order);
        } else {
            orderMapper.updateById(order);
        }
        return hydrate(order);
    }

    private Order hydrate(Order order) {
        if (order == null) {
            return null;
        }
        if (order.getUser() == null && order.getUserId() != null) {
            userRepository.findById(order.getUserId()).ifPresent(order::setUser);
        }
        return order;
    }
}
