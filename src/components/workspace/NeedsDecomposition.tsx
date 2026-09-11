"use client";

import React from "react";
import { SituationModel, Need } from "@/lib/types/situation";
import { getCategoryMetadata, getTrustBadge, getUrgencyBadge } from "@/lib/utils/formatters";
import { Clock, Info, Building2, ArrowRight } from "lucide-react";

interface NeedsDecompositionProps {
  model: SituationModel;
  onSelectNeed?: (need: Need) => void;
}

export function NeedsDecomposition({ model, onSelectNeed }: NeedsDecompositionProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Decomposed Latent Needs ({model.needs.length})
          </h3>
          <p className="text-xs text-slate-400">
            One human story transformed into distinct, cross-jurisdictional systemic needs:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {model.needs.map((need) => {
          const categoryMeta = getCategoryMetadata(need.category);
          const trustBadge = getTrustBadge(need.trustState);
          const urgencyBadge = getUrgencyBadge(need.urgency);

          const linkedSystems = model.systems.filter((s) => need.systemIds.includes(s.id));
          const linkedActions = model.actions.filter((a) => a.needId === need.id);

          return (
            <div
              key={need.id}
              onClick={() => onSelectNeed?.(need)}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-900/90 transition cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${categoryMeta.colorClass}`}
                  >
                    {categoryMeta.label}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border ${urgencyBadge.badgeClass}`}
                    >
                      {urgencyBadge.label}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${trustBadge.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${trustBadge.dotClass}`} />
                      {trustBadge.label}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs md:text-sm font-semibold text-slate-100 leading-snug">
                  {need.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {need.description}
                </p>

                {/* Explainability Callout */}
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-300 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-indigo-400 text-[10px] uppercase tracking-wider">
                    <Info className="w-3 h-3" />
                    <span>Explainability Anchor</span>
                  </div>
                  <p className="italic leading-relaxed">{need.whyReasoning}</p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-sky-400" />
                  <span className="truncate max-w-[140px]">
                    {linkedSystems.map((s) => s.name).join(", ") || "General Aid"}
                  </span>
                </div>

                <span className="font-medium text-slate-300">
                  {linkedActions.length} Action{linkedActions.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
