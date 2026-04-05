package com.kumohcse.tracelog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kumohcse.tracelog.domain.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

    @EntityGraph(attributePaths = {
        "user",
        "items",
        "items.product",
        "items.product.images",
        "items.product.categories"
    })
    Optional<Cart> findByUserId(Long userId);
}
