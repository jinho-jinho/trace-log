package com.kumohcse.tracelog.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminProductCreateRequest(
    @NotBlank @Size(max = 255) String name,
    String shortDescription,
    @NotNull @DecimalMin("0.0") BigDecimal basePrice,
    @NotNull @DecimalMin("0.0") @Max(100) BigDecimal discountRate,
    LocalDateTime saleStart,
    LocalDateTime saleEnd,
    List<String> categories,
    List<String> materials,
    List<Integer> availableSizes
) {
}
