package com.kumohcse.tracelog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductIdAndSizeValue(Long cartId, Long productId, Integer sizeValue);
}
