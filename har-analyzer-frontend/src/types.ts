export interface ResponseEntrySummary {
    method: string;
    url: string;
    status: number;
    statusText: string;
    time: number;
    size: number;
    startedDateTime: string;
    xTraceId: string;
    externalTraceId: string;
    xCallerCompanyId: string;
    requestBody?: string;
    responseBody?: string;
    requestHeaders: { name: string; value: string }[];
    responseHeaders: { name: string; value: string }[];
}

export interface AnalysisResult {
    totalRequests: number;
    failedRequests: number;
    slowRequests: number;
    totalLoadTime: number;
    totalSize: number;
    failedRequestsList: ResponseEntrySummary[];
    slowRequestsList: ResponseEntrySummary[];
    successRequestsList: ResponseEntrySummary[];
}
