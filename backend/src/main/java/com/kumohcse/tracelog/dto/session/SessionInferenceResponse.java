package com.kumohcse.tracelog.dto.session;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
//임시
public record SessionInferenceResponse(
    @JsonProperty("anomaly_score")
    BigDecimal anomalyScore,
    @JsonProperty("session_feature_contributions")
    List<SessionFeatureContributionPayload> sessionFeatureContributions
) {

    public record SessionFeatureContributionPayload(
        String featureName,
        BigDecimal featureValue,
        BigDecimal shapValue,
        BigDecimal absShapValue
    ) {
    }
}
