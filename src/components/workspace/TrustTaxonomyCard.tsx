"use client";

import React, { useState } from "react";
import { SituationModel } from "@/lib/types/situation";
import { Shield, Sparkles, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface TrustTaxonomyCardProps {
  model: SituationModel;
  onSelectEvidence?: (evidenceId: string) => void;
}

export function TrustTaxonomyCard({ model, onSelectEvidence }: TrustTaxonomyCardProps) {
  const [activeTab, setActiveTab] = useState<"facts" | "inferences" | "unknowns">("facts");

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("facts")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "facts"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>User Facts ({model.facts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inferences")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "inferences"
                ? "bg-violet-950/80 text-violet-300 border border-violet-800/80"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Inferred ({model.inferences.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unknowns")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "unknowns"
                ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Information Gaps ({model.unknowns.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block pr-2">
          Grounded Epistemic Layer
        </span>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeTab === "facts" && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-2">
              Empirical statements provided verbatim by the user or extracted from uploaded documents:
            </p>
            {model.facts.map((fact) => {
              const matchedEvidence = model.evidence.find((e) => e.id === fact.evidenceId);
              return (
                <div
                  key={fact.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-800/60 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-slate-200 leading-relaxed">
                      {fact.statement}
                    </p>
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                      {fact.evidenceId}
                    </span>
                  </div>

                  {matchedEvidence && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-900 text-[11px] text-slate-400 italic">
                      Quote: &ldquo;{matchedEvidence.content}&rdquo;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "inferences" && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-2">
              Logical deductions derived by THREAD Local Engine cross-referencing public agency regulations and timelines:
            </p>
            {model.inferences.map((inf) => (
              <div
                key={inf.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-violet-800/60 transition space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-violet-200">
                    {inf.inference}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono bg-violet-950/50 text-violet-300 border border-violet-800/60">
                    {(inf.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-medium">Why derived:</strong> {inf.rationale}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "unknowns" && (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-2">
              Missing critical information required by intake systems before actions can proceed:
            </p>
            {model.unknowns.map((unk) => (
              <div
                key={unk.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-800/60 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-amber-200">
                    {unk.question}
                  </h4>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-950/50 text-amber-300 border border-amber-800/60">
                    Blocks {unk.blockedActionIds.length} Action{unk.blockedActionIds.length > 1 ? "s" : ""}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300 font-medium">Prerequisite for:</strong> {unk.whyNeeded}
                </p>

                {unk.suggestedOptions && unk.suggestedOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 mr-1">Quick Select:</span>
                    {unk.suggestedOptions.map((opt, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-300"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
