package com.haranalyzer.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.haranalyzer.backend.model.AnalysisResult;
import com.haranalyzer.backend.model.RequestSummary;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service class responsible for parsing and analyzing HAR files.
 * It tells Spring this is a service component that can be injected into other
 * classes.
 */
@Service
public class HarAnalyzerService {

    // ObjectMapper is Jackson's main class for reading/writing JSON
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Threshold for considering a request "slow" (in milliseconds)
    private static final double SLOW_REQUEST_THRESHOLD = 1000.0;

    public AnalysisResult analyzeHar(String harContent) throws Exception {

        // Parse the JSON string into a tree structure we can navigate
        JsonNode rootNode = objectMapper.readTree(harContent);

        // HAR files have a structure: { "log": { "entries": [...] } }
        // Navigate to the "entries" array which contains all HTTP requests
        JsonNode entriesNode = rootNode.path("log").path("entries");

        // Check if entries exist and is actually an array
        if (!entriesNode.isArray()) {
            throw new Exception("Invalid HAR format: 'entries' array not found");
        }

        // Initialize counters and lists for our analysis
        int totalRequests = 0;
        int failedRequests = 0;
        int slowRequests = 0;
        double totalLoadTime = 0.0;
        long totalSize = 0;

        // Lists to hold details of failed and slow requests
        List<RequestSummary> failedRequestsList = new ArrayList<>();
        List<RequestSummary> slowRequestsList = new ArrayList<>();

        // Loop through each entry (HTTP request) in the HAR file
        for (JsonNode entry : entriesNode) {
            totalRequests++;

            // Extract request information
            JsonNode request = entry.path("request");
            String method = request.path("method").asText(); // GET, POST, etc.
            String url = request.path("url").asText(); // Full URL

            // Extract response information
            JsonNode response = entry.path("response");
            int status = response.path("status").asInt();
            String statusText = response.path("statusText").asText();

            // Extract timing information
            double time = entry.path("time").asDouble(); // Total request time in milliseconds
            totalLoadTime += time;

            // Extract size information
            long size = response.path("content").path("size").asLong(); // Response size in bytes
            totalSize += size;

            // Extract when the request started (ISO 8601 format)
            String startedDateTime = entry.path("startedDateTime").asText();

            // Check if this is a failed request (HTTP status 400 or higher means error)
            if (status >= 400) {
                failedRequests++;
                // Create a RequestSummary object and add it to the failed requests list
                failedRequestsList.add(new RequestSummary(
                        method,
                        url,
                        status,
                        statusText,
                        time,
                        size,
                        startedDateTime));
            }

            // Check if this is a slow request (took longer than 1 second)
            if ((time > SLOW_REQUEST_THRESHOLD) && (status < 400)) {
                slowRequests++;
                // Create a RequestSummary object and add it to the slow requests list
                slowRequestsList.add(new RequestSummary(
                        method,
                        url,
                        status,
                        statusText,
                        time,
                        size,
                        startedDateTime));
            }
        }

        // Create and return the analysis result with all the stats we collected
        return new AnalysisResult(
                totalRequests,
                failedRequests,
                slowRequests,
                totalLoadTime,
                totalSize,
                failedRequestsList,
                slowRequestsList);
    }
}