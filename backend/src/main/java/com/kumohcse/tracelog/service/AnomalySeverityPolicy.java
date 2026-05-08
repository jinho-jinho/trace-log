package com.kumohcse.tracelog.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.kumohcse.tracelog.domain.Notification;

@Component
public class AnomalySeverityPolicy {

    public static final String SEVERITY_NORMAL = "normal";
    public static final String SEVERITY_UNCONFIGURED = "unconfigured";

    private static final BigDecimal DEFAULT_DANGER_SCORE_GAP = new BigDecimal("0.300000");

    public BigDecimal scoreGap(BigDecimal anomalyScore, BigDecimal thresholdValue) {
        if (anomalyScore == null || thresholdValue == null) {
            return null;
        }
        return anomalyScore.subtract(thresholdValue);
    }

    public String resolveSeverity(BigDecimal anomalyScore, BigDecimal thresholdValue, BigDecimal dangerScoreGap) {
        BigDecimal scoreGap = scoreGap(anomalyScore, thresholdValue);
        if (scoreGap == null) {
            return SEVERITY_UNCONFIGURED;
        }
        if (scoreGap.signum() < 0) {
            return SEVERITY_NORMAL;
        }
        BigDecimal dangerGap = dangerScoreGap == null ? DEFAULT_DANGER_SCORE_GAP : dangerScoreGap;
        if (scoreGap.compareTo(dangerGap) >= 0) {
            return Notification.SEVERITY_DANGER;
        }
        return Notification.SEVERITY_SUSPICIOUS;
    }

    public String toLabel(String severity) {
        if (Notification.SEVERITY_DANGER.equals(severity)) {
            return "\uC704\uD5D8";
        }
        if (Notification.SEVERITY_SUSPICIOUS.equals(severity)) {
            return "\uC758\uC2EC";
        }
        if (SEVERITY_NORMAL.equals(severity)) {
            return "\uC815\uC0C1 \uBC94\uC704";
        }
        return "\uAE30\uC900 \uBBF8\uC124\uC815";
    }
}
