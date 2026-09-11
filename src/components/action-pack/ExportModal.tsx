"use client";

import React, { useState } from "react";
import { SituationModel } from "@/lib/types/situation";
import { generateActionPackMarkdown } from "@/lib/utils/formatters";
import { X, Copy, Check, Download, FileText, Code, Printer } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: SituationModel;
}

export function ExportModal({ isOpen, onClose, model }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "markdown" | "json">("preview");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownText = generateActionPackMarkdown(model);
  const jsonText = JSON.stringify(model, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Export Structured Action Pack
              </h3>
              <p className="text-[11px] text-slate-400">
                Ready for caseworkers, family coordination, or agency API ingestion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dossier Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("markdown")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "markdown"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Markdown</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "json"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>JSON Schema</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleCopy(activeTab === "json" ? jsonText : markdownText)
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {activeTab === "json" ? "JSON" : "Markdown"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                activeTab === "json"
                  ? handleDownload(jsonText, `thread-${model.id}.json`, "application/json")
                  : handleDownload(markdownText, `thread-${model.id}.md`, "text/markdown")
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              title="Print Action Pack"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-200 font-sans">
          {activeTab === "preview" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                  THREAD COORDINATION DOSSIER
                </span>
                <h2 className="text-xl font-bold text-white">
                  {model.metadata.summary}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>Severity: <strong className="text-red-400 uppercase">{model.metadata.overallSeverity}</strong></span>
                  <span>•</span>
                  <span>Domain: <strong>{model.metadata.primaryDomain}</strong></span>
                </div>
              </div>

              {/* Verified Facts & Evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Confirmed Facts & Evidence
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {model.facts.map((f) => (
                    <li key={f.id}>{f.statement}</li>
                  ))}
                </ul>
              </div>

              {/* Latent Needs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Connected Needs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {model.needs.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-1"
                    >
                      <span className="font-semibold text-white block">{n.title}</span>
                      <p className="text-slate-400 text-[11px]">{n.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Action Plan & Immediate Steps
                </h4>
                <div className="space-y-2">
                  {model.actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">
                          {idx + 1}. {act.title}
                        </span>
                        <span className="font-mono text-[10px] text-amber-300">
                          {act.timeframe}
                        </span>
                      </div>
                      <p className="text-slate-400">{act.instruction}</p>
                      {act.scriptOrTemplate && (
                        <div className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-indigo-300 italic font-mono">
                          &ldquo;{act.scriptOrTemplate.body}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "markdown" && (
            <pre className="text-xs font-mono text-slate-300 bg-slate-900/80 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {markdownText}
            </pre>
          )}

          {activeTab === "json" && (
            <pre className="text-xs font-mono text-indigo-300 bg-slate-900/80 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {jsonText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
