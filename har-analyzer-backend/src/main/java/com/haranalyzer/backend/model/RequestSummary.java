package com.haranalyzer.backend.model;

public class RequestSummary {
    private String method;
    private String url;
    private int status;
    private String statusText;
    private double time;
    private long size;
    private String startedDateTime;

    // Constructors
    public RequestSummary() {
    }

    public RequestSummary(String method, String url, int status, String statusText, double time, long size,
            String startedDateTime) {
        this.method = method;
        this.url = url;
        this.status = status;
        this.statusText = statusText;
        this.time = time;
        this.size = size;
        this.startedDateTime = startedDateTime;
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

}