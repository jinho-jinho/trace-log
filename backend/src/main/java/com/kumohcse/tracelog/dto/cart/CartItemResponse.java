package com.kumohcse.tracelog.dto.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartItemResponse(
    Long id,
    Long productId,
    String name,
    Integer size,
    Integer quantity,
    BigDecimal price,
    BigDecimal discountRate,
    List<String> images,
    List<String> categories
) {
}
