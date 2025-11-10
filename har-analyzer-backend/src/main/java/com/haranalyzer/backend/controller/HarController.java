package com.haranalyzer.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/har")
@CrossOrigin(origins = "http://localhost:5173")

public class HarController {

    @PostMapping("/upload")
    public ResponseEntity<String> uploadHar(@RequestParam("file") MultipartFile file) {

        // Check if file is empty
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a HAR file");
        }

        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".har")) {
            return ResponseEntity.badRequest().body("File must be a .har file");
        }

        try {
            // For now, just return success
            String fileContent = new String(file.getBytes());
            return ResponseEntity.ok("HAR file uploaded successfully! Size: " + fileContent.length() + " bytes");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing file: " + e.getMessage());
        }
    }
}