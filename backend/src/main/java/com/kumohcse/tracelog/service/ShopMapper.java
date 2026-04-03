package com.kumohcse.tracelog.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.kumohcse.tracelog.domain.CartItem;
import com.kumohcse.tracelog.domain.OrderEntity;
import com.kumohcse.tracelog.domain.OrderItem;
import com.kumohcse.tracelog.domain.Product;
import com.kumohcse.tracelog.domain.Review;
import com.kumohcse.tracelog.dto.cart.CartItemResponse;
import com.kumohcse.tracelog.dto.order.OrderItemResponse;
import com.kumohcse.tracelog.dto.order.OrderResponse;
import com.kumohcse.tracelog.dto.product.ProductDetailResponse;
import com.kumohcse.tracelog.dto.product.ProductSummaryResponse;
import com.kumohcse.tracelog.dto.product.ReviewResponse;
import com.kumohcse.tracelog.dto.product.ReviewUserResponse;

@Component
public class ShopMapper {

    public ProductSummaryResponse toProductSummary(Product product) {
        return new ProductSummaryResponse(
            product.getId(),
            product.getName(),
            product.getShortDescription(),
            product.getImages().stream()
                .sorted(Comparator.comparing(image -> image.getSortOrder()))
                .map(image -> image.getImageUrl())
                .toList(),
            product.getCategories().stream()
                .map(category -> category.getCategoryName())
                .sorted()
                .toList(),
            product.getBasePrice(),
            product.getDiscountRate(),
            product.getSizes().stream()
                .map(size -> size.getSizeValue())
                .sorted()
                .toList(),
            product.getMaterials().stream()
                .map(material -> material.getMaterialName())
                .sorted()
                .toList(),
            product.getSaleStart(),
            product.getSaleEnd(),
            product.getTotalSold(),
            product.getCreatedAt()
        );
    }

    public ProductDetailResponse toProductDetail(Product product) {
        return new ProductDetailResponse(
            product.getId(),
            product.getName(),
            product.getShortDescription(),
            product.getImages().stream()
                .sorted(Comparator.comparing(image -> image.getSortOrder()))
                .map(image -> image.getImageUrl())
                .toList(),
            product.getCategories().stream()
                .map(category -> category.getCategoryName())
                .sorted()
                .toList(),
            product.getBasePrice(),
            product.getDiscountRate(),
            product.calculateFinalPrice(),
            product.getSizes().stream()
                .map(size -> size.getSizeValue())
                .sorted()
                .toList(),
            product.getMaterials().stream()
                .map(material -> material.getMaterialName())
                .sorted()
                .toList(),
            product.getSaleStart(),
            product.getSaleEnd(),
            product.getTotalSold(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }

    public ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getTitle(),
            review.getRating(),
            review.getContent(),
            review.getSizeValue(),
            new ReviewUserResponse(
                review.getUser().getId(),
                review.getUser().getName(),
                review.getUser().getEmail()
            ),
            review.getCreatedAt()
        );
    }

    public CartItemResponse toCartItemResponse(CartItem item) {
        Product product = item.getProduct();
        BigDecimal price = product.calculateFinalPrice();
        return new CartItemResponse(
            item.getId(),
            product.getId(),
            product.getName(),
            item.getSizeValue(),
            item.getQuantity(),
            price,
            product.getDiscountRate(),
            product.getImages().stream()
                .sorted(Comparator.comparing(image -> image.getSortOrder()))
                .map(image -> image.getImageUrl())
                .toList(),
            product.getCategories().stream()
                .map(category -> category.getCategoryName())
                .sorted()
                .toList()
        );
    }

    public OrderResponse toOrderResponse(OrderEntity order) {
        List<OrderItemResponse> items = order.getItems().stream()
            .sorted(Comparator.comparing(OrderItem::getId))
            .map(this::toOrderItemResponse)
            .toList();

        return new OrderResponse(
            order.getId(),
            items,
            order.getTotalAmount(),
            order.getPaidAt(),
            order.getCreatedAt()
        );
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getNameSnapshot(),
            item.getPriceSnapshot(),
            item.getSizeValue(),
            item.getQuantity()
        );
    }
}
