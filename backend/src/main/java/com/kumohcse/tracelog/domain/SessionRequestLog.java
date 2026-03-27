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

    @Column(name = "raw_log", columnDefinition = "TEXT")
    private String rawLog;
}
