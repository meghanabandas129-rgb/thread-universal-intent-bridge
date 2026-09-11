import { z } from "zod";

export type TrustState = "USER_PROVIDED" | "AI_INFERRED" | "VERIFIED" | "UNKNOWN";

export type UrgencyLevel = "immediate_24h" | "urgent_72h" | "medium_term";

export type ActionPriority = "P0_critical" | "P1_high" | "P2_normal";

export type NeedCategory =
  | "shelter"
  | "relief_aid"
  | "document_recovery"
  | "education"
  | "health_safety"
  | "legal_administrative"
  | "financial";

export interface Evidence {
  id: string;
  source: "user_story" | "uploaded_image" | "voice_transcript" | "document_scan";
  content: string;
  label?: string;
  confidence?: number;
}

export interface Fact {
  id: string;
  statement: string;
  evidenceId: string;
}

export interface Inference {
  id: string;
  inference: string;
  rationale: string;
  confidence: number;
}

export interface UnknownInfo {
  id: string;
  question: string;
  whyNeeded: string;
  blockedActionIds: string[];
  suggestedOptions?: string[];
  resolvedValue?: string;
}

export interface ConnectedSystem {
  id: string;
  name: string;
  agencyType: "government" | "ngo_relief" | "school_district" | "healthcare" | "utility" | "legal_aid";
  purpose: string;
  contactChannel: string;
  requiredDocuments: string[];
  simulatedStatus: "simulated_live" | "portal_offline" | "walk_in_only";
  disclaimer: string;
}

export interface Action {
  id: string;
  needId: string;
  systemId?: string;
  title: string;
  instruction: string;
  priority: ActionPriority;
  trustState: TrustState;
  prerequisiteActionIds: string[];
  timeframe: string;
  deliverableType: "phone_call" | "form_submission" | "document_safekeeping" | "in_person_visit" | "notification";
  scriptOrTemplate?: {
    headline: string;
    body: string;
  };
  status: "pending" | "in_progress" | "completed";
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: "depends_on" | "triggers" | "requires_system" | "resolves_need";
  label: string;
}

export interface Need {
  id: string;
  category: NeedCategory;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  trustState: TrustState;
  evidenceIds: string[];
  whyReasoning: string;
  systemIds: string[];
  blockingNeedIds: string[];
  actionIds?: string[];
  resolved?: boolean;
}

export interface SituationModel {
  id: string;
  rawInput: {
    storyText: string;
    hasMedia: boolean;
    mediaTypes?: string[];
    mediaName?: string;
  };
  metadata: {
    analyzedAt: string;
    modelUsed: string;
    overallSeverity: "critical" | "high" | "moderate";
    summary: string;
    primaryDomain: string;
    isDemoOrSimulated?: boolean;
  };
  evidence: Evidence[];
  facts: Fact[];
  inferences: Inference[];
  unknowns: UnknownInfo[];
  needs: Need[];
  systems: ConnectedSystem[];
  actions: Action[];
  relationships: Relationship[];
}

// Zod validation schemas
export const EvidenceSchema = z.object({
  id: z.string(),
  source: z.enum(["user_story", "uploaded_image", "voice_transcript", "document_scan"]),
  content: z.string(),
  label: z.string().optional(),
  confidence: z.number().optional(),
});

export const FactSchema = z.object({
  id: z.string(),
  statement: z.string(),
  evidenceId: z.string(),
});

export const InferenceSchema = z.object({
  id: z.string(),
  inference: z.string(),
  rationale: z.string(),
  confidence: z.number(),
});

export const UnknownInfoSchema = z.object({
  id: z.string(),
  question: z.string(),
  whyNeeded: z.string(),
  blockedActionIds: z.array(z.string()),
  suggestedOptions: z.array(z.string()).optional(),
  resolvedValue: z.string().optional(),
});

export const ConnectedSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  agencyType: z.enum(["government", "ngo_relief", "school_district", "healthcare", "utility", "legal_aid"]),
  purpose: z.string(),
  contactChannel: z.string(),
  requiredDocuments: z.array(z.string()),
  simulatedStatus: z.enum(["simulated_live", "portal_offline", "walk_in_only"]),
  disclaimer: z.string(),
});

export const ActionSchema = z.object({
  id: z.string(),
  needId: z.string(),
  systemId: z.string().optional(),
  title: z.string(),
  instruction: z.string(),
  priority: z.enum(["P0_critical", "P1_high", "P2_normal"]),
  trustState: z.enum(["USER_PROVIDED", "AI_INFERRED", "VERIFIED", "UNKNOWN"]),
  prerequisiteActionIds: z.array(z.string()),
  timeframe: z.string(),
  deliverableType: z.enum(["phone_call", "form_submission", "document_safekeeping", "in_person_visit", "notification"]),
  scriptOrTemplate: z
    .object({
      headline: z.string(),
      body: z.string(),
    })
    .optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export const RelationshipSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  relationType: z.enum(["depends_on", "triggers", "requires_system", "resolves_need"]),
  label: z.string(),
});

export const NeedSchema = z.object({
  id: z.string(),
  category: z.enum([
    "shelter",
    "relief_aid",
    "document_recovery",
    "education",
    "health_safety",
    "legal_administrative",
    "financial",
  ]),
  title: z.string(),
  description: z.string(),
  urgency: z.enum(["immediate_24h", "urgent_72h", "medium_term"]),
  trustState: z.enum(["USER_PROVIDED", "AI_INFERRED", "VERIFIED", "UNKNOWN"]),
  evidenceIds: z.array(z.string()),
  whyReasoning: z.string(),
  systemIds: z.array(z.string()),
  blockingNeedIds: z.array(z.string()),
  actionIds: z.array(z.string()).optional(),
  resolved: z.boolean().optional(),
});

export const SituationModelSchema = z.object({
  id: z.string(),
  rawInput: z.object({
    storyText: z.string(),
    hasMedia: z.boolean(),
    mediaTypes: z.array(z.string()).optional(),
    mediaName: z.string().optional(),
  }),
  metadata: z.object({
    analyzedAt: z.string(),
    modelUsed: z.string(),
    overallSeverity: z.enum(["critical", "high", "moderate"]),
    summary: z.string(),
    primaryDomain: z.string(),
    isDemoOrSimulated: z.boolean().optional(),
  }),
  evidence: z.array(EvidenceSchema),
  facts: z.array(FactSchema),
  inferences: z.array(InferenceSchema),
  unknowns: z.array(UnknownInfoSchema),
  needs: z.array(NeedSchema),
  systems: z.array(ConnectedSystemSchema),
  actions: z.array(ActionSchema),
  relationships: z.array(RelationshipSchema),
});
