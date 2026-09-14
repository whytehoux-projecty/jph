"use client"

import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

interface InvoiceUploaderProps {
    onFileSelect: (file: File) => void;
    currentFile: File | null;
    isUploading: boolean;
    error: string | null;
    onClear: () => void;
}

export function InvoiceUploader({ onFileSelect, currentFile, isUploading, error, onClear }: InvoiceUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            {!currentFile ? (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
                        isDragging ? "border-vintage-green bg-vintage-green/5" : "border-border hover:border-vintage-green/50 hover:bg-muted/30",
                        error ? "border-red-300 bg-red-50" : ""
                    )}
                >
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept=".pdf"
                        aria-label="Upload Invoice"
                        onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
                    />

                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground group-hover:text-primary transition-colors">
                        <Upload className="w-8 h-8" />
                    </div>

                    <h3 className="text-lg font-semibold text-charcoal mb-1">Upload Invoice PDF</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                        Drag & drop or Click to upload your bill. We'll extract the details for you.
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Max 5MB</p>

                    {error && (
                        <div className="absolute bottom-4 text-sm text-red-600 font-medium bg-red-100 px-3 py-1 rounded-full animate-in fade-in slide-in-from-bottom-2">
                            Error: {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="border rounded-xl p-6 bg-white shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-vintage-green/10 flex items-center justify-center text-vintage-green">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-charcoal truncate max-w-[200px]">{currentFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isUploading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <Button variant="ghost" size="small" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); onClear(); }}>
                            <X className="w-5 h-5 text-muted-foreground hover:text-red-500" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
