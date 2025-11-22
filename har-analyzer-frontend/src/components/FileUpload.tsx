import { UploadCloud, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import type { AnalysisResult } from "../types";

interface FileUploadProps {
    onAnalysisComplete: (result: AnalysisResult) => void;
}

export function FileUpload({ onAnalysisComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file.name.endsWith('.har')) {
            setUploadStatus('error');
            setErrorMessage('Please upload a valid .har file');
            return;
        }

        setIsUploading(true);
        setUploadStatus('idle');
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/har/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data: AnalysisResult = await response.json();
            console.log('Analysis result:', data);
            setUploadStatus('success');

            // Small delay to show success state before switching views
            setTimeout(() => {
                onAnalysisComplete(data);
            }, 1000);

        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('error');
            setErrorMessage('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={cn(
                    "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out overflow-hidden",
                    isDragging
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    uploadStatus === 'error' && "border-destructive/50 bg-destructive/5",
                    uploadStatus === 'success' && "border-green-500/50 bg-green-500/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 relative z-10">
                    {isUploading ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                                <Loader2 className="w-10 h-10 animate-spin" />
                            </div>
                            <p className="text-lg font-medium animate-pulse">Analyzing HAR file...</p>
                        </div>
                    ) : uploadStatus === 'success' ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                            <div className="p-4 rounded-full bg-green-500/10 text-green-500 mb-4">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight text-green-500">
                                Analysis Complete!
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Redirecting to dashboard...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={cn(
                                "p-4 rounded-full transition-transform duration-300 group-hover:scale-110",
                                uploadStatus === 'error' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                            )}>
                                {uploadStatus === 'error' ? (
                                    <AlertCircle className="w-10 h-10" />
                                ) : (
                                    <UploadCloud className="w-10 h-10" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <h3 className={cn(
                                    "text-xl font-semibold tracking-tight",
                                    uploadStatus === 'error' && "text-destructive"
                                )}>
                                    {uploadStatus === 'error' ? "Upload Failed" : "Upload HAR File"}
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    {errorMessage || "Drag and drop your HAR file here, or click to browse"}
                                </p>
                            </div>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-50"
                    accept=".har"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>
        </div>
    );
}
