package com.kumohcse.tracelog.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kumohcse.tracelog.dto.session.PipelineSessionImportRequest;
import com.kumohcse.tracelog.dto.session.PipelineSessionImportResponse;
import com.kumohcse.tracelog.service.PipelineSessionImportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/internal/tracelog")
@RequiredArgsConstructor
public class PipelineSessionImportController {

    private final PipelineSessionImportService pipelineSessionImportService;

    @PostMapping("/sessions")
    public PipelineSessionImportResponse importSession(
        @Valid @RequestBody PipelineSessionImportRequest request
    ) {
        return pipelineSessionImportService.importSession(request);
    }
}
