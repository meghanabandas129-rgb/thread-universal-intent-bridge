import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getCategoryMetadata, getTrustBadge } from "@/lib/utils/formatters";
import { NeedCategory, TrustState } from "@/lib/types/situation";
import { Info } from "lucide-react";

interface NeedNodeProps {
  data: {
    title: string;
    subtitle?: string;
    category?: NeedCategory;
    urgency?: string;
    trustState?: TrustState;
    whyReasoning?: string;
  };
}

export function NeedNode({ data }: NeedNodeProps) {
  const categoryMeta = getCategoryMetadata(data.category || "relief_aid");
  const trustBadge = getTrustBadge(data.trustState || "AI_INFERRED");

  return (
    <div className="relative group rounded-xl border border-slate-700 bg-slate-900/90 p-3.5 shadow-xl backdrop-blur-md w-72 text-left transition-all hover:border-slate-500 hover:shadow-indigo-500/10">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${categoryMeta.colorClass}`}
          >
            {categoryMeta.label}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider border ${trustBadge.badgeClass}`}
            title={trustBadge.description}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${trustBadge.dotClass}`} />
            {trustBadge.label}
          </span>
        </div>

        <h4 className="text-xs font-semibold text-slate-100 leading-snug">
          {data.title}
        </h4>

        {data.subtitle && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {data.subtitle}
          </p>
        )}

        {data.whyReasoning && (
          <div className="pt-1 border-t border-slate-800/80 flex items-start gap-1 text-[10px] text-indigo-300/90">
            <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">{data.whyReasoning}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-sky-400 !border-2 !border-slate-900"
      />
    </div>
  );
}
