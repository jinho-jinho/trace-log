package com.kumohcse.tracelog.domain;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    private static final DateTimeFormatter RAW_LOG_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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

    public static SessionRequestLog create(
        Integer sequenceNo,
        LocalDateTime requestTime,
        String method,
        String uri,
        Integer statusCode,
        Long responseBytes,
        String referer,
        String source,
        String label,
        String endpoint,
        String queryString,
        Integer uriLength,
        Integer queryLength,
        Integer specialCharCount,
        java.math.BigDecimal specialCharRatio,
        Integer suspiciousKeywordCount,
        Boolean isLoginEndpoint,
        Boolean isAdminEndpoint,
        Boolean isLoginAttempt,
        String rawLog
    ) {
        SessionRequestLog log = new SessionRequestLog();
        log.sequenceNo = sequenceNo;
        log.requestTime = requestTime;
        log.method = method;
        log.uri = uri;
        log.statusCode = statusCode;
        log.responseBytes = responseBytes;
        log.referer = referer;
        log.source = source;
        log.label = label;
        log.endpoint = endpoint;
        log.queryString = queryString;
        log.uriLength = uriLength;
        log.queryLength = queryLength;
        log.specialCharCount = specialCharCount;
        log.specialCharRatio = specialCharRatio;
        log.suspiciousKeywordCount = suspiciousKeywordCount;
        log.isLoginEndpoint = isLoginEndpoint;
        log.isAdminEndpoint = isAdminEndpoint;
        log.isLoginAttempt = isLoginAttempt;
        log.rawLog = rawLog;
        return log;
    }

    void assignSession(Session session) {
        this.session = session;
        if (rawLog == null || rawLog.isBlank()) {
            rawLog = buildSyntheticRawLog();
        }
    }

    public String getDisplayRawLog() {
        return rawLog == null || rawLog.isBlank() ? buildSyntheticRawLog() : rawLog;
    }

    private String buildSyntheticRawLog() {
        String timeText = requestTime == null ? "-" : requestTime.format(RAW_LOG_TIME_FORMATTER);
        String statusText = statusCode == null ? "-" : statusCode.toString();
        String bytesText = responseBytes == null ? "-" : responseBytes.toString();
        String refererText = referer == null || referer.isBlank() ? "-" : referer;
        String userAgentText = session == null || session.getUserAgent() == null ? "-" : session.getUserAgent();
        return "%s - - [%s] \"%s %s HTTP/1.1\" %s %s \"%s\" \"%s\"".formatted(
            session == null ? "-" : session.getIp(),
            timeText,
            method == null ? "-" : method,
            uri == null ? "-" : uri,
            statusText,
            bytesText,
            refererText,
            userAgentText
        );
    }
}
