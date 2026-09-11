"use client";

import React, { useState } from "react";
import { UnknownInfo } from "@/lib/types/situation";
import { HelpCircle, CheckCircle2, Lock, ArrowRight } from "lucide-react";

interface UnknownsChecklistProps {
  unknowns: UnknownInfo[];
  onResolveUnknown: (unknownId: string, value: string) => void;
}

export function UnknownsChecklist({ unknowns, onResolveUnknown }: UnknownsChecklistProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleSelectOption = (unknownId: string, option: string) => {
    setInputs((prev) => ({ ...prev, [unknownId]: option }));
    onResolveUnknown(unknownId, option);
  };

  const handleCustomSubmit = (unknownId: string) => {
    const val = inputs[unknownId]?.trim();
    if (val) {
      onResolveUnknown(unknownId, val);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Missing Information Triage</span>
          </div>
          <p className="text-xs text-slate-400">
            Intake portals require these clarifications before specific relief actions can be executed:
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {unknowns.map((unk) => {
          const isResolved = Boolean(unk.resolvedValue);

          return (
            <div
              key={unk.id}
              className={`p-4 rounded-xl border transition-all ${
                isResolved
                  ? "border-emerald-800/60 bg-emerald-950/20"
                  : "border-amber-800/60 bg-slate-950/70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-slate-100">
                      {unk.question}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-400 pl-6">
                    <span className="font-semibold text-slate-300">Why needed:</span> {unk.whyNeeded}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    isResolved
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                      : "bg-amber-950/80 text-amber-300 border-amber-800"
                  }`}
                >
                  {isResolved ? "RESOLVED" : `PAUSES ${unk.blockedActionIds.length} ACTION`}
                </span>
              </div>

              {/* Resolution options */}
              {!isResolved ? (
                <div className="mt-3 pl-6 space-y-2">
                  {unk.suggestedOptions && unk.suggestedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {unk.suggestedOptions.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectOption(unk.id, opt)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-300 transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or specify exact detail..."
                      value={inputs[unk.id] || ""}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [unk.id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCustomSubmit(unk.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition flex items-center gap-1"
                    >
                      <span>Resolve</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 pl-6 text-xs text-emerald-300 font-medium">
                  ✓ Confirmed Value: &ldquo;{unk.resolvedValue}&rdquo; — Downstream actions unblocked!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
