"use client";

import React from "react";
import { ArrowLeft, Download, Network, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SituationModel } from "@/lib/types/situation";

interface WorkspaceHeaderProps {
  model: SituationModel;
  viewMode: "graph" | "dossier";
  onViewModeChange: (mode: "graph" | "dossier") => void;
  onOpenExport: () => void;
  onReset: () => void;
}

export function WorkspaceHeader({
  model,
  viewMode,
  onViewModeChange,
  onOpenExport,
  onReset,
}: WorkspaceHeaderProps) {
  const isCritical = model.metadata.overallSeverity === "critical";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Situation</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-indigo-400 font-mono text-[11px]">
            {model.id}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 truncate max-w-xs">
            {model.metadata.primaryDomain}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Intelligence Workspace
          </h2>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isCritical
                ? "bg-red-950/80 text-red-300 border-red-800/80"
                : "bg-amber-950/80 text-amber-300 border-amber-800/80"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{model.metadata.overallSeverity} Severity</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            <span>{model.metadata.modelUsed}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange("graph")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "graph"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Situation Graph</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("dossier")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "dossier"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dossier View</span>
          </button>
        </div>

        {/* Export CTA */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white shadow-lg transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Action Pack</span>
        </button>
      </div>
    </div>
  );
}
