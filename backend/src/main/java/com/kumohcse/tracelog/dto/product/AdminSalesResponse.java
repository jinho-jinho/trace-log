package com.kumohcse.tracelog.dto.product;

import java.math.BigDecimal;

public record AdminSalesResponse(
    Long productId,
    String name,
    Long quantity,
    BigDecimal revenue
) {
}
