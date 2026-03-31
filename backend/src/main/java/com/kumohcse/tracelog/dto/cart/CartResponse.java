package com.kumohcse.tracelog.dto.cart;

import java.util.List;

public record CartResponse(
    List<CartItemResponse> items
) {
}
