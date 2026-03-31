package com.kumohcse.tracelog.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;

public record AdminProductDiscountUpdateRequest(
    @DecimalMin("0.0") @Max(100) BigDecimal discountRate,
    LocalDateTime saleStart,
    LocalDateTime saleEnd
) {
}
