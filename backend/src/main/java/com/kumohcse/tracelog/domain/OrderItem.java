package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "order_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem extends BaseCreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "name_snapshot", nullable = false, length = 255)
    private String nameSnapshot;

    @Column(name = "price_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceSnapshot;

    @Column(name = "size_value", nullable = false)
    private Integer sizeValue;

    @Column(nullable = false)
    private Integer quantity;

    public static OrderItem create(
        OrderEntity order,
        Product product,
        String nameSnapshot,
        BigDecimal priceSnapshot,
        Integer sizeValue,
        Integer quantity
    ) {
        OrderItem item = new OrderItem();
        item.order = order;
        item.product = product;
        item.nameSnapshot = nameSnapshot;
        item.priceSnapshot = priceSnapshot;
        item.sizeValue = sizeValue;
        item.quantity = quantity;
        return item;
    }
}
