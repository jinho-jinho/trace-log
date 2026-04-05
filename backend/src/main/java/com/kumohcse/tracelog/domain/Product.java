package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "products")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discount_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountRate = BigDecimal.ZERO;

    @Column(name = "sale_start")
    private LocalDateTime saleStart;

    @Column(name = "sale_end")
    private LocalDateTime saleEnd;

    @Column(name = "total_sold", nullable = false)
    private Integer totalSold = 0;

    @OrderBy("sortOrder ASC, id ASC")
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductImage> images = new LinkedHashSet<>();

    @OrderBy("id ASC")
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductCategory> categories = new LinkedHashSet<>();

    @OrderBy("sizeValue ASC, id ASC")
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductSize> sizes = new LinkedHashSet<>();

    @OrderBy("id ASC")
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductMaterial> materials = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private Set<CartItem> cartItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private Set<OrderItem> orderItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Review> reviews = new LinkedHashSet<>();

    public static Product create(
        String name,
        String shortDescription,
        BigDecimal basePrice,
        BigDecimal discountRate,
        LocalDateTime saleStart,
        LocalDateTime saleEnd
    ) {
        Product product = new Product();
        product.name = name;
        product.shortDescription = shortDescription;
        product.basePrice = basePrice;
        product.discountRate = discountRate == null ? BigDecimal.ZERO : discountRate;
        product.saleStart = saleStart;
        product.saleEnd = saleEnd;
        product.totalSold = 0;
        return product;
    }

    public void updateDiscount(BigDecimal discountRate, LocalDateTime saleStart, LocalDateTime saleEnd) {
        if (discountRate != null) {
            this.discountRate = discountRate;
        }
        this.saleStart = saleStart;
        this.saleEnd = saleEnd;
    }

    public void replaceImages(Collection<String> imageUrls) {
        this.images.clear();
        int sort = 0;
        for (String imageUrl : imageUrls) {
            this.images.add(ProductImage.create(this, imageUrl, sort++));
        }
    }

    public void replaceCategories(Collection<String> categoryNames) {
        this.categories.clear();
        for (String categoryName : categoryNames) {
            this.categories.add(ProductCategory.create(this, categoryName));
        }
    }

    public void replaceSizes(Collection<Integer> sizeValues) {
        Set<Integer> requestedSizes = new HashSet<>(sizeValues);
        this.sizes.removeIf(size -> !requestedSizes.contains(size.getSizeValue()));

        Set<Integer> existingSizes = this.sizes.stream()
            .map(ProductSize::getSizeValue)
            .collect(java.util.stream.Collectors.toSet());

        for (Integer sizeValue : requestedSizes) {
            if (!existingSizes.contains(sizeValue)) {
                this.sizes.add(ProductSize.create(this, sizeValue));
            }
        }
    }

    public void replaceMaterials(Collection<String> materialNames) {
        this.materials.clear();
        for (String materialName : materialNames) {
            this.materials.add(ProductMaterial.create(this, materialName));
        }
    }

    public BigDecimal calculateFinalPrice() {
        BigDecimal hundred = BigDecimal.valueOf(100);
        BigDecimal effectiveDiscount = discountRate == null ? BigDecimal.ZERO : discountRate;
        return basePrice.multiply(hundred.subtract(effectiveDiscount)).divide(hundred, 0, java.math.RoundingMode.FLOOR);
    }

    public boolean supportsSize(Integer sizeValue) {
        return sizes.stream().anyMatch(size -> size.getSizeValue().equals(sizeValue));
    }

    public void increaseTotalSold(int quantity) {
        this.totalSold += quantity;
    }
}
