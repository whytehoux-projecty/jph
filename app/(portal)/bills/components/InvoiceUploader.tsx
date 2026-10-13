"use client";

import * as React from "react";
import { Upload, FileText, X, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface InvoiceUploaderProps {
  onFileSelect: (file: File) => void;
  currentFile: File | null;
  isUploading: boolean;
  error: string | null;
  onClear: () => void;
}

export function InvoiceUploader({
  onFileSelect,
  currentFile,
  isUploading,
  error,
  onClear,
}: InvoiceUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

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
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-3">
      {!currentFile ? (
        <div>
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-none p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 outline-none",
              isDragging
                ? "border-vermilion-600 bg-vermilion-50/40"
                : "border-paper-300 bg-paper-50 hover:bg-paper-100/70 hover:border-ink-900",
              error ? "border-error bg-error-bg/30" : ""
            )}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              aria-label="Upload Invoice Ticket PDF"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="h-14 w-14 rounded-none border border-paper-300 bg-white flex items-center justify-center mb-4 text-ink-900 shadow-xs transition-transform group-hover:scale-105">
              <Upload className="w-6 h-6" />
            </div>

            <h3 className="font-display text-base font-semibold text-ink-900 mb-1">
              Upload E-Invoice Ticket (.PDF)
            </h3>
            <p className="text-small text-ink-700 max-w-md mx-auto mb-3">
              Drag & drop your utility, telecom, or corporate invoice ticket here, or click to browse.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-500 bg-white px-2.5 py-1 border border-paper-300">
              <span>Accepted Format: .PDF</span>
              <span>·</span>
              <span>Max: 10 MB</span>
            </div>

            {error && (
              <div className="mt-4 text-xs text-error font-medium bg-error-bg px-3 py-1.5 border border-error/30 animate-in fade-in">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-paper-300 rounded-none p-4 sm:p-5 bg-paper-50 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-11 w-11 shrink-0 rounded-none bg-ink-900 text-paper-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink-900 text-small truncate max-w-[240px] sm:max-w-md">
                {currentFile.name}
              </p>
              <p className="text-[11px] font-mono text-ink-500">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB · PDF Ticket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isUploading ? (
              <div className="flex items-center gap-2 text-xs font-mono text-ink-600">
                <div className="animate-spin h-4 w-4 border-2 border-ink-900 border-t-transparent rounded-full" />
                <span className="hidden sm:inline">Scanning...</span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success-bg px-2.5 py-1 border border-success/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ticket Loaded</span>
              </span>
            )}
            <Button
              variant="ghost"
              size="small"
              className="h-8 w-8 p-0 text-ink-500 hover:text-error hover:bg-paper-200"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
