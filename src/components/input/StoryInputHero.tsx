"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2, ShieldCheck, Activity, Layers } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { MediaUploader } from "./MediaUploader";
import { DemoScenarioChips } from "./DemoScenarioChips";
import { DEMO_SCENARIOS } from "@/lib/gemini/mockData";

interface StoryInputHeroProps {
  onAnalyze: (story: string, media?: { dataUrl: string; mimeType: string; fileName: string } | null) => void;
  isAnalyzing: boolean;
}

export function StoryInputHero({ onAnalyze, isAnalyzing }: StoryInputHeroProps) {
  const [story, setStory] = useState("");
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string | null>(null);
  const [media, setMedia] = useState<{ dataUrl: string; mimeType: string; fileName: string } | null>(null);

  const handleScenarioSelect = (scenarioKey: string) => {
    setSelectedScenarioKey(scenarioKey);
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (scenario) {
      setStory(scenario.rawInput.storyText);
      if (scenario.rawInput.hasMedia && scenario.rawInput.mediaName) {
        setMedia({
          dataUrl: "data:image/jpeg;base64,mock",
          mimeType: "image/jpeg",
          fileName: scenario.rawInput.mediaName,
        });
      } else {
        setMedia(null);
      }
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setStory((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleMediaSelect = (dataUrl: string | null, mimeType?: string, fileName?: string) => {
    if (dataUrl && mimeType && fileName) {
      setMedia({ dataUrl, mimeType, fileName });
    } else {
      setMedia(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim() || isAnalyzing) return;
    onAnalyze(story, media);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Product Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-sm">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>THREAD LOCAL REASONING CORE • SITUATION GRAPH & ACTION PACK</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          One story. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">Every action connected.</span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Human crises don't fit into neat bureaucratic drop-downs. Describe what happened in messy, natural language. THREAD decomposes hidden needs, maps cross-agency dependencies, and builds an actionable execution pack.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 md:p-5 transition-all focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30">
          <label htmlFor="story-input" className="sr-only">
            Tell us what happened
          </label>

          <textarea
            id="story-input"
            value={story}
            onChange={(e) => {
              setStory(e.target.value);
              setSelectedScenarioKey(null);
            }}
            placeholder="Tell us what happened in your own words... e.g., 'The rain flooded our house last night. My daughter's school books are ruined, our lease and birth certificates are soaked, and we have nowhere safe to stay tonight. The landlord isn't answering and I don't know what help I qualify for.'"
            rows={5}
            disabled={isAnalyzing}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm md:text-base resize-none focus:outline-none leading-relaxed"
          />

          {/* Bottom Bar inside Input Box */}
          <div className="pt-3 mt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={isAnalyzing} />
              <MediaUploader
                onMediaSelect={handleMediaSelect}
                selectedFileName={media?.fileName}
                disabled={isAnalyzing}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {story.length} chars
              </span>

              <button
                type="submit"
                disabled={!story.trim() || isAnalyzing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm text-white shadow-lg transition-all ${
                  !story.trim() || isAnalyzing
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>Decomposing Situation...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze & Build Graph</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Demo Scenario Selectors */}
      <DemoScenarioChips
        onSelectScenario={handleScenarioSelect}
        selectedKey={selectedScenarioKey}
      />

      {/* Trust & Safety Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Strict 4-Tier Epistemic Taxonomy: Confirmed Facts vs AI Inferences vs Verified Data vs Unknown Gaps.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Activity className="w-3 h-3 text-indigo-400" />
          <span>Zero Hallucinated Approvals</span>
        </div>
      </div>
    </div>
  );
}
