package com.kumohcse.tracelog.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.fastapi")
public record FastApiInferenceProperties(
    String baseUrl,
    String analyzePath,
    Duration connectTimeout,
    Duration readTimeout
) {
}
