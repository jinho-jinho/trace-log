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
    name = "product_categories",
    uniqueConstraints = @UniqueConstraint(name = "uq_product_categories_product_id_category_name",
        columnNames = {"product_id", "category_name"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "category_name", nullable = false, length = 100)
    private String categoryName;

    public static ProductCategory create(Product product, String categoryName) {
        ProductCategory category = new ProductCategory();
        category.product = product;
        category.categoryName = categoryName;
        return category;
    }
}
