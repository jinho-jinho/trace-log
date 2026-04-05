package com.kumohcse.tracelog.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProductDetailResponse(
    @JsonProperty("_id")
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
