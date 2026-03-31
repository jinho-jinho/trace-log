package com.kumohcse.tracelog.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductDetailResponse(
    Long id,
    String name,
    String shortDescription,
    List<String> images,
    List<String> categories,
    BigDecimal basePrice,
    BigDecimal discountRate,
    BigDecimal finalPrice,
    List<Integer> availableSizes,
    List<String> materials,
    LocalDateTime saleStart,
    LocalDateTime saleEnd,
    Integer totalSold,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
