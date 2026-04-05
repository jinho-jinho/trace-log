package com.kumohcse.tracelog.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.kumohcse.tracelog.config.FastApiInferenceProperties;
import com.kumohcse.tracelog.dto.session.SessionInferenceRequest;
import com.kumohcse.tracelog.dto.session.SessionInferenceResponse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FastApiSessionInferenceClient implements SessionInferenceClient {

    private final RestClient fastApiRestClient;
    private final FastApiInferenceProperties properties;

    @Override
    public SessionInferenceResponse analyze(SessionInferenceRequest request) {
        return fastApiRestClient.post()
            .uri(properties.analyzePath())
            .body(request)
            .retrieve()
            .body(SessionInferenceResponse.class);
    }
}
