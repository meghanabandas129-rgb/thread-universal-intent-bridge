"use client";

import React, { useState } from "react";
import { Action } from "@/lib/types/situation";
import { ActionItemRow } from "./ActionItemRow";
import { CheckCircle2, Flame, AlertCircle, Calendar } from "lucide-react";

interface ActionPackViewProps {
  actions: Action[];
}

export function ActionPackView({ actions }: ActionPackViewProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const p0Actions = actions.filter((a) => a.priority === "P0_critical");
  const p1Actions = actions.filter((a) => a.priority === "P1_high");
  const p2Actions = actions.filter((a) => a.priority === "P2_normal");

  const completedCount = completedIds.size;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl p-5 space-y-6">
      {/* Header with Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Action Pack & Execution Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Coordinated, sequenced steps with immediate phone scripts and legal preservation templates:
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-200">
              {completedCount} of {totalCount} Done
            </span>
            <div className="w-28 h-2 rounded-full bg-slate-800 mt-1 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1: P0 Critical */}
      {p0Actions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Phase 1: P0 Critical (Immediate 0-24 Hours)</span>
          </div>

          <div className="space-y-2.5">
            {p0Actions.map((action) => (
              <ActionItemRow
                key={action.id}
                action={action}
                isCompleted={completedIds.has(action.id)}
                onToggleComplete={handleToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 2: P1 High */}
      {p1Actions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Phase 2: P1 High Priority (48-72 Hours)</span>
          </div>

          <div className="space-y-2.5">
            {p1Actions.map((action) => (
              <ActionItemRow
                key={action.id}
                action={action}
                isCompleted={completedIds.has(action.id)}
                onToggleComplete={handleToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 3: P2 Normal */}
      {p2Actions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Phase 3: P2 Follow-Up & Habitability Rights</span>
          </div>

          <div className="space-y-2.5">
            {p2Actions.map((action) => (
              <ActionItemRow
                key={action.id}
                action={action}
                isCompleted={completedIds.has(action.id)}
                onToggleComplete={handleToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
