import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getPriorityBadge } from "@/lib/utils/formatters";
import { ActionPriority } from "@/lib/types/situation";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ActionNodeProps {
  data: {
    title: string;
    subtitle?: string;
    priority?: ActionPriority;
    timeframe?: string;
    isCompleted?: boolean;
  };
}

export function ActionNode({ data }: ActionNodeProps) {
  const priorityBadge = getPriorityBadge(data.priority || "P1_high");

  return (
    <div
      className={`relative group rounded-xl border p-3 shadow-lg backdrop-blur-md w-72 text-left transition-all ${
        data.isCompleted
          ? "border-emerald-800/80 bg-emerald-950/20 opacity-80"
          : data.priority === "P0_critical"
          ? "border-red-800/70 bg-slate-900/95 hover:border-red-500 shadow-red-950/30"
          : "border-slate-700 bg-slate-900/90 hover:border-slate-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-900"
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide border ${priorityBadge.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dotClass}`} />
            {priorityBadge.label}
          </span>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="truncate">{data.timeframe || "Standard"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-0.5">
          {data.isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          )}
          <h4
            className={`text-xs font-semibold leading-snug ${
              data.isCompleted ? "line-through text-slate-400" : "text-slate-100"
            }`}
          >
            {data.title}
          </h4>
        </div>

        {data.subtitle && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pl-6">
            {data.subtitle}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
      />
    </div>
  );
}
