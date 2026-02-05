import { useState, useMemo } from "react";
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
    ChevronUp,
    ChevronDown,
    MessageCircleQuestion,
    Search
} from "lucide-react";
import type { AnalysisResult, ResponseEntrySummary } from "../types";
import { cn } from "../lib/utils";
import { JsonViewer } from "./JsonViewer";
import { HighlightText } from "./HighlightText";
import { useEffect, useRef } from "react";

interface AnalysisDashboardProps {
    result: AnalysisResult;
    onReset: () => void;
}

export function AnalysisDashboard({ result, onReset }: AnalysisDashboardProps) {
    // Combine all requests for the "All" tab - Defined early for use in memo
    const allRequests = useMemo(() => [...result.failedRequestsList, ...(result.successRequestsList || [])], [result]);

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

    // State for search matches
    interface SearchMatch {
        reqId: number; // Index in the filtered list
        location: 'url' | 'method' | 'status' | 'header' | 'payload' | 'response' | 'trace';
        path?: string; // For JSON paths or Header names
        value: string; // The matched value
    }

    const [searchQuery, setSearchQuery] = useState("");
    const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    // Debounced search query
    const [debouncedQuery, setDebouncedQuery] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Helper to find all matches in JSON
    const findMatchesInJson = (data: any, path: string = ""): { path: string, value: string }[] => {
        let matches: { path: string, value: string }[] = [];
        if (!data) return matches;

        const query = debouncedQuery.toLowerCase();

        if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                const currentPath = path ? `${path}.${key}` : key;

                // Check key
                if (key.toLowerCase().includes(query)) {
                    matches.push({ path: currentPath, value: key });
                }

                // Check value or recurse
                if (typeof value === 'object' && value !== null) {
                    matches = [...matches, ...findMatchesInJson(value, currentPath)];
                } else if (String(value).toLowerCase().includes(query)) {
                    matches.push({ path: currentPath, value: String(value) });
                }
            });
        }
        return matches;
    };

    // Filter requests and calculate matches
    const filteredRequests = useMemo(() => {
        if (!debouncedQuery) {
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return allRequests;
        }

        const query = debouncedQuery.toLowerCase();
        let newMatches: SearchMatch[] = [];

        const filtered = allRequests.filter((req, index) => {
            let hasMatch = false;
            const reqId = index;

            // Simple fields
            if (req.url.toLowerCase().includes(query)) {
                newMatches.push({ reqId, location: 'url', value: req.url });
                hasMatch = true;
            }
            if (req.method.toLowerCase().includes(query)) {
                newMatches.push({ reqId, location: 'method', value: req.method });
                hasMatch = true;
            }
            if (req.status.toString().includes(query) || (req.statusText && req.statusText.toLowerCase().includes(query))) {
                newMatches.push({ reqId, location: 'status', value: `${req.status} ${req.statusText}` });
                hasMatch = true;
            }
            if (req.xTraceId && req.xTraceId.toLowerCase().includes(query)) {
                newMatches.push({ reqId, location: 'trace', value: req.xTraceId });
                hasMatch = true;
            }
            // Headers
            if (req.requestHeaders) {
                req.requestHeaders.forEach(h => {
                    if (h.name.toLowerCase().includes(query) || h.value.toLowerCase().includes(query)) {
                        newMatches.push({ reqId, location: 'header', path: h.name, value: h.value });
                        hasMatch = true;
                    }
                });
            }
            if (req.responseHeaders) {
                req.responseHeaders.forEach(h => {
                    if (h.name.toLowerCase().includes(query) || h.value.toLowerCase().includes(query)) {
                        newMatches.push({ reqId, location: 'header', path: h.name, value: h.value });
                        hasMatch = true;
                    }
                });
            }

            // JSON Bodies
            if (req.requestBody) {
                try {
                    const json = JSON.parse(req.requestBody);
                    const jsonMatches = findMatchesInJson(json);
                    if (jsonMatches.length > 0) {
                        jsonMatches.forEach(m => newMatches.push({ reqId, location: 'payload', path: m.path, value: m.value }));
                        hasMatch = true;
                    }
                } catch {
                    if (req.requestBody.toLowerCase().includes(query)) {
                        newMatches.push({ reqId, location: 'payload', value: req.requestBody });
                        hasMatch = true;
                    }
                }
            }
            if (req.responseBody) {
                try {
                    const json = JSON.parse(req.responseBody);
                    const jsonMatches = findMatchesInJson(json);
                    if (jsonMatches.length > 0) {
                        jsonMatches.forEach(m => newMatches.push({ reqId, location: 'response', path: m.path, value: m.value }));
                        hasMatch = true;
                    }
                } catch {
                    if (req.responseBody.toLowerCase().includes(query)) {
                        newMatches.push({ reqId, location: 'response', value: req.responseBody });
                        hasMatch = true;
                    }
                }
            }

            return hasMatch;
        });

        // Map original indices to filtered indices for matches if we were strictly filtering logic
        // But here we are filtering ALL requests then showing matches valid for the visible set.
        // Actually, if we filter the list, the matches indices must align with the FILTERED list.
        // Let's re-run match finding on just the filtered list to keep indices aligned simpler.

        // Revised approach: First filter, then find matches on the filtered set.
        return filtered;
    }, [debouncedQuery, allRequests]);

    const sortRequests = (requests: ResponseEntrySummary[]) => {
        return [...requests].sort((a, b) => {
            const modifier = sortConfig.direction === 'asc' ? 1 : -1;
            if (sortConfig.key === 'time') return (new Date(a.startedDateTime).getTime() - new Date(b.startedDateTime).getTime()) * modifier;
            if (sortConfig.key === 'status') return (a.status - b.status) * modifier;
            if (sortConfig.key === 'method') return a.method.localeCompare(b.method) * modifier;
            return 0;
        });
    };

    // We'll calculate matches on the final sorted & filtered list to ensure navigation works visually 1-to-1
    const processedRequests = useMemo(() => {
        return sortRequests(filteredRequests);
    }, [filteredRequests, sortConfig]);

    useEffect(() => {
        if (!debouncedQuery) {
            setSearchMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const query = debouncedQuery.toLowerCase();
        let newMatches: SearchMatch[] = [];

        processedRequests.forEach((req, index) => {
            // Simple fields
            if (req.url.toLowerCase().includes(query)) newMatches.push({ reqId: index, location: 'url', value: req.url });
            if (req.method.toLowerCase().includes(query)) newMatches.push({ reqId: index, location: 'method', value: req.method });
            if (req.status.toString().includes(query) || (req.statusText && req.statusText.toLowerCase().includes(query)))
                newMatches.push({ reqId: index, location: 'status', value: `${req.status}` });
            if (req.xTraceId && req.xTraceId.toLowerCase().includes(query)) newMatches.push({ reqId: index, location: 'trace', value: req.xTraceId });

            // Headers
            req.requestHeaders?.forEach(h => {
                if (h.name.toLowerCase().includes(query) || h.value.toLowerCase().includes(query))
                    newMatches.push({ reqId: index, location: 'header', path: `req-${h.name}`, value: h.value });
            });
            req.responseHeaders?.forEach(h => {
                if (h.name.toLowerCase().includes(query) || h.value.toLowerCase().includes(query))
                    newMatches.push({ reqId: index, location: 'header', path: `res-${h.name}`, value: h.value });
            });

            // Bodies
            const checkBody = (body: string | undefined, loc: 'payload' | 'response') => {
                if (!body) return;
                try {
                    const json = JSON.parse(body);
                    const jsonMatches = findMatchesInJson(json);
                    jsonMatches.forEach(m => newMatches.push({ reqId: index, location: loc, path: m.path, value: m.value }));
                } catch {
                    if (body.toLowerCase().includes(query)) newMatches.push({ reqId: index, location: loc, value: body });
                }
            };
            checkBody(req.requestBody, 'payload');
            checkBody(req.responseBody, 'response');
        });

        setSearchMatches(newMatches);
        setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);

    }, [debouncedQuery, processedRequests]);

    const navigateMatch = (direction: 'next' | 'prev') => {
        if (searchMatches.length === 0) return;
        if (direction === 'next') {
            setCurrentMatchIndex(prev => (prev + 1) % searchMatches.length);
        } else {
            setCurrentMatchIndex(prev => (prev - 1 + searchMatches.length) % searchMatches.length);
        }
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

            {/* Search Bar */}
            <div className="flex items-center gap-2 relative">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>

                {searchMatches.length > 0 && (
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 shrink-0">
                        <span className="text-xs text-muted-foreground px-2 font-mono whitespace-nowrap">
                            {currentMatchIndex + 1} of {searchMatches.length}
                        </span>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={() => navigateMatch('prev')} className="p-1 hover:bg-background rounded-md text-foreground transition-colors">
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigateMatch('next')} className="p-1 hover:bg-background rounded-md text-foreground transition-colors">
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                )}
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
                    <RequestList
                        title={activeListTab === 'all' ? "All Requests" : activeListTab === 'failed' ? "Failed Requests" : activeListTab === 'slow' ? "Slow Requests" : "OK Requests"}
                        requests={processedRequests}
                        type={activeListTab === 'all' ? 'all' : activeListTab === 'failed' ? 'error' : activeListTab === 'slow' ? 'warning' : 'success'}
                        emptyMessage={debouncedQuery ? "No matches found." : "No requests found."}
                        highlight={debouncedQuery}
                        currentMatch={searchMatches[currentMatchIndex]}
                    />
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

