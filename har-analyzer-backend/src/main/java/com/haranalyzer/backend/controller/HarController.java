package com.haranalyzer.backend.controller;

import com.haranalyzer.backend.model.AnalysisResult;
import com.haranalyzer.backend.service.HarAnalyzerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

/**
 * REST Controller that handles HAR file upload requests.
 * This is the entry point for the frontend to interact with our backend.
 */
@RestController
@RequestMapping("/api/har")
@CrossOrigin(origins = "http://localhost:5173")

public class HarController {

    @Autowired
    private HarAnalyzerService harAnalyzerService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadHar(@RequestParam("file") MultipartFile file) {

        // Validation: Check if a file was actually uploaded
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a HAR file");
        }

        // Validation: Check if the file has the correct extension
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".har")) {
            return ResponseEntity.badRequest().body("File must be a .har file");
        }

        try {
            // Read the file content as a string (HAR files are JSON, which is text)
            String fileContent = new String(file.getBytes());

            // Use the service to analyze the HAR file
            AnalysisResult result = harAnalyzerService.analyzeHar(fileContent);

            // Return the analysis result as JSON
            // Spring automatically converts the AnalysisResult object to JSON
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            // If anything goes wrong (invalid JSON, parsing error, etc.), return error
            // message
            return ResponseEntity.internalServerError()
                    .body("Error processing file: " + e.getMessage());
        }
    }
}