import { useState } from "react";
import {
    BarChart3,
    AlertTriangle,
    Clock,
    Database,
    Globe,
    ArrowLeft
} from "lucide-react";
import type { AnalysisResult, ResponseEntrySummary } from "../types";
import { cn } from "../lib/utils";

interface AnalysisDashboardProps {
    result: AnalysisResult;
    onReset: () => void;
}

export function AnalysisDashboard({ result, onReset }: AnalysisDashboardProps) {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Analyze another file
                </button>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Analysis Complete
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Requests"
                    value={result.totalRequests}
                    icon={<Globe className="w-4 h-4" />}
                    className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                />
                <StatCard
                    title="Failed Requests"
                    value={result.failedRequests}
                    icon={<AlertTriangle className="w-4 h-4" />}
                    className={cn(
                        result.failedRequests > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted/50 text-muted-foreground"
                    )}
                />
                <StatCard
                    title="Slow Requests"
                    value={result.slowRequests}
                    icon={<Clock className="w-4 h-4" />}
                    className={cn(
                        result.slowRequests > 0 ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-muted/50 text-muted-foreground"
                    )}
                />
                <StatCard
                    title="Total Load Time"
                    value={formatTime(result.totalLoadTime)}
                    icon={<BarChart3 className="w-4 h-4" />}
                    className="bg-purple-500/10 text-purple-500 border-purple-500/20"
                />
                <StatCard
                    title="Total Size"
                    value={formatBytes(result.totalSize)}
                    icon={<Database className="w-4 h-4" />}
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                />
            </div>

            <div className="flex flex-col gap-8">
                {/* Failed Requests List */}
                <RequestList
                    title="Failed Requests"
                    requests={result.failedRequestsList}
                    type="error"
                    emptyMessage="No failed requests found. Great job!"
                />

                {/* Slow Requests List */}
                <RequestList
                    title="Slow Requests (>1s)"
                    requests={result.slowRequestsList}
                    type="warning"
                    emptyMessage="No slow requests found. Performance is optimal!"
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, className }: { title: string, value: string | number, icon: React.ReactNode, className?: string }) {
    return (
        <div className={cn("p-6 rounded-2xl border flex flex-col gap-2 transition-all hover:scale-105", className)}>
            <div className="flex items-center justify-between opacity-80">
                <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
        </div>
    );
}

function RequestList({ title, requests, type, emptyMessage }: { title: string, requests: ResponseEntrySummary[], type: 'error' | 'warning', emptyMessage: string }) {
    return (
        <div className="space-y-4 w-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                {type === 'error' ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <Clock className="w-5 h-5 text-orange-500" />}
                {title}
                <span className="text-xs font-normal text-muted-foreground ml-auto bg-muted px-2 py-1 rounded-full">
                    {requests.length} items
                </span>
            </h3>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {requests.map((req, i) => (
                            <RequestItem key={i} req={req} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RequestItem({ req }: { req: ResponseEntrySummary }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'Headers' | 'Payload' | 'Preview' | 'Response'>('Headers');

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div
            className={cn(
                "transition-all border-b border-border/50 last:border-0",
                isExpanded ? "bg-muted/30" : "hover:bg-muted/30"
            )}
        >
            {/* Header - Always visible and consistent */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between gap-4 p-3 cursor-pointer group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Method Badge */}
                    <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded uppercase w-16 text-center shrink-0",
                        req.method === 'GET' && "bg-green-500/10 text-green-500",
                        req.method === 'POST' && "bg-blue-500/10 text-blue-500",
                        req.method === 'PUT' && "bg-purple-500/10 text-purple-500",
                        req.method === 'DELETE' && "bg-red-500/10 text-red-500",
                        req.method === 'PATCH' && "bg-orange-500/10 text-orange-500",
                    )}>
                        {req.method}
                    </span>

                    {/* Status and Text */}
                    <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full shrink-0",
                            req.status >= 400 ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"
                        )}>
                            {req.status}
                        </span>
                        <span className="text-sm text-muted-foreground truncate font-medium">
                            {req.statusText || (req.status >= 400 ? "Error" : "OK")}
                        </span>
                    </div>
                </div>

                {/* Time and Chevron */}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground w-16 text-right">
                        {Math.round(req.time)}ms
                    </span>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-border/50">
                    {/* Tabs */}
                    <div className="flex items-center px-2 border-b border-border/50 bg-muted/20 overflow-x-auto">
                        {['Headers', 'Payload', 'Preview', 'Response'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                                    activeTab === tab
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 bg-background/50">
                        {activeTab === 'Headers' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                                    <div className="font-semibold text-muted-foreground">Request URL</div>
                                    <div className="font-mono text-xs break-all select-all">{req.url}</div>

                                    <div className="font-semibold text-muted-foreground">Request Method</div>
                                    <div className="font-mono text-xs text-foreground">{req.method}</div>

                                    <div className="font-semibold text-muted-foreground">Status Code</div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "inline-block w-2 h-2 rounded-full",
                                            req.status >= 400 ? "bg-destructive" : "bg-green-500"
                                        )} />
                                        <span className="text-xs font-mono">{req.status} {req.statusText}</span>
                                    </div>

                                    <div className="font-semibold text-muted-foreground">Date</div>
                                    <div className="text-xs font-mono">{formatDate(req.startedDateTime)}</div>

                                    {req.xTraceId && (
                                        <>
                                            <div className="font-semibold text-muted-foreground">x-trace-id</div>
                                            <div className="font-mono text-xs select-all">{req.xTraceId}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Payload' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar">
                                {req.requestBody ? req.requestBody : (
                                    <span className="text-muted-foreground italic">No payload data available.</span>
                                )}
                            </div>
                        )}

                        {activeTab === 'Preview' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar">
                                {(() => {
                                    if (!req.responseBody) return <span className="text-muted-foreground italic">Preview not available.</span>;
                                    try {
                                        const json = JSON.parse(req.responseBody);
                                        return JSON.stringify(json, null, 2);
                                    } catch (e) {
                                        return req.responseBody;
                                    }
                                })()}
                            </div>
                        )}

                        {activeTab === 'Response' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar">
                                {req.responseBody ? req.responseBody : (
                                    <span className="text-muted-foreground italic">Response body not available.</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
