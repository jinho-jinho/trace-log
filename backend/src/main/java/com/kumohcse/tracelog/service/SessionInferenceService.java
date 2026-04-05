package com.kumohcse.tracelog.service;

import org.springframework.stereotype.Service;

import com.kumohcse.tracelog.domain.Session;
import com.kumohcse.tracelog.dto.session.SessionInferenceRequest;
import com.kumohcse.tracelog.dto.session.SessionInferenceResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionInferenceService {

    private final SessionInferenceClient sessionInferenceClient;

    public SessionInferenceResponse analyze(Session session) {
        SessionInferenceRequest request = toRequest(session);
        return sessionInferenceClient.analyze(request);
    }

    private SessionInferenceRequest toRequest(Session session) {
        // TODO: session, session_feature 집계 결과를 요청 DTO로 변환한다.
        throw new UnsupportedOperationException("Session inference request mapping is not implemented yet.");
    }

    public void applyResult(Session session, SessionInferenceResponse response) {
        // TODO: anomalyScore, featureContributions 를 Session aggregate 에 반영한다.
        throw new UnsupportedOperationException("Session inference response application is not implemented yet.");
    }
}
