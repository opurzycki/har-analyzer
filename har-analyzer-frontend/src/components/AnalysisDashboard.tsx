import { useState } from "react";
import {
    BarChart3,
    AlertTriangle,
    Clock,
    Database,
    Globe,
    ArrowLeft,
    CheckCircle2,
    Layers,
    ArrowUpDown,
    MessageCircleQuestion
} from "lucide-react";
import type { AnalysisResult, ResponseEntrySummary } from "../types";
import { cn } from "../lib/utils";
import { JsonViewer } from "./JsonViewer";

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

    const [activeListTab, setActiveListTab] = useState<'all' | 'failed' | 'slow' | 'success'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: 'time' | 'status' | 'method', direction: 'asc' | 'desc' }>({ key: 'time', direction: 'desc' });

    const toggleSort = (key: 'time' | 'status' | 'method') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const sortRequests = (requests: ResponseEntrySummary[]) => {
        return [...requests].sort((a, b) => {
            const modifier = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.key === 'time') return (new Date(a.startedDateTime).getTime() - new Date(b.startedDateTime).getTime()) * modifier;
            if (sortConfig.key === 'status') return (a.status - b.status) * modifier;
            if (sortConfig.key === 'method') return a.method.localeCompare(b.method) * modifier;
            return 0;
        });
    };

    // Combine all requests for the "All" tab
    const allRequests = [...result.failedRequestsList, ...(result.successRequestsList || [])];

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
            {/* Stats Overview */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm">
                <StatItem
                    label="Total Requests"
                    value={result.totalRequests}
                    icon={<Globe className="w-4 h-4 text-blue-500" />}
                />
                <div className="w-px h-8 bg-border hidden lg:block" />
                <StatItem
                    label="Failed Requests"
                    value={result.failedRequests}
                    icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
                    highlight={result.failedRequests > 0 ? "error" : undefined}
                />
                <div className="w-px h-8 bg-border hidden lg:block" />
                <StatItem
                    label="Slow Requests"
                    value={result.slowRequests}
                    icon={<Clock className="w-4 h-4 text-orange-500" />}
                    highlight={result.slowRequests > 0 ? "warning" : undefined}
                />
                <div className="w-px h-8 bg-border hidden lg:block" />
                <StatItem
                    label="Total Load Time"
                    value={formatTime(result.totalLoadTime)}
                    icon={<BarChart3 className="w-4 h-4 text-purple-500" />}
                />
                <div className="w-px h-8 bg-border hidden lg:block" />
                <StatItem
                    label="Total Size"
                    value={formatBytes(result.totalSize)}
                    icon={<Database className="w-4 h-4 text-emerald-500" />}
                />
            </div>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
                        <button
                            onClick={() => setActiveListTab('all')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                                activeListTab === 'all'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Layers className="w-4 h-4" />
                            All Requests
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                {result.totalRequests}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveListTab('failed')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                                activeListTab === 'failed'
                                    ? "border-destructive text-destructive"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Failed
                            <span className="bg-destructive/10 text-destructive text-xs px-2 py-0.5 rounded-full">
                                {result.failedRequests}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveListTab('slow')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                                activeListTab === 'slow'
                                    ? "border-orange-500 text-orange-500"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Clock className="w-4 h-4" />
                            Slow
                            <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-0.5 rounded-full">
                                {result.slowRequests}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveListTab('success')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                                activeListTab === 'success'
                                    ? "border-green-500 text-green-500"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            OK
                            <span className="bg-green-500/10 text-green-500 text-xs px-2 py-0.5 rounded-full">
                                {result.successRequestsList?.length || 0}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs bg-muted/50 p-1 rounded-lg shrink-0">
                        <span className="px-2 text-muted-foreground font-medium">Sort by:</span>
                        {['time', 'status', 'method'].map((key) => (
                            <button
                                key={key}
                                onClick={() => toggleSort(key as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 capitalize font-medium",
                                    sortConfig.key === key
                                        ? "bg-background shadow text-foreground"
                                        : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {key}
                                {sortConfig.key === key && (
                                    <ArrowUpDown className={cn(
                                        "w-3 h-3 transition-transform",
                                        sortConfig.direction === 'desc' && "rotate-180"
                                    )} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {activeListTab === 'all' && (
                        <RequestList
                            title="All Requests"
                            requests={sortRequests(allRequests)}
                            type="all"
                            emptyMessage="No requests found."
                        />
                    )}

                    {activeListTab === 'failed' && (
                        <RequestList
                            title="Failed Requests"
                            requests={sortRequests(result.failedRequestsList)}
                            type="error"
                            emptyMessage="No failed requests found. Great job!"
                        />
                    )}

                    {activeListTab === 'slow' && (
                        <RequestList
                            title="Slow Requests (>1s)"
                            requests={sortRequests(result.slowRequestsList)}
                            type="warning"
                            emptyMessage="No slow requests found. Performance is optimal!"
                        />
                    )}

                    {activeListTab === 'success' && (
                        <RequestList
                            title="OK Requests"
                            requests={sortRequests(result.successRequestsList || [])}
                            type="success"
                            emptyMessage="No successful requests found."
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, icon, highlight }: { label: string, value: string | number, icon: React.ReactNode, highlight?: 'error' | 'warning' }) {
    return (
        <div className="flex items-center gap-4 min-w-[140px]">
            <div className={cn(
                "p-2.5 rounded-lg shrink-0 transition-colors",
                highlight === 'error' ? "bg-destructive/10" :
                    highlight === 'warning' ? "bg-orange-500/10" :
                        "bg-muted"
            )}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
                <span className={cn(
                    "text-xl font-bold tabular-nums tracking-tight",
                    highlight === 'error' && "text-destructive",
                    highlight === 'warning' && "text-orange-500"
                )}>
                    {value}
                </span>
            </div>
        </div>
    );
}

function RequestList({ title, requests, type, emptyMessage }: { title: string, requests: ResponseEntrySummary[], type: 'all' | 'error' | 'warning' | 'success', emptyMessage: string }) {
    const getIcon = () => {
        switch (type) {
            case 'all': return <Layers className="w-5 h-5 text-primary" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-destructive" />;
            case 'warning': return <Clock className="w-5 h-5 text-orange-500" />;
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        }
    };

    return (
        <div className="space-y-4 w-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                {getIcon()}
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
            return new Date(dateString).toLocaleString('pl-PL', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }) + ' GMT';
        } catch (e) {
            return dateString;
        }
    };

    // Format time only (HH:MM:SS)
    const formatClockTime = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleTimeString('pl-PL', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch (e) {
            return "";
        }
    };

    // Format request data for Glean
    const formatGleanMessage = () => {
        const sections: string[] = [];

        sections.push('Analyze the following error from the HAR file:');
        sections.push('');
        sections.push('## Method');
        sections.push(req.method);
        sections.push('');
        sections.push('## Error Code / Error Message');
        sections.push(`${req.status} ${req.statusText || 'Error'}`);
        sections.push('');
        sections.push('## URL');
        sections.push(req.url);
        sections.push('');
        sections.push('## Request Date/Time');
        sections.push(formatDate(req.startedDateTime));
        sections.push('');

        sections.push('## Request Duration');
        sections.push(`${Math.round(req.time)}ms`);
        sections.push('');

        if (req.xTraceId) {
            sections.push('## x-trace-id');
            sections.push(req.xTraceId);
            sections.push('');
        }

        if (req.externalTraceId) {
            sections.push('## external-trace-id');
            sections.push(req.externalTraceId);
            sections.push('');
        }

        sections.push('## Payload (Request Body)');
        if (req.requestBody) {
            try {
                const json = JSON.parse(req.requestBody);
                sections.push('```json');
                sections.push(JSON.stringify(json, null, 2));
                sections.push('```');
            } catch {
                sections.push(req.requestBody);
            }
        } else {
            sections.push('No payload data available.');
        }

        return sections.join('\n');
    };

    // Handle Ask Glean button click
    const handleAskGlean = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent expanding the row
        const message = formatGleanMessage();
        const gleanUrl = `https://app.glean.com/chat?chatAgent=DEFAULT&message=${encodeURIComponent(message)}`;
        window.open(gleanUrl, '_blank');
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

                {/* Ask Glean button, Time, and Chevron */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Ask Glean Button - Only for failed requests */}
                    {req.status >= 400 && (
                        <>
                            <button
                                onClick={handleAskGlean}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                title="Ask Glean about this error"
                            >
                                <MessageCircleQuestion className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Ask Glean</span>
                            </button>
                            <span className="w-px h-3 bg-border" />
                        </>
                    )}
                    <span className="text-xs text-muted-foreground/70 font-mono hidden sm:inline-block">
                        {formatClockTime(req.startedDateTime)}
                    </span>
                    <span className="w-px h-3 bg-border hidden sm:block" />
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
                                <div className="grid grid-cols-[120px_1fr] gap-2 text-sm items-baseline">
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
                                    {req.externalTraceId && (
                                        <>
                                            <div className="font-semibold text-muted-foreground">external-trace-id</div>
                                            <div className="font-mono text-xs select-all">{req.externalTraceId}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Payload' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                {(() => {
                                    if (!req.requestBody) return <span className="text-muted-foreground italic">No payload data available.</span>;
                                    try {
                                        const json = JSON.parse(req.requestBody);
                                        return <JsonViewer data={json} initialExpanded={true} />;
                                    } catch (e) {
                                        return req.requestBody;
                                    }
                                })()}
                            </div>
                        )}

                        {activeTab === 'Preview' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                {(() => {
                                    if (!req.responseBody) return <span className="text-muted-foreground italic">Preview not available.</span>;
                                    try {
                                        const json = JSON.parse(req.responseBody);
                                        return <JsonViewer data={json} initialExpanded={true} />;
                                    } catch (e) {
                                        return req.responseBody;
                                    }
                                })()}
                            </div>
                        )}

                        {activeTab === 'Response' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar p-2">
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
