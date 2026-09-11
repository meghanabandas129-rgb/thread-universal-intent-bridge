"use client";

import React, { useRef, useState } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

interface MediaUploaderProps {
  onMediaSelect: (dataUrl: string | null, mimeType?: string, fileName?: string) => void;
  selectedFileName?: string | null;
  disabled?: boolean;
}

export function MediaUploader({ onMediaSelect, selectedFileName, disabled }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(selectedFileName || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      onMediaSelect(result, file.type, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onMediaSelect(null);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {fileName ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/50 bg-indigo-950/30 text-xs text-indigo-200">
          <div className="flex items-center gap-1.5 truncate max-w-xs">
            {fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            )}
            <span className="truncate font-medium">{fileName}</span>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-indigo-900/60 text-indigo-400 hover:text-white transition"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
          <span>Attach Photo or Document</span>
        </button>
      )}
    </div>
  );
}
