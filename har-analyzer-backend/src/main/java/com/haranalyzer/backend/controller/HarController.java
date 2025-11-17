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
    public ResponseEntity<?> uploadHar(@RequestParam("file") MultipartFile file) {
        try {
            // Delegate all work to the service
            AnalysisResult result = harAnalyzerService.processHarFile(file);

            // Return success response
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            // Handle validation errors (400 Bad Request)
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            // Handle other errors (500 Internal Server Error)
            return ResponseEntity.internalServerError()
                    .body("Error processing file: " + e.getMessage());
        }
    }
}