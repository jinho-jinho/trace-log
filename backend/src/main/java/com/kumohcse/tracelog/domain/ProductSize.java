package com.kumohcse.tracelog.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
    name = "product_sizes",
    uniqueConstraints = @UniqueConstraint(name = "uq_product_sizes_product_id_size_value",
        columnNames = {"product_id", "size_value"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "size_value", nullable = false)
    private Integer sizeValue;

    public static ProductSize create(Product product, Integer sizeValue) {
        ProductSize size = new ProductSize();
        size.product = product;
        size.sizeValue = sizeValue;
        return size;
    }
}
