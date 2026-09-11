import { TrustState, ActionPriority, UrgencyLevel, NeedCategory, SituationModel } from "../types/situation";

export function getTrustBadge(trustState: TrustState) {
  switch (trustState) {
    case "USER_PROVIDED":
      return {
        label: "USER PROVIDED",
        badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
        dotClass: "bg-emerald-400",
        description: "Directly reported by the user in original story.",
      };
    case "AI_INFERRED":
      return {
        label: "AI INFERRED",
        badgeClass: "bg-violet-950/80 text-violet-300 border-violet-800/80",
        dotClass: "bg-violet-400",
        description: "Deduced by THREAD multi-domain causal reasoning.",
      };
    case "VERIFIED":
      return {
        label: "VERIFIED",
        badgeClass: "bg-sky-950/80 text-sky-300 border-sky-800/80",
        dotClass: "bg-sky-400",
        description: "Confirmed via external public service records.",
      };
    case "UNKNOWN":
      return {
        label: "UNKNOWN / GAP",
        badgeClass: "bg-amber-950/80 text-amber-300 border-amber-800/80",
        dotClass: "bg-amber-400",
        description: "Critical information gap blocking downstream action.",
      };
    default:
      return {
        label: "UNCLASSIFIED",
        badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
        dotClass: "bg-zinc-400",
        description: "Standard data point.",
      };
  }
}

export function getPriorityBadge(priority: ActionPriority) {
  switch (priority) {
    case "P0_critical":
      return {
        label: "P0 CRITICAL (24H)",
        badgeClass: "bg-red-950/90 text-red-300 border-red-800/90",
        dotClass: "bg-red-500",
      };
    case "P1_high":
      return {
        label: "P1 HIGH (48-72H)",
        badgeClass: "bg-amber-950/90 text-amber-300 border-amber-800/90",
        dotClass: "bg-amber-500",
      };
    case "P2_normal":
      return {
        label: "P2 NORMAL",
        badgeClass: "bg-blue-950/90 text-blue-300 border-blue-800/90",
        dotClass: "bg-blue-400",
      };
  }
}

export function getUrgencyBadge(urgency: UrgencyLevel) {
  switch (urgency) {
    case "immediate_24h":
      return {
        label: "Immediate (24h)",
        badgeClass: "bg-rose-950/80 text-rose-300 border-rose-800",
      };
    case "urgent_72h":
      return {
        label: "Urgent (72h)",
        badgeClass: "bg-amber-950/80 text-amber-300 border-amber-800",
      };
    case "medium_term":
      return {
        label: "Medium Term",
        badgeClass: "bg-indigo-950/80 text-indigo-300 border-indigo-800",
      };
  }
}

export function getCategoryMetadata(category: NeedCategory) {
  switch (category) {
    case "shelter":
      return {
        label: "Emergency Shelter & Housing",
        colorClass: "text-rose-400 border-rose-800/60 bg-rose-950/30",
        accentHex: "#f43f5e",
      };
    case "document_recovery":
      return {
        label: "Vital Records & Documents",
        colorClass: "text-amber-400 border-amber-800/60 bg-amber-950/30",
        accentHex: "#f59e0b",
      };
    case "education":
      return {
        label: "Education Continuity",
        colorClass: "text-emerald-400 border-emerald-800/60 bg-emerald-950/30",
        accentHex: "#10b981",
      };
    case "health_safety":
      return {
        label: "Health & Life Safety",
        colorClass: "text-cyan-400 border-cyan-800/60 bg-cyan-950/30",
        accentHex: "#06b6d4",
      };
    case "financial":
      return {
        label: "Financial & Unemployment Aid",
        colorClass: "text-purple-400 border-purple-800/60 bg-purple-950/30",
        accentHex: "#a855f7",
      };
    case "relief_aid":
      return {
        label: "Emergency Food & Relief Aid",
        colorClass: "text-blue-400 border-blue-800/60 bg-blue-950/30",
        accentHex: "#3b82f6",
      };
    case "legal_administrative":
      return {
        label: "Legal Rights & Advocacy",
        colorClass: "text-orange-400 border-orange-800/60 bg-orange-950/30",
        accentHex: "#f97316",
      };
  }
}

