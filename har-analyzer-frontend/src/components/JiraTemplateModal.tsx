import { useState } from "react";
import { ClipboardList, X, Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

const JIRA_TEMPLATE = `Where:

Company Name:

Company IDs:

What: 

Steps Taken to Replicate: 

Browser: 

Version:

Reason for Priority:

Date and Time Issue Occurred:

User Expected Behavior:

Samples:`;

export function JiraTemplateModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JIRA_TEMPLATE);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                title="Jira Ticket Template"
            >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Jira Template</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 flex items-start justify-center pt-24 bg-black/40 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Modal Content */}
                    <div
                        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-primary" />
                                Jira Ticket Template
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4">
                            <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap overflow-y-auto max-h-[400px] custom-scrollbar border border-border/50">
                                {JIRA_TEMPLATE}
                            </pre>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                                    copied
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy Template
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
