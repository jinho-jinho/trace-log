package com.kumohcse.tracelog.service;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kumohcse.tracelog.domain.DetectionSetting;
import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.domain.SessionFeature;
import com.kumohcse.tracelog.domain.SessionFeatureContribution;
import com.kumohcse.tracelog.domain.SessionLlmSummary;
import com.kumohcse.tracelog.domain.SessionRequestLog;
import com.kumohcse.tracelog.dto.session.SessionAiAnalysisResponse;
import com.kumohcse.tracelog.repository.DetectionSettingRepository;
import com.kumohcse.tracelog.repository.SessionLlmSummaryRepository;
import com.kumohcse.tracelog.repository.SessionRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionLlmAnalysisService {

    private static final int MAX_LOG_COUNT = 80;
    private static final int MAX_CONTRIBUTION_COUNT = 20;

    private final SessionRepository sessionRepository;
    private final SessionLlmSummaryRepository sessionLlmSummaryRepository;
    private final DetectionSettingRepository detectionSettingRepository;
    private final ObjectMapper objectMapper;
    private final RestClient.Builder restClientBuilder;
    private final EntityManager entityManager;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.5-flash-lite}")
    private String model;

    @Transactional
    public SessionAiAnalysisResponse analyze(Long sessionId) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "GEMINI_API_KEY is not configured.");
        }

        Session session = sessionRepository.findDetailById(sessionId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Session not found."));
        DetectionSetting detectionSetting = detectionSettingRepository.findTopByOrderByAppliedAtDesc()
            .orElse(null);

        String analysisJson = requestGemini(buildSessionPayload(session, detectionSetting));
        SessionLlmSummary summary = sessionLlmSummaryRepository.findById(session.getId())
            .map(existing -> {
                existing.updateSummaryText(analysisJson);
                return existing;
            })
            .orElseGet(() -> {
                SessionLlmSummary created = SessionLlmSummary.create(session, analysisJson);
                entityManager.persist(created);
                return created;
            });
        entityManager.flush();

        return new SessionAiAnalysisResponse(session.getId(), analysisJson, summary.getCreatedAt());
    }

    private String requestGemini(Map<String, Object> payload) {
        try {
            String sessionJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(payload);
            Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", buildSystemPrompt()))),
                "contents", List.of(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", sessionJson))
                )),
                "generationConfig", Map.of(
                    "responseMimeType", "application/json",
                    "temperature", 0.2
                )
            );

            String response = restClientBuilder.build()
                .post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .body(body)
                .retrieve()
                .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new IllegalStateException("Gemini response text is empty.");
            }
            return textNode.asText();
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Gemini LLM analysis failed: " + ex.getMessage(), ex);
        }
    }

    private String buildSystemPrompt() {
        return """
            너는 웹 보안 로그 분석 보조 시스템이다.
            입력은 단일 사용자 세션 JSON이다.
            
            역할:
            - anomaly_score와 session_feature_contributions로 이상 탐지는 이미 수행됐다.
            - 너는 제공된 request_logs, session_feature, session_feature_contributions만 근거로 공격 유형, 근거, 불확실성, 운영 조치를 설명한다.
            - 없는 사실을 만들지 않는다.
            - shap_value가 양수이면 이상 점수 상승 근거, 음수이면 이상 점수 완화 근거로 해석한다.
            - evidence에는 가능하면 request_logs 근거와 session_feature_contributions 근거를 모두 포함한다.
            
            분류:
            - attack_type은 SQL Injection, XSS, Admin Probing, Path Traversal, Brute Force, Scanning, Normal, Unknown 중 하나만 사용한다.
            - 복수 징후가 있으면 근거가 가장 강한 유형을 attack_type으로, 나머지는 secondary_attack_types에 넣는다. 없으면 [].
            - 로그인 실패 1~2회만으로 Brute Force로 단정하지 않는다.
            - threshold가 입력에 없으면 0.75를 기준으로 한다.
            - anomaly_score가 높지만 공격 근거가 부족하면 Unknown을 선택한다.
            - Normal은 anomaly_score가 threshold 이하 또는 근접하고 의심 로그/feature가 거의 없을 때만 선택한다.
            - 근거 부족은 uncertainties에 적고, 없으면 [].
            
            confidence:
            - high: 명확한 로그 패턴과 feature_contributions 근거가 모두 있음
            - medium: 로그 패턴은 있으나 feature 근거가 제한적
            - low: 이상 징후는 있으나 유형 단정이 어려움
            - uncertain: 판단 불가
            
            출력:
            - 반드시 JSON 객체만 출력한다.
            - 설명 문장은 한국어로 작성한다.
            - attack_type, secondary_attack_types는 지정된 영문 라벨만 사용한다.
            - confidence는 high, medium, low, uncertain 중 하나만 사용한다.
            - URI, method, status code, feature_name은 원문 토큰을 유지한다.
            - recommended_actions는 evidence와 직접 연결된 조치만 작성한다.
            
            형식:
            {
              "attack_type": "...",
              "secondary_attack_types": ["..."],
              "confidence": "high|medium|low|uncertain",
              "summary": "짧은 한국어 요약",
              "evidence": ["로그/feature 기반 근거"],
              "uncertainties": ["불확실한 부분"],
              "recommended_actions": ["운영 조치"]
            }
            """;
    }

    private Map<String, Object> buildSessionPayload(Session session, DetectionSetting detectionSetting) {
        Map<String, Object> payload = new LinkedHashMap<>();
        Map<String, Object> sessionInfo = new LinkedHashMap<>();
        sessionInfo.put("id", session.getId());
        sessionInfo.put("ip", session.getIp());
        sessionInfo.put("userAgent", session.getUserAgent());
        sessionInfo.put("sessionStart", session.getSessionStart());
        sessionInfo.put("sessionEnd", session.getSessionEnd());
        sessionInfo.put("durationSec", session.getDurationSec());
        sessionInfo.put("requestCount", session.getRequestCount());
        sessionInfo.put("anomalyScore", session.getAnomalyScore());
        sessionInfo.put("thresholdValue", detectionSetting == null ? null : detectionSetting.getThresholdValue());
        sessionInfo.put("dangerScoreGap", detectionSetting == null ? null : detectionSetting.getDangerScoreGap());
        sessionInfo.put("analyzedAt", session.getAnalyzedAt());
        payload.put("session", sessionInfo);
        payload.put("metrics", toMetrics(session.getFeature()));
        payload.put("featureContributions", session.getFeatureContributions().stream()
            .sorted(Comparator.comparing(SessionFeatureContribution::getAbsShapValue, Comparator.nullsLast(BigDecimal::compareTo)).reversed())
            .limit(MAX_CONTRIBUTION_COUNT)
            .map(this::toContribution)
            .toList());
        payload.put("requestLogs", session.getRequestLogs().stream()
            .sorted(Comparator.comparing(SessionRequestLog::getSequenceNo))
            .limit(MAX_LOG_COUNT)
            .map(this::toLog)
            .toList());
        return payload;
    }

    private Map<String, Object> toMetrics(SessionFeature feature) {
        if (feature == null) {
            return Map.of();
        }
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("uniqueUrlCount", feature.getUniqueUrlCount());
        metrics.put("uniqueMethodCount", feature.getUniqueMethodCount());
        metrics.put("avgRequestIntervalSec", feature.getAvgRequestIntervalSec());
        metrics.put("maxRequestIntervalSec", feature.getMaxRequestIntervalSec());
        metrics.put("minRequestIntervalSec", feature.getMinRequestIntervalSec());
        metrics.put("error4xxRatio", feature.getError4xxRatio());
        metrics.put("error5xxRatio", feature.getError5xxRatio());
        metrics.put("status200Count", feature.getStatus200Count());
        metrics.put("loginCount", feature.getLoginCount());
        metrics.put("adminCount", feature.getAdminCount());
        metrics.put("avgUriLength", feature.getAvgUriLength());
        metrics.put("maxUriLength", feature.getMaxUriLength());
        metrics.put("avgQueryLength", feature.getAvgQueryLength());
        metrics.put("maxQueryLength", feature.getMaxQueryLength());
        metrics.put("specialCharCountSum", feature.getSpecialCharCountSum());
        metrics.put("specialCharRatioAvg", feature.getSpecialCharRatioAvg());
        metrics.put("suspiciousKeywordCountSum", feature.getSuspiciousKeywordCountSum());
        metrics.put("loginAttemptCount", feature.getLoginAttemptCount());
        return metrics;
    }

    private Map<String, Object> toContribution(SessionFeatureContribution contribution) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("featureName", contribution.getFeatureName());
        item.put("featureValue", contribution.getFeatureValue());
        item.put("shapValue", contribution.getShapValue());
        return item;
    }

    private Map<String, Object> toLog(SessionRequestLog log) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("sequenceNo", log.getSequenceNo());
        item.put("requestTime", log.getRequestTime());
        item.put("method", log.getMethod());
        item.put("uri", log.getUri());
        item.put("statusCode", log.getStatusCode());
        item.put("responseBytes", log.getResponseBytes());
        item.put("referer", log.getReferer());
        item.put("label", log.getLabel());
        item.put("endpoint", log.getEndpoint());
        item.put("queryString", log.getQueryString());
        item.put("isLoginEndpoint", log.getIsLoginEndpoint());
        item.put("isAdminEndpoint", log.getIsAdminEndpoint());
        item.put("isLoginAttempt", log.getIsLoginAttempt());
        item.put("rawLog", log.getDisplayRawLog());
        return item;
    }
}
