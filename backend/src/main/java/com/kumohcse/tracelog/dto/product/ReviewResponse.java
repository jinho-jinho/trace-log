package com.kumohcse.tracelog.dto.product;

import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    String title,
    Integer rating,
    String content,
    Integer size,
    ReviewUserResponse user,
    LocalDateTime createdAt
) {
}
