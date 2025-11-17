package com.haranalyzer.backend.controller;

import com.haranalyzer.backend.model.AnalysisResult;
import com.haranalyzer.backend.service.HarAnalyzerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/har")
@CrossOrigin(origins = "http://localhost:5173")

public class HarController {

    private final HarAnalyzerService harAnalyzerService;

    public HarController(HarAnalyzerService harAnalyzerService) {
        this.harAnalyzerService = harAnalyzerService;
    }

    @PostMapping("/upload")
    public ResponseEntity<AnalysisResult> uploadHar(@RequestParam("file") MultipartFile file) {
        AnalysisResult result = harAnalyzerService.processHarFile(file);
        // TODO: error handling
        return ResponseEntity.ok(result);
    }
}