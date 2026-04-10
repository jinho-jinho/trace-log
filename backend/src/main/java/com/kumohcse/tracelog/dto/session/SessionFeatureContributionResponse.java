package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;

public record SessionFeatureContributionResponse(
    String featureName,
    BigDecimal featureValue,
    BigDecimal shapValue
) {
}
