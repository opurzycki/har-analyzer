package com.haranalyzer.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.haranalyzer.backend.model.AnalysisResult;
import com.haranalyzer.backend.model.ResponseEntrySummary;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Component
public class HarHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final double SLOW_REQUEST_THRESHOLD = 1000.0;
    private static final int ERROR_STATUS_THRESHOLD = 400;

    public AnalysisResult process(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Please upload a HAR file");
            }

            String filename = file.getOriginalFilename();
            if (filename == null || !filename.endsWith(".har")) {
                throw new IllegalArgumentException("File must be a .har file");
            }

            String fileContent = new String(file.getBytes());

            JsonNode rootNode = objectMapper.readTree(fileContent);
            JsonNode entriesNode = rootNode.path("log").path("entries");
            if (!entriesNode.isArray()) {
                throw new IllegalArgumentException("Invalid HAR format: 'entries' array not found");
            }

            int totalRequests = 0;
            int failedRequests = 0;
            int slowRequests = 0;
            double totalLoadTime = 0.0;
            long totalSize = 0;

            List<ResponseEntrySummary> failedRequestsList = new ArrayList<>();
            List<ResponseEntrySummary> slowRequestsList = new ArrayList<>();
            List<ResponseEntrySummary> successRequestsList = new ArrayList<>();

            for (JsonNode entry : entriesNode) {
                totalRequests++;

                JsonNode request = entry.path("request");
                String method = request.path("method").asText("");
                String url = request.path("url").asText("");

                JsonNode response = entry.path("response");
                int status = response.path("status").asInt(0);
                String statusText = response.path("statusText").asText("");

                double time = entry.path("time").asDouble(0.0);
                totalLoadTime += time;

                JsonNode sizeNode = response.path("content").path("size");
                long rawSize = sizeNode.isNumber() ? sizeNode.asLong() : 0L;
                long size = rawSize < 0 ? 0L : rawSize;
                totalSize += size;

                String startedDateTime = entry.path("startedDateTime").asText("");

                String xTraceId = "";
                String externalTraceId = "";
                JsonNode headers = response.path("headers");
                if (headers.isArray()) {
                    for (JsonNode header : headers) {
                        String headerName = header.path("name").asText("");
                        if ("x-trace-id".equalsIgnoreCase(headerName)) {
                            xTraceId = header.path("value").asText("");
                        } else if ("external-trace-id".equalsIgnoreCase(headerName)) {
                            externalTraceId = header.path("value").asText("");
                        }
                    }
                }

                String requestBody = request.path("postData").path("text").asText("");
                String responseBody = response.path("content").path("text").asText("");

                ResponseEntrySummary summary = new ResponseEntrySummary(method, url, status, statusText, time, size,
                        startedDateTime, xTraceId, externalTraceId, requestBody, responseBody);

                if (status >= ERROR_STATUS_THRESHOLD) {
                    failedRequests++;
                    failedRequestsList.add(summary);
                } else {
                    successRequestsList.add(summary);
                    if (time > SLOW_REQUEST_THRESHOLD) {
                        slowRequests++;
                        slowRequestsList.add(summary);
                    }
                }
            }

            return new AnalysisResult(
                    totalRequests,
                    failedRequests,
                    slowRequests,
                    totalLoadTime,
                    totalSize,
                    failedRequestsList,
                    slowRequestsList,
                    successRequestsList);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to process HAR file", e);
        }
    }
}