function RequestList({
    title, requests, type, emptyMessage, highlight, currentMatch
}: {
    title: string,
    requests: ResponseEntrySummary[],
    type: 'all' | 'error' | 'warning' | 'success',
    emptyMessage: string,
    highlight?: string,
    currentMatch?: any
}) {
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
                        {requests.map((req, i) => {
                            // Determine if this request has the active match
                            const isFocused = currentMatch && currentMatch.reqId === i;
                            return (
                                <RequestItem
                                    key={i}
                                    req={req}
                                    highlight={highlight}
                                    isFocused={isFocused ? true : false}
                                    focusedMatchLocation={isFocused ? currentMatch.location : undefined}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function RequestItem({ req, highlight, isFocused, focusedMatchLocation }: {
    req: ResponseEntrySummary,
    highlight?: string,
    isFocused?: boolean,
    focusedMatchLocation?: string
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'Headers' | 'Payload' | 'Preview' | 'Response'>('Headers');
    const itemRef = useRef<HTMLDivElement>(null);

    // Auto-expand and scroll if focused
    useEffect(() => {
        if (isFocused) {
            setIsExpanded(true);

            if (focusedMatchLocation === 'payload') setActiveTab('Payload');
            else if (focusedMatchLocation === 'response') setActiveTab('Response'); // OR Preview?
            else if (focusedMatchLocation === 'header') setActiveTab('Headers');

            // Scroll into view
            if (itemRef.current) {
                itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isFocused, focusedMatchLocation]);

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

        sections.push('Analyze the following error from the HAR file. Do not analyze it as a typical API request, look at is as a SmartRecruiters UI feature error. If possible, create a list of few simple checks that could be done by the Support Agent or the customer to resolve the issue. If not sure always suggest opening a Jira ticket.');
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

        if (req.xCallerCompanyId) {
            sections.push('## x-caller-company-id');
            sections.push(req.xCallerCompanyId);
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
            ref={itemRef}
            className={cn(
                "transition-all border-b border-border/50 last:border-0",
                isExpanded ? "bg-muted/30" : "hover:bg-muted/30",
                isFocused && "bg-primary/5 ring-1 ring-primary/20"
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
                        <HighlightText text={req.method} highlight={highlight || ""} />
                    </span>

                    {/* Status and Text */}
                    <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full shrink-0",
                            req.status >= 400 ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"
                        )}>
                            <HighlightText text={req.status.toString()} highlight={highlight || ""} />
                        </span>
                        <span className="text-sm text-muted-foreground truncate font-medium">
                            <HighlightText text={req.statusText || (req.status >= 400 ? "Error" : "OK")} highlight={highlight || ""} />
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
                                title="Ask Glean about this error. This is an experimental feature - always double check the results."
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
                                    <div className="font-mono text-xs break-all select-all">
                                        <HighlightText text={req.url} highlight={highlight || ""} />
                                    </div>

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

                                    <div className="font-semibold text-muted-foreground">x-trace-id</div>
                                    <div className="font-mono text-xs select-all">
                                        {req.xTraceId ? (
                                            <HighlightText text={req.xTraceId} highlight={highlight || ""} />
                                        ) : <span className="text-muted-foreground italic">not available</span>}
                                    </div>
                                    {req.externalTraceId && (
                                        <>
                                            <div className="font-semibold text-muted-foreground">external-trace-id</div>
                                            <div className="font-mono text-xs select-all">
                                                <HighlightText text={req.externalTraceId} highlight={highlight || ""} />
                                            </div>
                                        </>
                                    )}

                                    <div className="font-semibold text-muted-foreground">x-caller-company-id</div>
                                    <div className="font-mono text-xs select-all">
                                        {req.xCallerCompanyId ? (
                                            <HighlightText text={req.xCallerCompanyId} highlight={highlight || ""} />
                                        ) : <span className="text-muted-foreground italic">not available</span>}
                                    </div>

                                    {/* Request Headers */}
                                    {req.requestHeaders && req.requestHeaders.length > 0 && (
                                        <>
                                            <div className="col-span-2 pt-2 pb-1 border-b border-border/30 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Request Headers</div>
                                            {req.requestHeaders.map((h) => (
                                                <>
                                                    <div className="font-semibold text-muted-foreground pl-2 truncate" title={h.name}>
                                                        <HighlightText text={h.name} highlight={highlight || ""} />
                                                    </div>
                                                    <div className="font-mono text-xs break-all text-muted-foreground/80">
                                                        <HighlightText text={h.value} highlight={highlight || ""} />
                                                    </div>
                                                </>
                                            ))}
                                        </>
                                    )}

                                    {/* Response Headers */}
                                    {req.responseHeaders && req.responseHeaders.length > 0 && (
                                        <>
                                            <div className="col-span-2 pt-2 pb-1 border-b border-border/30 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Response Headers</div>
                                            {req.responseHeaders.map((h) => (
                                                <>
                                                    <div className="font-semibold text-muted-foreground pl-2 truncate" title={h.name}>
                                                        <HighlightText text={h.name} highlight={highlight || ""} />
                                                    </div>
                                                    <div className="font-mono text-xs break-all text-muted-foreground/80">
                                                        <HighlightText text={h.value} highlight={highlight || ""} />
                                                    </div>
                                                </>
                                            ))}
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
                                        return <JsonViewer data={json} initialExpanded={true} highlight={highlight} />;
                                    } catch (e) {
                                        return <HighlightText text={req.requestBody} highlight={highlight || ""} />;
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
                                        return <JsonViewer data={json} initialExpanded={true} highlight={highlight} />;
                                    } catch (e) {
                                        return <HighlightText text={req.responseBody} highlight={highlight || ""} />;
                                    }
                                })()}
                            </div>
                        )}

                        {activeTab === 'Response' && (
                            <div className="text-sm font-mono whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                {req.responseBody ? (
                                    (() => {
                                        try {
                                            const json = JSON.parse(req.responseBody);
                                            return <JsonViewer data={json} initialExpanded={true} highlight={highlight} />;
                                        } catch {
                                            return <HighlightText text={req.responseBody} highlight={highlight || ""} />;
                                        }
                                    })()
                                ) : (
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
