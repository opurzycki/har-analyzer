import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface JsonViewerProps {
    data: any;
    name?: string;
    isLast?: boolean;
    initialExpanded?: boolean;
    depth?: number;
}

export function JsonViewer({ data, name, isLast = true, initialExpanded = false, depth = 0 }: JsonViewerProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded || depth < 1);

    const isObject = data !== null && typeof data === 'object';
    const isArray = Array.isArray(data);
    const isEmpty = isObject && Object.keys(data).length === 0;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    if (!isObject) {
        return (
            <div className="font-mono text-xs leading-5 flex">
                {name && <span className="text-purple-500 mr-1">{name}:</span>}
                <ValueDisplay value={data} />
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

                {name && <span className="text-purple-500 mr-1">{name}:</span>}

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

function ValueDisplay({ value }: { value: any }) {
    if (typeof value === 'string') {
        return <span className="text-green-600">"{value}"</span>;
    }
    if (typeof value === 'number') {
        return <span className="text-blue-500">{value}</span>;
    }
    if (typeof value === 'boolean') {
        return <span className="text-orange-500 font-bold">{value.toString()}</span>;
    }
    if (value === null) {
        return <span className="text-gray-500 font-bold">null</span>;
    }
    return <span className="text-foreground">{String(value)}</span>;
}
