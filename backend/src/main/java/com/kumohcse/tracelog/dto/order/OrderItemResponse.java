package com.kumohcse.tracelog.dto.order;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long id,
    Long productId,
    String nameSnapshot,
    BigDecimal priceSnapshot,
    Integer size,
    Integer quantity
) {
}
