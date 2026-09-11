"use client";

import React, { useState, useEffect } from "react";
import { SituationModel, UnknownInfo } from "@/lib/types/situation";
import { StoryInputHero } from "@/components/input/StoryInputHero";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { SituationGraph } from "@/components/graph/SituationGraph";
import { TrustTaxonomyCard } from "@/components/workspace/TrustTaxonomyCard";
import { NeedsDecomposition } from "@/components/workspace/NeedsDecomposition";
import { UnknownsChecklist } from "@/components/workspace/UnknownsChecklist";
import { SystemConnectors } from "@/components/workspace/SystemConnectors";
import { ActionPackView } from "@/components/action-pack/ActionPackView";
import { ExplainabilityDrawer } from "@/components/workspace/ExplainabilityDrawer";
import { ExportModal } from "@/components/action-pack/ExportModal";
import { Node } from "@xyflow/react";
import { CustomNodeData } from "@/lib/graph/layoutEngine";
import { Layers, ShieldCheck, Sparkles, Activity, AlertCircle } from "lucide-react";

export default function Home() {
  const [model, setModel] = useState<SituationModel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [viewMode, setViewMode] = useState<"graph" | "dossier">("graph");
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore previous session from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("thread_active_situation");
      if (saved) {
        setModel(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load stored session", e);
    }
  }, []);

  const handleAnalyze = async (
    story: string,
    media?: { dataUrl: string; mimeType: string; fileName: string } | null
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep("Multimodal ingestion & evidence extraction...");

    try {
      // Step tracker for visual feedback during AI inference
      setTimeout(() => setAnalysisStep("Decomposing latent needs across public systems..."), 500);
      setTimeout(() => setAnalysisStep("Synthesizing dependency graph & action priorities..."), 1100);

      const payload: any = { story };
      if (media) {
        payload.images = [media.dataUrl];
        payload.mediaType = media.mimeType;
        payload.mediaName = media.fileName;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to analyze situation");
      }

      const situationData: SituationModel = await res.json();
      setModel(situationData);
      localStorage.setItem("thread_active_situation", JSON.stringify(situationData));
    } catch (err: any) {
      console.error("Analysis error:", err);
      setErrorMessage(err.message || "An error occurred during local analysis");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleReset = () => {
    setModel(null);
    setSelectedNode(null);
    localStorage.removeItem("thread_active_situation");
  };

  const handleResolveUnknown = (unknownId: string, value: string) => {
    if (!model) return;

    const updatedUnknowns = model.unknowns.map((u) =>
      u.id === unknownId ? { ...u, resolvedValue: value } : u
    );

    const updatedModel: SituationModel = {
      ...model,
      unknowns: updatedUnknowns,
    };

    setModel(updatedModel);
    localStorage.setItem("thread_active_situation", JSON.stringify(updatedModel));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Global Command Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-md shadow-indigo-600/30">
              <Layers className="w-4 h-4 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-base text-white">
                  THREAD
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
                  Universal Intent Bridge
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                One story. Every action connected.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>THREAD LOCAL REASONING CORE</span>
            </div>

            {model && (
              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition"
              >
                Export Pack
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Loading Banner */}
        {isAnalyzing && (
          <div className="p-4 rounded-2xl border border-indigo-500/50 bg-indigo-950/40 backdrop-blur-md shadow-xl flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-indigo-200">
                THREAD Core Pipeline Active
              </h4>
              <p className="text-xs text-indigo-300/80">
                {analysisStep || "Synthesizing cross-system situation graph..."}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert (if any) */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-amber-800/70 bg-amber-950/30 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorMessage} (Loaded precomputed intelligence model)</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {!model ? (
          /* Intake Screen */
          <StoryInputHero onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        ) : (
          /* Intelligence Workspace */
          <div className="space-y-6 animate-in fade-in duration-200">
            <WorkspaceHeader
              model={model}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenExport={() => setIsExportOpen(true)}
              onReset={handleReset}
            />

            {/* View Mode: Graph View */}
            {viewMode === "graph" && (
              <div className="space-y-6">
                <SituationGraph
                  model={model}
                  onSelectNode={(node) => setSelectedNode(node)}
                  selectedNodeId={selectedNode?.id}
                />

                {/* Quick Summary Grid Below Graph */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrustTaxonomyCard model={model} />
                  <ActionPackView actions={model.actions} />
                </div>
              </div>
            )}

            {/* View Mode: Dossier View */}
            {viewMode === "dossier" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrustTaxonomyCard model={model} />
                  <UnknownsChecklist
                    unknowns={model.unknowns}
                    onResolveUnknown={handleResolveUnknown}
                  />
                </div>

                <NeedsDecomposition
                  model={model}
                  onSelectNeed={(need) =>
                    setSelectedNode({
                      id: need.id,
                      type: "needNode",
                      position: { x: 0, y: 0 },
                      data: {
                        title: need.title,
                        subtitle: need.description,
                        category: need.category,
                        urgency: need.urgency,
                        trustState: need.trustState,
                        whyReasoning: need.whyReasoning,
                        rawItem: need,
                      },
                    })
                  }
                />

                <SystemConnectors systems={model.systems} />

                <ActionPackView actions={model.actions} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Slide-over Explainability Inspector */}
      <ExplainabilityDrawer
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Export Action Pack Modal */}
      {model && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          model={model}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a10] py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">THREAD</span>
            <span>—</span>
            <span>Universal Bridge Between Human Intent and Complex Systems</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
           <span className="text-slate-400">AI Intelligence Prototype</span>
           <span>•</span>
           <span className="text-slate-500">Local Reasoning Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
