import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Building2, ExternalLink } from "lucide-react";

interface SystemNodeProps {
  data: {
    title: string;
    subtitle?: string;
    category?: string;
    systemName?: string;
    trustState?: string;
  };
}

export function SystemNode({ data }: SystemNodeProps) {
  return (
    <div className="relative group rounded-xl border border-sky-800/60 bg-slate-900/90 p-3 shadow-lg backdrop-blur-md w-64 text-left transition-all hover:border-sky-500 hover:shadow-sky-500/10">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-sky-400 !border-2 !border-slate-900"
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-400">
            <Building2 className="w-3 h-3" />
            <span className="uppercase tracking-wider">{data.category || "Public Agency"}</span>
          </div>

          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-950/60 text-sky-300 border border-sky-800/80">
            SIMULATED
          </span>
        </div>

        <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
          {data.title}
        </h4>

        {data.subtitle && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
            {data.subtitle}
          </p>
        )}

        {data.systemName && (
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="truncate">{data.systemName}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-500 shrink-0 ml-1" />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-900"
      />
    </div>
  );
}
