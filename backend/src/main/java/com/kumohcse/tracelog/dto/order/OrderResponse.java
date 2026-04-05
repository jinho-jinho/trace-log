package com.kumohcse.tracelog.dto.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OrderResponse(
    @JsonProperty("_id")
    Long id,
    List<OrderItemResponse> items,
    BigDecimal totalAmount,
    LocalDateTime paidAt,
    LocalDateTime createdAt
) {
}
