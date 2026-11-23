package com.kumohcse.tracelog.service;

import org.springframework.stereotype.Component;

import com.kumohcse.tracelog.domain.Notification;

@Component
public class AnomalySeverityPolicy {

    public String toLabel(String severity) {
        if (Notification.SEVERITY_DANGER.equals(severity)) {
            return "\uC704\uD5D8";
        }
        if (Notification.SEVERITY_SUSPICIOUS.equals(severity)) {
            return "\uC758\uC2EC";
        }
        if ("normal".equals(severity)) {
            return "\uC815\uC0C1 \uBC94\uC704";
        }
        return "\uAE30\uC900 \uBBF8\uC124\uC815";
    }
}
