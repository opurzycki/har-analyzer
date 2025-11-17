package com.haranalyzer.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.haranalyzer.backend.model.AnalysisResult;
import com.haranalyzer.backend.model.RequestSummary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class HarAnalyzerService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final double SLOW_REQUEST_THRESHOLD = 1000.0;

    public AnalysisResult processHarFile(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a HAR file");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".har")) {
            throw new IllegalArgumentException("File must be a .har file");
        }

        String fileContent = new String(file.getBytes());

        return analyzeHar(fileContent);
    }

    public AnalysisResult analyzeHar(String harContent) throws Exception {
        JsonNode rootNode = objectMapper.readTree(harContent);
        JsonNode entriesNode = rootNode.path("log").path("entries");
        if (!entriesNode.isArray()) {
            throw new Exception("Invalid HAR format: 'entries' array not found");
        }

        int totalRequests = 0;
        int failedRequests = 0;
        int slowRequests = 0;
        double totalLoadTime = 0.0;
        long totalSize = 0;

        List<RequestSummary> failedRequestsList = new ArrayList<>();
        List<RequestSummary> slowRequestsList = new ArrayList<>();

        for (JsonNode entry : entriesNode) {
            totalRequests++;

            JsonNode request = entry.path("request");
            String method = request.path("method").asText();
            String url = request.path("url").asText();

            JsonNode response = entry.path("response");
            int status = response.path("status").asInt();
            String statusText = response.path("statusText").asText();

            double time = entry.path("time").asDouble();
            totalLoadTime += time;

            JsonNode sizeNode = response.path("content").path("size");
            long size = (sizeNode.isMissingNode() || !sizeNode.isNumber() || sizeNode.asLong() < 0) ? 0
                    : sizeNode.asLong();
            totalSize += size;

            String startedDateTime = entry.path("startedDateTime").asText();

            if (status >= 400) {
                failedRequests++;
                failedRequestsList
                        .add(createRequestSummary(method, url, status, statusText, time, size, startedDateTime));
            }

            if ((time > SLOW_REQUEST_THRESHOLD) && (status < 400)) {
                slowRequests++;
                slowRequestsList
                        .add(createRequestSummary(method, url, status, statusText, time, size, startedDateTime));
            }
        }

        return new AnalysisResult(
                totalRequests,
                failedRequests,
                slowRequests,
                totalLoadTime,
                totalSize,
                failedRequestsList,
                slowRequestsList);
    }

    private RequestSummary createRequestSummary(String method, String url, int status, String statusText, double time,
            long size, String startedDateTime) {
        return new RequestSummary(method, url, status, statusText, time, size, startedDateTime);
    }
}