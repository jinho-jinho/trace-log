package com.kumohcse.tracelog.service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kumohcse.tracelog.domain.DetectionSetting;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.SessionRequestLog;
import com.kumohcse.tracelog.dto.session.AnomalyScoreTrendPointResponse;
import com.kumohcse.tracelog.dto.session.SessionDetailResponse;
import com.kumohcse.tracelog.dto.session.SessionListResponse;
import com.kumohcse.tracelog.dto.session.SessionLogDetailResponse;
import com.kumohcse.tracelog.dto.session.TraceLogDashboardResponse;
import com.kumohcse.tracelog.repository.DetectionSettingRepository;
import com.kumohcse.tracelog.repository.SessionRepository;
import com.kumohcse.tracelog.repository.SessionRequestLogRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SessionService {

    private static final int DASHBOARD_RECENT_LIMIT = 4;
    private static final int DASHBOARD_TOP_LIMIT = 5;
    private static final int DEFAULT_LOG_PAGE_SIZE = 30;
    private static final int MAX_LOG_PAGE_SIZE = 100;

    private final SessionRepository sessionRepository;
    private final SessionRequestLogRepository sessionRequestLogRepository;
    private final DetectionSettingRepository detectionSettingRepository;
    private final TraceLogMapper traceLogMapper;

    public TraceLogDashboardResponse getDashboard(String rangeKey) {
        DetectionSetting detectionSetting = detectionSettingRepository.findTopByOrderByAppliedAtDesc()
            .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime headerStartAt = now.minusHours(24);
        BigDecimal threshold = detectionSetting == null ? BigDecimal.ZERO : detectionSetting.getThresholdValue();
        List<Session> recentSessions = sessionRepository.findAllStartedAfterOrderBySessionStartAsc(headerStartAt);

        List<Session> recentAnomalySessions = recentSessions.stream()
            .filter(session -> isAnomaly(session, threshold))
            .toList();

        List<Session> anomalySessions = recentAnomalySessions.stream()
            .sorted(Comparator.comparing(Session::getSessionStart).reversed())
            .limit(DASHBOARD_RECENT_LIMIT)
            .toList();

        List<Session> topAnomalySessions = sessionRepository
            .findBySessionStartGreaterThanEqualAndAnomalyScoreGreaterThanEqualOrderByAnomalyScoreDescSessionStartDesc(
                headerStartAt,
                threshold,
                PageRequest.of(0, DASHBOARD_TOP_LIMIT)
            );

        DashboardRange range = DashboardRange.from(rangeKey);
        List<AnomalyScoreTrendPointResponse> trend = buildTrend(now, range);

        long totalSessionCount = recentSessions.size();
        long anomalySessionCount = recentAnomalySessions.size();
        long anomalyIpCount = recentAnomalySessions.stream()
            .map(Session::getIp)
            .distinct()
            .count();
        BigDecimal averageAnomalyScore = recentSessions.stream()
            .map(Session::getAnomalyScore)
            .filter(score -> score != null)
            .reduce(BigDecimal::add)
            .map(sum -> sum.divide(BigDecimal.valueOf(recentSessions.stream()
                .map(Session::getAnomalyScore)
                .filter(score -> score != null)
                .count()), 6, RoundingMode.HALF_UP))
            .orElse(null);
        BigDecimal anomalySessionRatio = totalSessionCount == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(anomalySessionCount)
                .divide(BigDecimal.valueOf(totalSessionCount), 6, RoundingMode.HALF_UP);

        return traceLogMapper.toDashboardResponse(
            traceLogMapper.toDashboardHeader(
                averageAnomalyScore,
                anomalySessionCount,
                anomalySessionRatio,
                anomalyIpCount,
                detectionSetting == null ? "UNCONFIGURED" : "READY"
            ),
            trend,
            anomalySessions,
            topAnomalySessions
        );
    }

    public SessionListResponse getSessions(
        LocalDateTime startAt,
        LocalDateTime endAt,
        String ip,
        String sort
    ) {
        Specification<Session> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startAt != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("sessionStart"), startAt));
            }
            if (endAt != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("sessionEnd"), endAt));
            }
            if (ip != null && !ip.isBlank()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("ip")),
                    "%" + ip.trim().toLowerCase(Locale.ROOT) + "%"
                ));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };

        Sort requestSort = "score".equalsIgnoreCase(sort)
            ? Sort.by(Sort.Order.desc("anomalyScore"), Sort.Order.desc("sessionStart"))
            : Sort.by(Sort.Order.desc("sessionStart"));

        List<Session> sessions = sessionRepository.findAll(specification, requestSort);
        return traceLogMapper.toSessionListResponse(sessions.size(), sessions);
    }

    public SessionDetailResponse getSessionDetail(Long sessionId) {
        Session session = sessionRepository.findDetailById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Session not found."));
        DetectionSetting detectionSetting = detectionSettingRepository.findTopByOrderByAppliedAtDesc()
            .orElse(null);
        return traceLogMapper.toSessionDetail(session, detectionSetting);
    }

    public SessionLogDetailResponse getSessionLogDetail(Long sessionId, Integer page, Integer size) {
        if (!sessionRepository.existsById(sessionId)) {
            throw new ResponseStatusException(NOT_FOUND, "Session not found.");
        }

        int pageNumber = page == null ? 0 : page;
        int pageSize = size == null ? DEFAULT_LOG_PAGE_SIZE : size;
        if (pageNumber < 0) {
            throw new ResponseStatusException(BAD_REQUEST, "page must be greater than or equal to 0.");
        }
        if (pageSize < 1 || pageSize > MAX_LOG_PAGE_SIZE) {
            throw new ResponseStatusException(BAD_REQUEST, "size must be between 1 and 100.");
        }

        List<SessionRequestLog> pageLogs = sessionRequestLogRepository.findBySessionIdOrderBySequenceNoAsc(
            sessionId,
            PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Order.asc("sequenceNo")))
        );
        long totalCount = sessionRequestLogRepository.countBySessionId(sessionId);
        List<SessionRequestLog> allLogs = sessionRequestLogRepository.findBySessionIdOrderBySequenceNoAsc(sessionId);

        return new SessionLogDetailResponse(
            totalCount,
            pageLogs.stream()
                .map(traceLogMapper::toSessionRequestLogDetailItem)
                .toList(),
            allLogs.stream()
                .map(SessionRequestLog::getDisplayRawLog)
                .filter(rawLog -> rawLog != null && !rawLog.isBlank())
                .collect(java.util.stream.Collectors.joining(System.lineSeparator()))
        );
    }

    private boolean isAnomaly(Session session, BigDecimal threshold) {
        return session.getAnomalyScore() != null && session.getAnomalyScore().compareTo(threshold) >= 0;
    }

    private List<AnomalyScoreTrendPointResponse> buildTrend(LocalDateTime now, DashboardRange range) {
        LocalDateTime startAt = now.minus(range.window());
        List<Session> sessions = sessionRepository.findAllStartedAfterOrderBySessionStartAsc(startAt);
        List<AnomalyScoreTrendPointResponse> points = new ArrayList<>();

        LocalDateTime bucketStart = startAt;
        for (int i = 0; i < range.bucketCount(); i++) {
            LocalDateTime bucketEnd = bucketStart.plus(range.bucketSize());
            List<BigDecimal> scores = new ArrayList<>();

            for (Session session : sessions) {
                LocalDateTime sessionStart = session.getSessionStart();
                if ((sessionStart.isEqual(bucketStart) || sessionStart.isAfter(bucketStart))
                    && sessionStart.isBefore(bucketEnd)
                    && session.getAnomalyScore() != null) {
                    scores.add(session.getAnomalyScore());
                }
            }

            BigDecimal averageScore = scores.isEmpty()
                ? null
                : scores.stream()
                    .reduce(BigDecimal::add)
                    .map(sum -> sum.divide(BigDecimal.valueOf(scores.size()), 6, RoundingMode.HALF_UP))
                    .orElse(null);

            points.add(traceLogMapper.toTrendPoint(bucketStart, bucketEnd, averageScore));
            bucketStart = bucketEnd;
        }

        return points;
    }

    private enum DashboardRange {
        LAST_6_HOURS(Duration.ofHours(6), Duration.ofMinutes(30), 12),
        LAST_24_HOURS(Duration.ofHours(24), Duration.ofHours(1), 24),
        LAST_7_DAYS(Duration.ofDays(7), Duration.ofDays(1), 7);

        private final Duration window;
        private final Duration bucketSize;
        private final int bucketCount;

        DashboardRange(Duration window, Duration bucketSize, int bucketCount) {
            this.window = window;
            this.bucketSize = bucketSize;
            this.bucketCount = bucketCount;
        }

        public static DashboardRange from(String value) {
            if ("6h".equalsIgnoreCase(value)) {
                return LAST_6_HOURS;
            }
            if ("7d".equalsIgnoreCase(value)) {
                return LAST_7_DAYS;
            }
            return LAST_24_HOURS;
        }

        public Duration window() {
            return window;
        }

        public Duration bucketSize() {
            return bucketSize;
        }

        public int bucketCount() {
            return bucketCount;
        }
    }
}
