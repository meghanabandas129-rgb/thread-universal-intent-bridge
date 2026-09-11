"use client";

import React, { useState } from "react";
import { Action } from "@/lib/types/situation";
import { getPriorityBadge } from "@/lib/utils/formatters";
import { CheckCircle2, Circle, Clock, MessageSquare, Phone, FileText } from "lucide-react";
import { ScriptDialog } from "./ScriptDialog";

interface ActionItemRowProps {
  action: Action;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
}

export function ActionItemRow({ action, isCompleted, onToggleComplete }: ActionItemRowProps) {
  const [showScript, setShowScript] = useState(false);
  const priorityBadge = getPriorityBadge(action.priority);

  return (
    <>
      <div
        className={`p-4 rounded-xl border transition-all ${
          isCompleted
            ? "border-emerald-900/60 bg-emerald-950/10 opacity-75"
            : action.priority === "P0_critical"
            ? "border-red-900/60 bg-slate-900/90 hover:border-red-500/60"
            : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <button
              type="button"
              onClick={() => onToggleComplete(action.id)}
              className="mt-0.5 text-slate-500 hover:text-emerald-400 transition"
              title={isCompleted ? "Mark incomplete" : "Mark completed"}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500" />
              )}
            </button>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide border ${priorityBadge.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dotClass}`} />
                  {priorityBadge.label}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{action.timeframe}</span>
                </div>
              </div>

              <h4
                className={`text-sm font-semibold leading-snug ${
                  isCompleted ? "line-through text-slate-400" : "text-slate-100"
                }`}
              >
                {action.title}
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {action.instruction}
              </p>
            </div>
          </div>

          {action.scriptOrTemplate && (
            <button
              type="button"
              onClick={() => setShowScript(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-medium transition"
            >
              {action.deliverableType === "phone_call" ? (
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>Script</span>
            </button>
          )}
        </div>
      </div>

      {action.scriptOrTemplate && (
        <ScriptDialog
          isOpen={showScript}
          onClose={() => setShowScript(false)}
          title={action.title}
          headline={action.scriptOrTemplate.headline}
          body={action.scriptOrTemplate.body}
          isPhoneCall={action.deliverableType === "phone_call"}
        />
      )}
    </>
  );
}
