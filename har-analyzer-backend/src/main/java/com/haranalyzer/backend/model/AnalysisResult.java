package com.haranalyzer.backend.model;

import java.util.List;

public class AnalysisResult {
    private int totalRequests;
    private int failedRequests;
    private int slowRequests;
    private double totalLoadTime;
    private long totalSize;
    private List<ResponseEntrySummary> failedRequestsList;
    private List<ResponseEntrySummary> slowRequestsList;

    // Constructors
    public AnalysisResult() {
    }

    public AnalysisResult(int totalRequests, int failedRequests, int slowRequests,
            double totalLoadTime, long totalSize,
            List<ResponseEntrySummary> failedRequestsList,
            List<ResponseEntrySummary> slowRequestsList) {
        this.totalRequests = totalRequests;
        this.failedRequests = failedRequests;
        this.slowRequests = slowRequests;
        this.totalLoadTime = totalLoadTime;
        this.totalSize = totalSize;
        this.failedRequestsList = failedRequestsList;
        this.slowRequestsList = slowRequestsList;
    }

    // Getters and Setters
    public int getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(int totalRequests) {
        this.totalRequests = totalRequests;
    }

    public int getFailedRequests() {
        return failedRequests;
    }

    public void setFailedRequests(int failedRequests) {
        this.failedRequests = failedRequests;
    }

    public int getSlowRequests() {
        return slowRequests;
    }

    public void setSlowRequests(int slowRequests) {
        this.slowRequests = slowRequests;
    }

    public double getTotalLoadTime() {
        return totalLoadTime;
    }

    public void setTotalLoadTime(double totalLoadTime) {
        this.totalLoadTime = totalLoadTime;
    }

    public long getTotalSize() {
        return totalSize;
    }

    public void setTotalSize(long totalSize) {
        this.totalSize = totalSize;
    }

    public List<ResponseEntrySummary> getFailedRequestsList() {
        return failedRequestsList;
    }

    public void setFailedRequestsList(List<ResponseEntrySummary> failedRequestsList) {
        this.failedRequestsList = failedRequestsList;
    }

    public List<ResponseEntrySummary> getSlowRequestsList() {
        return slowRequestsList;
    }

    public void setSlowRequestsList(List<ResponseEntrySummary> slowRequestsList) {
        this.slowRequestsList = slowRequestsList;
    }
}