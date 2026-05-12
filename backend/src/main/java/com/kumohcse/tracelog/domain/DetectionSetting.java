package com.kumohcse.tracelog.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "detection_settings")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DetectionSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "setting_id")
    private Long id;

    @Column(name = "threshold_value", nullable = false, precision = 8, scale = 6)
    private BigDecimal thresholdValue;

    @Column(name = "min_request_count", nullable = false)
    private Integer minRequestCount;

    @Column(name = "danger_score_gap", nullable = false, precision = 8, scale = 6)
    private BigDecimal dangerScoreGap;

    @CreationTimestamp
    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;
}
