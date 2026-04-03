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
    name = "product_materials",
    uniqueConstraints = @UniqueConstraint(name = "uq_product_materials_product_id_material_name",
        columnNames = {"product_id", "material_name"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "material_name", nullable = false, length = 100)
    private String materialName;

    public static ProductMaterial create(Product product, String materialName) {
        ProductMaterial material = new ProductMaterial();
        material.product = product;
        material.materialName = materialName;
        return material;
    }
}
