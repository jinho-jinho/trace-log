package com.kumohcse.tracelog.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Long id,
    List<OrderItemResponse> items,
    BigDecimal totalAmount,
    LocalDateTime paidAt,
    LocalDateTime createdAt
) {
}
