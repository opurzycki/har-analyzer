package com.haranalyzer.backend.service;

import com.haranalyzer.backend.model.AnalysisResult;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class HarAnalyzerService {

    private final HarHandler harHandler;

    public HarAnalyzerService(HarHandler harHandler) {
        this.harHandler = harHandler;
    }

    public AnalysisResult processHarFile(MultipartFile file) {
        try {
            return harHandler.process(file);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to process HAR file", e);
        }
    }
}