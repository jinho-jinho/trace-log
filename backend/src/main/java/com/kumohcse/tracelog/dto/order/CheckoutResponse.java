package com.kumohcse.tracelog.dto.order;

public record CheckoutResponse(
    String message,
    OrderResponse order
) {
}
