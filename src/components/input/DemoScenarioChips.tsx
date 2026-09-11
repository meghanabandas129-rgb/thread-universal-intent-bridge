"use client";

import React from "react";
import { CloudRain, Briefcase, HeartPulse, Sparkles } from "lucide-react";

interface DemoScenarioChipsProps {
  onSelectScenario: (scenarioKey: string) => void;
  selectedKey?: string | null;
}

export function DemoScenarioChips({ onSelectScenario, selectedKey }: DemoScenarioChipsProps) {
  const scenarios = [
    {
      key: "flood-disaster",
      icon: CloudRain,
      title: "Scenario 1: Residential Flood Disaster",
      subtitle: "Waterlogged vital docs, destroyed school books, nowhere to sleep tonight",
      tag: "Disaster / Relocation",
      accent: "hover:border-rose-500/80 hover:bg-rose-950/20",
      activeClass: "border-rose-500 bg-rose-950/30 text-rose-200",
    },
    {
      key: "sudden-layoff",
      icon: Briefcase,
      title: "Scenario 2: Sudden Layoff & Healthcare Cliff",
      subtitle: "Zero severance, insurance ends Friday, insulin runs out in 4 days, rent due in 6 days",
      tag: "Employment & Health",
      accent: "hover:border-amber-500/80 hover:bg-amber-950/20",
      activeClass: "border-amber-500 bg-amber-950/30 text-amber-200",
    },
    {
      key: "elderly-caregiver",
      icon: HeartPulse,
      title: "Scenario 3: Elderly Mother Unsafe Discharge",
      subtitle: "82yo with wrist fracture discharging to 2-story home alone; caregiver 2hrs away",
      tag: "Geriatric Triage",
      accent: "hover:border-cyan-500/80 hover:bg-cyan-950/20",
      activeClass: "border-cyan-500 bg-cyan-950/30 text-cyan-200",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Try A Realistic Fictional Crisis Scenario (One-Click)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedKey === sc.key;

          return (
            <button
              key={sc.key}
              type="button"
              onClick={() => onSelectScenario(sc.key)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? sc.activeClass
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
              } ${sc.accent}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {sc.tag}
                  </span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-slate-200 mb-1 leading-tight">
                {sc.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sc.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
