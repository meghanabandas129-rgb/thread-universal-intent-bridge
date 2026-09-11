"use client";

import React, { useState } from "react";
import { Phone, Copy, Check, X, FileText } from "lucide-react";

interface ScriptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headline: string;
  body: string;
  isPhoneCall?: boolean;
}

export function ScriptDialog({
  isOpen,
  onClose,
  title,
  headline,
  body,
  isPhoneCall = true,
}: ScriptDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isPhoneCall ? (
              <Phone className="w-4 h-4 text-emerald-400" />
            ) : (
              <FileText className="w-4 h-4 text-sky-400" />
            )}
            <h3 className="text-sm font-bold text-white tracking-wide">
              {headline || "Prepared Talking Points"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">
            Objective: {title}
          </span>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs md:text-sm font-mono leading-relaxed select-all">
            &ldquo;{body}&rdquo;
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500">
            Read directly or copy into your message.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
