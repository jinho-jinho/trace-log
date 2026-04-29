package com.kumohcse.tracelog.service;

import com.kumohcse.tracelog.dto.session.SessionInferenceRequest;
import com.kumohcse.tracelog.dto.session.SessionInferenceResponse;

public interface SessionInferenceClient {

    SessionInferenceResponse analyze(SessionInferenceRequest request);
}
