import React from "react";
import { Handle, Position } from "@xyflow/react";
import { AlertTriangle, Sparkles } from "lucide-react";

interface SituationNodeProps {
  data: {
    title: string;
    subtitle?: string;
    category?: string;
    urgency?: string;
    trustState?: string;
  };
}

export function SituationNode({ data }: SituationNodeProps) {
  const isCritical = data.urgency === "critical";

  return (
    <div className="relative group rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md w-80 text-left transition-all hover:border-slate-500">
      {/* Glow highlight */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500/20 via-indigo-500/20 to-purple-500/20 opacity-50 blur group-hover:opacity-75 transition" />

      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>SITUATION ROOT</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isCritical
                ? "bg-red-950/80 text-red-300 border-red-800"
                : "bg-amber-950/80 text-amber-300 border-amber-800"
            }`}
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            {data.urgency || "CRITICAL"}
          </span>
        </div>

        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          {data.category || "Cross-System Crisis"}
        </div>

        <h3 className="text-sm font-semibold text-slate-100 leading-snug">
          {data.title}
        </h3>

        {data.subtitle && (
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {data.subtitle}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900 shadow-md"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900 shadow-md"
      />
    </div>
  );
}
