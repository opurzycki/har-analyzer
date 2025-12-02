package com.haranalyzer.backend.model;

public class ResponseEntrySummary {
    private String method;
    private String url;
    private int status;
    private String statusText;
    private double time;
    private long size;
    private String startedDateTime;
    private String xTraceId;
    private String requestBody;
    private String responseBody;

    // Constructors
    public ResponseEntrySummary() {
    }

    public ResponseEntrySummary(String method, String url, int status, String statusText, double time, long size,
            String startedDateTime, String traceId, String requestBody, String responseBody) {
        this.method = method;
        this.url = url;
        this.status = status;
        this.statusText = statusText;
        this.time = time;
        this.size = size;
        this.startedDateTime = startedDateTime;
        this.xTraceId = traceId;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
    }

    // Getters and Setters
    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getStatusText() {
        return statusText;
    }

    public void setStatusText(String statusText) {
        this.statusText = statusText;
    }

    public double getTime() {
        return time;
    }

    public void setTime(double time) {
        this.time = time;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getStartedDateTime() {
        return startedDateTime;
    }

    public void setStartedDateTime(String startedDateTime) {
        this.startedDateTime = startedDateTime;
    }

    public String getxTraceId() {
        return xTraceId;
    }

    public void setxTraceId(String traceId) {
        this.xTraceId = traceId;
    }

    public String getRequestBody() {
        return requestBody;
    }

    public void setRequestBody(String requestBody) {
        this.requestBody = requestBody;
    }

    public String getResponseBody() {
        return responseBody;
    }

    public void setResponseBody(String responseBody) {
        this.responseBody = responseBody;
    }

}