package com.kumohcse.tracelog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.OrderEntity;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<OrderEntity> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
