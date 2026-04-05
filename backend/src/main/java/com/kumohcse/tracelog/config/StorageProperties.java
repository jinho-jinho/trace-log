package com.kumohcse.tracelog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
    String imageDir,
    String publicUrlPrefix
) {
}
