import { useMemo } from 'react';

interface HighlightTextProps {
    text: string;
    highlight: string;
    className?: string;
}

export function HighlightText({ text, highlight, className }: HighlightTextProps) {
    const parts = useMemo(() => {
        if (!highlight) return [{ text, match: false }];

        const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const splitText = text.split(regex);

        return splitText.map(part => ({
            text: part,
            match: part.toLowerCase() === highlight.toLowerCase()
        })).filter(part => part.text);
    }, [text, highlight]);

    if (!highlight) return <span className={className}>{text}</span>;

    return (
        <span className={className}>
            {parts.map((part, i) => (
                part.match ? (
                    <mark key={i} className="bg-yellow-200 text-black rounded-sm px-0.5 mx-0.5 animate-pulse">
                        {part.text}
                    </mark>
                ) : (
                    <span key={i}>{part.text}</span>
                )
            ))}
        </span>
    );
}
