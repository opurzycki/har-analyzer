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
    private String externalTraceId;
    private String requestBody;
    private String responseBody;
    private String xCallerCompanyId;
    private java.util.List<Header> requestHeaders;
    private java.util.List<Header> responseHeaders;

    // Constructors
    public ResponseEntrySummary() {
    }

    public ResponseEntrySummary(String method, String url, int status, String statusText, double time, long size,
            String startedDateTime, String xTraceId, String externalTraceId, String requestBody, String responseBody,
            String xCallerCompanyId, java.util.List<Header> requestHeaders, java.util.List<Header> responseHeaders) {
        this.method = method;
        this.url = url;
        this.status = status;
        this.statusText = statusText;
        this.time = time;
        this.size = size;
        this.startedDateTime = startedDateTime;
        this.xTraceId = xTraceId;
        this.externalTraceId = externalTraceId;
        this.requestBody = requestBody;
        this.responseBody = responseBody;
        this.xCallerCompanyId = xCallerCompanyId;
        this.requestHeaders = requestHeaders;
        this.responseHeaders = responseHeaders;
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

    public String getExternalTraceId() {
        return externalTraceId;
    }

    public void setExternalTraceId(String externalTraceId) {
        this.externalTraceId = externalTraceId;
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

    public String getxCallerCompanyId() {
        return xCallerCompanyId;
    }

    public void setxCallerCompanyId(String xCallerCompanyId) {
        this.xCallerCompanyId = xCallerCompanyId;
    }

    public java.util.List<Header> getRequestHeaders() {
        return requestHeaders;
    }

    public void setRequestHeaders(java.util.List<Header> requestHeaders) {
        this.requestHeaders = requestHeaders;
    }

    public java.util.List<Header> getResponseHeaders() {
        return responseHeaders;
    }

    public void setResponseHeaders(java.util.List<Header> responseHeaders) {
        this.responseHeaders = responseHeaders;
    }
}