export function generateActionPackMarkdown(model: SituationModel): string {
  const p0Actions = model.actions.filter((a) => a.priority === "P0_critical");
  const p1Actions = model.actions.filter((a) => a.priority === "P1_high");
  const p2Actions = model.actions.filter((a) => a.priority === "P2_normal");

  let md = `# THREAD ACTION PACK: ${model.metadata.summary}\n\n`;
  md += `**Severity:** ${model.metadata.overallSeverity.toUpperCase()} | **Generated:** ${new Date(
    model.metadata.analyzedAt
  ).toLocaleString()} | **Model:** ${model.metadata.modelUsed}\n\n`;
  md += `> **Crisis Domain:** ${model.metadata.primaryDomain}\n\n`;

  md += `## 1. Executive Summary\n${model.metadata.summary}\n\n`;

  md += `## 2. Confirmed Facts (User-Provided)\n`;
  model.facts.forEach((f, idx) => {
    md += `${idx + 1}. **${f.statement}** (Source: \`${f.evidenceId}\`)\n`;
  });
  md += `\n`;

  md += `## 3. AI Inferences & System Rationale\n`;
  model.inferences.forEach((inf, idx) => {
    md += `${idx + 1}. **${inf.inference}**\n   *Rationale:* ${inf.rationale} (Confidence: ${(
      inf.confidence * 100
    ).toFixed(0)}%)\n`;
  });
  md += `\n`;

  if (model.unknowns.length > 0) {
    md += `## 4. Critical Information Gaps (Unknowns To Resolve)\n`;
    model.unknowns.forEach((u, idx) => {
      md += `- [ ] **${u.question}**\n  *Why required:* ${u.whyNeeded}\n`;
    });
    md += `\n`;
  }

  md += `## 5. Connected Public & Private Support Systems\n`;
  model.systems.forEach((sys) => {
    md += `### ${sys.name} (${sys.agencyType})\n`;
    md += `- **Purpose:** ${sys.purpose}\n`;
    md += `- **Contact:** ${sys.contactChannel}\n`;
    md += `- **Required Documents:** ${sys.requiredDocuments.join(", ")}\n`;
    md += `- **Status:** ${sys.simulatedStatus} *(${sys.disclaimer})*\n\n`;
  });

  md += `## 6. Prioritized Action Plan\n\n`;

  if (p0Actions.length > 0) {
    md += `### 🔴 Phase 1: P0 Critical (Immediate 24h)\n`;
    p0Actions.forEach((a) => {
      md += `- [ ] **${a.title}** (${a.timeframe})\n  ${a.instruction}\n`;
      if (a.scriptOrTemplate) {
        md += `  > **${a.scriptOrTemplate.headline}:**\n  > "${a.scriptOrTemplate.body}"\n\n`;
      }
    });
  }

  if (p1Actions.length > 0) {
    md += `### 🟡 Phase 2: P1 High Priority (48-72h)\n`;
    p1Actions.forEach((a) => {
      md += `- [ ] **${a.title}** (${a.timeframe})\n  ${a.instruction}\n`;
      if (a.scriptOrTemplate) {
        md += `  > **${a.scriptOrTemplate.headline}:**\n  > "${a.scriptOrTemplate.body}"\n\n`;
      }
    });
  }

  if (p2Actions.length > 0) {
    md += `### 🔵 Phase 3: P2 Medium Term\n`;
    p2Actions.forEach((a) => {
      md += `- [ ] **${a.title}** (${a.timeframe})\n  ${a.instruction}\n`;
      if (a.scriptOrTemplate) {
        md += `  > **${a.scriptOrTemplate.headline}:**\n  > "${a.scriptOrTemplate.body}"\n\n`;
      }
    });
  }

  md += `\n---\n*Generated by THREAD — Universal Bridge between Human Intent and Complex Systems.*`;
  return md;
}
