package com.kumohcse.tracelog.service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kumohcse.tracelog.domain.DetectionSetting;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.SessionFeature;
import com.kumohcse.tracelog.domain.SessionFeatureContribution;
import com.kumohcse.tracelog.domain.SessionRequestLog;
import com.kumohcse.tracelog.dto.session.PipelineSessionImportRequest;
import com.kumohcse.tracelog.dto.session.PipelineSessionImportResponse;
import com.kumohcse.tracelog.repository.DetectionSettingRepository;
import com.kumohcse.tracelog.repository.SessionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PipelineSessionImportService {

    private final SessionRepository sessionRepository;
    private final DetectionSettingRepository detectionSettingRepository;
    private final NotificationService notificationService;

    @Transactional
    public PipelineSessionImportResponse importSession(PipelineSessionImportRequest request) {
        SessionLookupResult lookupResult = findOrCreateSession(request);
        Session session = lookupResult.session();

        session.updateSummary(
            request.ip(),
            request.userAgent(),
            request.sessionStart(),
            request.sessionEnd(),
            request.durationSec(),
            request.requestCount()
        );
        session.applyAnalysis(
            request.anomalyScore(),
            request.analyzedAt() == null && request.anomalyScore() != null ? LocalDateTime.now() : request.analyzedAt()
        );

        session = sessionRepository.saveAndFlush(session);

        if (request.requestLogs() != null) {
            if (!lookupResult.created()) {
                session.replaceRequestLogs(Set.of());
                sessionRepository.flush();
            }
            session.replaceRequestLogs(toRequestLogs(request));
        }
        if (request.sessionFeature() != null) {
            session.replaceFeature(toFeature(request.sessionFeature()));
        }
        if (request.sessionFeatureContributions() != null) {
            if (!lookupResult.created()) {
                session.replaceFeatureContributions(Set.of());
                sessionRepository.flush();
            }
            session.replaceFeatureContributions(toFeatureContributions(request));
        }

        DetectionSetting detectionSetting = detectionSettingRepository.findTopByOrderByAppliedAtDesc()
            .orElse(null);
        boolean notificationCreated = notificationService.createAnomalyNotificationsIfNeeded(session, detectionSetting);

        return new PipelineSessionImportResponse(
            session.getId(),
            request.externalSessionId(),
            session.getAnomalyScore(),
            lookupResult.created(),
            notificationCreated
        );
    }

    private SessionLookupResult findOrCreateSession(PipelineSessionImportRequest request) {
        return sessionRepository.findByIpAndUserAgentAndSessionStartAndSessionEnd(
                request.ip(),
                request.userAgent(),
                request.sessionStart(),
                request.sessionEnd()
            )
            .map(session -> new SessionLookupResult(session, false))
            .orElseGet(() -> new SessionLookupResult(Session.create(
                request.ip(),
                request.userAgent(),
                request.sessionStart(),
                request.sessionEnd(),
                request.durationSec(),
                request.requestCount()
            ), true));
    }

    private Set<SessionRequestLog> toRequestLogs(PipelineSessionImportRequest request) {
        Set<SessionRequestLog> logs = new LinkedHashSet<>();
        for (PipelineSessionImportRequest.RequestLogPayload log : request.requestLogs()) {
            logs.add(SessionRequestLog.create(
                log.sequenceNo(),
                log.requestTime(),
                log.method(),
                log.uri(),
                log.statusCode(),
                log.responseBytes(),
                log.referer(),
                log.source(),
                log.label(),
                log.endpoint(),
                log.queryString(),
                log.uriLength(),
                log.queryLength(),
                log.specialCharCount(),
                log.specialCharRatio(),
                log.suspiciousKeywordCount(),
                log.isLoginEndpoint(),
                log.isAdminEndpoint(),
                log.isLoginAttempt(),
                log.rawLog()
            ));
        }
        return logs;
    }

    private SessionFeature toFeature(PipelineSessionImportRequest.FeaturePayload feature) {
        return SessionFeature.create(
            feature.uniqueUrlCount(),
            feature.uniqueMethodCount(),
            feature.avgRequestIntervalSec(),
            feature.maxRequestIntervalSec(),
            feature.minRequestIntervalSec(),
            feature.error4xxRatio(),
            feature.error5xxRatio(),
            feature.status200Count(),
            feature.avgBytes(),
            feature.maxBytes(),
            feature.stdBytes(),
            feature.urlSequence(),
            feature.statusSequence(),
            feature.methodSequence(),
            feature.loginCount(),
            feature.adminCount(),
            feature.avgUriLength(),
            feature.maxUriLength(),
            feature.avgQueryLength(),
            feature.maxQueryLength(),
            feature.specialCharCountSum(),
            feature.specialCharRatioAvg(),
            feature.suspiciousKeywordCountSum(),
            feature.loginAttemptCount(),
            feature.featureCalculatedAt()
        );
    }

    private Set<SessionFeatureContribution> toFeatureContributions(PipelineSessionImportRequest request) {
        Set<SessionFeatureContribution> contributions = new LinkedHashSet<>();
        for (PipelineSessionImportRequest.FeatureContributionPayload contribution : request.sessionFeatureContributions()) {
            contributions.add(SessionFeatureContribution.create(
                contribution.featureName(),
                contribution.featureValue(),
                contribution.shapValue(),
                contribution.absShapValue()
            ));
        }
        return contributions;
    }

    private record SessionLookupResult(Session session, boolean created) {
    }
}
