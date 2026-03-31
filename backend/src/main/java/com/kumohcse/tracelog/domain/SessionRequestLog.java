package com.kumohcse.tracelog.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
    name = "session_request_logs",
    uniqueConstraints = @UniqueConstraint(name = "uk_session_request_logs_session_sequence",
        columnNames = {"session_id", "sequence_no"})
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionRequestLog extends BaseCreatedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_log_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "request_time", nullable = false)
    private LocalDateTime requestTime;

    @Column(nullable = false, length = 10)
    private String method;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String uri;

    @Column(name = "status_code")
    private Integer statusCode;

    @Column(name = "response_bytes")
    private Long responseBytes;

    @Column(columnDefinition = "TEXT")
    private String referer;


    @Column(length = 20)
    private String source;

    @Column(length = 50)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String endpoint;

    @Column(name = "query_string", columnDefinition = "TEXT")
    private String queryString;

    @Column(name = "uri_length")
    private Integer uriLength;

    @Column(name = "query_length")
    private Integer queryLength;

    @Column(name = "special_char_count")
    private Integer specialCharCount;

    @Column(name = "special_char_ratio", precision = 10, scale = 6)
    private java.math.BigDecimal specialCharRatio;

    @Column(name = "suspicious_keyword_count")
    private Integer suspiciousKeywordCount;

    @Column(name = "is_login_endpoint")
    private Boolean isLoginEndpoint;

    @Column(name = "is_admin_endpoint")
    private Boolean isAdminEndpoint;

    @Column(name = "is_login_attempt")
    private Boolean isLoginAttempt;

    @Column(name = "raw_log", columnDefinition = "TEXT")
    private String rawLog;
}
