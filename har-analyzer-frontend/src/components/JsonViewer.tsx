import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { HighlightText } from './HighlightText';

interface JsonViewerProps {
    data: any;
    name?: string;
    isLast?: boolean;
    initialExpanded?: boolean;
    depth?: number;
    highlight?: string;
}

export function JsonViewer({ data, name, isLast = true, initialExpanded = false, depth = 0, highlight = "" }: JsonViewerProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded || depth < 1);

    const isObject = data !== null && typeof data === 'object';
    const isArray = Array.isArray(data);
    const isEmpty = isObject && Object.keys(data).length === 0;

    // Check if this node or any children contain the highlight text
    const containsHighlight = (searchTerm: string, node: any, nodeName?: string): boolean => {
        if (!searchTerm) return false;
        const normalizedSearch = searchTerm.toLowerCase();

        // Check current key/name
        if (nodeName && nodeName.toLowerCase().includes(normalizedSearch)) return true;

        // Check current leaf value
        if (node !== null && typeof node !== 'object') {
            return String(node).toLowerCase().includes(normalizedSearch);
        }

        // Check children
        if (node !== null && typeof node === 'object') {
            return Object.entries(node).some(([key, value]) =>
                containsHighlight(searchTerm, value, key)
            );
        }

        return false;
    };

    // Auto-expand if highlight matches something in this subtree
    useEffect(() => {
        if (highlight && containsHighlight(highlight, data, name)) {
            setIsExpanded(true);
        } else if (!highlight) {
            // Reset expansion state when highlight is cleared if we want, 
            // but keeping user's manual expansion might be better. 
            // specific logic: only reset if depth is > 0 (root stays expanded)
            if (depth > 0) setIsExpanded(false);
        }
    }, [highlight, data, name, depth]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    if (!isObject) {
        return (
            <div className="font-mono text-xs leading-5 flex break-all">
                {name && (
                    <span className="text-purple-500 mr-1">
                        <HighlightText text={name} highlight={highlight} />:
                    </span>
                )}
                <ValueDisplay value={data} highlight={highlight} />
                {!isLast && <span className="text-foreground">,</span>}
            </div>
        );
    }

    return (
        <div className="font-mono text-xs leading-5">
            <div
                className={cn("flex items-center hover:bg-muted/30 cursor-pointer rounded px-1 -ml-1", isEmpty && "cursor-default")}
                onClick={!isEmpty ? handleToggle : undefined}
            >
                <span className="w-4 h-4 flex items-center justify-center mr-1 text-muted-foreground shrink-0">
                    {!isEmpty && (
                        isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                    )}
                </span>

                {name && (
                    <span className="text-purple-500 mr-1">
                        <HighlightText text={name} highlight={highlight} />:
                    </span>
                )}

                <span className="text-foreground">
                    {isArray ? '[' : '{'}
                    {!isExpanded && !isEmpty && <span className="text-muted-foreground mx-1">...</span>}
                    {isEmpty && (isArray ? ']' : '}')}
                    {!isExpanded && !isEmpty && (isArray ? ']' : '}')}
                    {!isLast && !isExpanded && <span className="text-foreground">,</span>}

                    {!isExpanded && !isEmpty && (
                        <span className="text-muted-foreground ml-2 italic text-[10px]">
                            {isArray ? `${data.length} items` : Object.keys(data).length + ' keys'}
                        </span>
                    )}
                </span>
            </div>

            {isExpanded && !isEmpty && (
                <div className="pl-4 border-l border-border/30 ml-2">
                    {Object.entries(data).map(([key, value], index, arr) => (
                        <JsonViewer
                            key={key}
                            name={isArray ? undefined : key}
                            data={value}
                            isLast={index === arr.length - 1}
                            depth={depth + 1}
                            highlight={highlight}
                        />
                    ))}
                    <div className="text-foreground">
                        {isArray ? ']' : '}'}
                        {!isLast && <span>,</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

function ValueDisplay({ value, highlight }: { value: any, highlight: string }) {
    if (typeof value === 'string') {
        return (
            <span className="text-green-600">
                "<HighlightText text={value} highlight={highlight} />"
            </span>
        );
    }
    if (typeof value === 'number') {
        return (
            <span className="text-blue-500">
                <HighlightText text={String(value)} highlight={highlight} />
            </span>
        );
    }
    if (typeof value === 'boolean') {
        return (
            <span className="text-orange-500 font-bold">
                <HighlightText text={value.toString()} highlight={highlight} />
            </span>
        );
    }
    if (value === null) {
        return (
            <span className="text-gray-500 font-bold">
                <HighlightText text="null" highlight={highlight} />
            </span>
        );
    }
    return (
        <span className="text-foreground">
            <HighlightText text={String(value)} highlight={highlight} />
        </span>
    );
}
