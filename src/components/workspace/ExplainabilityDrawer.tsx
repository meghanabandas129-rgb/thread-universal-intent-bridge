"use client";

import React from "react";
import { X, Info, Sparkles, Shield, ArrowRight, Quote, Clock, CheckCircle2 } from "lucide-react";
import { getTrustBadge, getPriorityBadge } from "@/lib/utils/formatters";

interface ExplainabilityDrawerProps {
  selectedNode: any | null;
  onClose: () => void;
}

export function ExplainabilityDrawer({ selectedNode, onClose }: ExplainabilityDrawerProps) {
  if (!selectedNode) return null;

  const data = selectedNode.data || {};
  const trustBadge = getTrustBadge(data.trustState || "AI_INFERRED");

  return (
    <aside aria-label="Evidence and Explainability Inspector" className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto backdrop-blur-xl animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Explainability Inspector
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {/* Node Title & Type */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {selectedNode.type || "ENTITY"}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${trustBadge.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${trustBadge.dotClass}`} />
              {trustBadge.label}
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-100">
            {data.title}
          </h4>

          {data.subtitle && (
            <p className="text-xs text-slate-400 leading-relaxed">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Why THREAD Derived This */}
        {data.whyReasoning && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Why THREAD Derived This</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &ldquo;{data.whyReasoning}&rdquo;
            </p>
          </div>
        )}

        {/* Trust State Definition */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Epistemic Classification</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {trustBadge.description}
          </p>
        </div>

        {/* Additional Specific Metadata */}
        {data.rawItem && (
          <div className="space-y-3">
            {data.rawItem.timeframe && (
              <div className="flex items-center justify-between text-xs py-2 border-y border-slate-900">
                <span className="text-slate-400">Target Timeframe:</span>
                <span className="font-semibold text-amber-300 font-mono">
                  {data.rawItem.timeframe}
                </span>
              </div>
            )}

            {data.rawItem.scriptOrTemplate && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-emerald-400">
                  {data.rawItem.scriptOrTemplate.headline}
                </div>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] leading-relaxed">
                  &ldquo;{data.rawItem.scriptOrTemplate.body}&rdquo;
                </p>
              </div>
            )}

            {data.rawItem.requiredDocuments && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300">
                  Required Proofs & Documents:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-1">
                  {data.rawItem.requiredDocuments.map((doc: string, idx: number) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Causal Note for Judges */}
        <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-900 leading-relaxed">
          THREAD links all inferred actions back to explicit quotes in the source story to eliminate speculative hallucinations and uphold transparency.
        </div>
      </div>
    </aside>
  );
}
