package com.kumohcse.tracelog.dto.product;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record AdminProductSizesUpdateRequest(
    @NotEmpty List<Integer> availableSizes
) {
}
