package com.kumohcse.tracelog.domain;

import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "carts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cart extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OrderBy("id ASC")
    @OneToMany(mappedBy = "cart", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CartItem> items = new LinkedHashSet<>();

    public static Cart create(User user) {
        Cart cart = new Cart();
        cart.user = user;
        return cart;
    }

    public CartItem findItem(Long itemId) {
        return items.stream()
            .filter(item -> item.getId().equals(itemId))
            .findFirst()
            .orElse(null);
    }

    public CartItem findItem(Long productId, Integer sizeValue) {
        return items.stream()
            .filter(item -> item.getProduct().getId().equals(productId) && item.getSizeValue().equals(sizeValue))
            .findFirst()
            .orElse(null);
    }

    public void addItem(Product product, Integer sizeValue, Integer quantity) {
        CartItem existing = findItem(product.getId(), sizeValue);
        if (existing != null) {
            existing.increaseQuantity(quantity);
            return;
        }
        items.add(CartItem.create(this, product, sizeValue, quantity));
    }

    public void removeItem(Long itemId) {
        items.removeIf(item -> item.getId().equals(itemId));
    }

    public void clearItems() {
        items.clear();
    }
}
