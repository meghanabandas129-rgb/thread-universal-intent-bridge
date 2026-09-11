export const situationResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    metadata: {
      type: "object",
      properties: {
        analyzedAt: { type: "string" },
        modelUsed: { type: "string" },
        overallSeverity: { type: "string", enum: ["critical", "high", "moderate"] },
        summary: { type: "string" },
        primaryDomain: { type: "string" },
      },
      required: ["analyzedAt", "modelUsed", "overallSeverity", "summary", "primaryDomain"],
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          source: { type: "string", enum: ["user_story", "uploaded_image", "voice_transcript", "document_scan"] },
          content: { type: "string" },
          label: { type: "string" },
          confidence: { type: "number" },
        },
        required: ["id", "source", "content"],
      },
    },
    facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          statement: { type: "string" },
          evidenceId: { type: "string" },
        },
        required: ["id", "statement", "evidenceId"],
      },
    },
    inferences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          inference: { type: "string" },
          rationale: { type: "string" },
          confidence: { type: "number" },
        },
        required: ["id", "inference", "rationale", "confidence"],
      },
    },
    unknowns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          whyNeeded: { type: "string" },
          blockedActionIds: { type: "array", items: { type: "string" } },
          suggestedOptions: { type: "array", items: { type: "string" } },
        },
        required: ["id", "question", "whyNeeded", "blockedActionIds"],
      },
    },
    needs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: {
            type: "string",
            enum: ["shelter", "relief_aid", "document_recovery", "education", "health_safety", "legal_administrative", "financial"],
          },
          title: { type: "string" },
          description: { type: "string" },
          urgency: { type: "string", enum: ["immediate_24h", "urgent_72h", "medium_term"] },
          trustState: { type: "string", enum: ["USER_PROVIDED", "AI_INFERRED", "VERIFIED", "UNKNOWN"] },
          evidenceIds: { type: "array", items: { type: "string" } },
          whyReasoning: { type: "string" },
          systemIds: { type: "array", items: { type: "string" } },
          blockingNeedIds: { type: "array", items: { type: "string" } },
          actionIds: { type: "array", items: { type: "string" } },
        },
        required: ["id", "category", "title", "description", "urgency", "trustState", "evidenceIds", "whyReasoning", "systemIds", "blockingNeedIds"],
      },
    },
    systems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          agencyType: { type: "string", enum: ["government", "ngo_relief", "school_district", "healthcare", "utility", "legal_aid"] },
          purpose: { type: "string" },
          contactChannel: { type: "string" },
          requiredDocuments: { type: "array", items: { type: "string" } },
          simulatedStatus: { type: "string", enum: ["simulated_live", "portal_offline", "walk_in_only"] },
          disclaimer: { type: "string" },
        },
        required: ["id", "name", "agencyType", "purpose", "contactChannel", "requiredDocuments", "simulatedStatus", "disclaimer"],
      },
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          needId: { type: "string" },
          systemId: { type: "string" },
          title: { type: "string" },
          instruction: { type: "string" },
          priority: { type: "string", enum: ["P0_critical", "P1_high", "P2_normal"] },
          trustState: { type: "string", enum: ["USER_PROVIDED", "AI_INFERRED", "VERIFIED", "UNKNOWN"] },
          prerequisiteActionIds: { type: "array", items: { type: "string" } },
          timeframe: { type: "string" },
          deliverableType: { type: "string", enum: ["phone_call", "form_submission", "document_safekeeping", "in_person_visit", "notification"] },
          scriptOrTemplate: {
            type: "object",
            properties: {
              headline: { type: "string" },
              body: { type: "string" },
            },
            required: ["headline", "body"],
          },
          status: { type: "string", enum: ["pending", "in_progress", "completed"] },
        },
        required: ["id", "needId", "title", "instruction", "priority", "trustState", "prerequisiteActionIds", "timeframe", "deliverableType", "status"],
      },
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          sourceId: { type: "string" },
          targetId: { type: "string" },
          relationType: { type: "string", enum: ["depends_on", "triggers", "requires_system", "resolves_need"] },
          label: { type: "string" },
        },
        required: ["id", "sourceId", "targetId", "relationType", "label"],
      },
    },
  },
  required: ["id", "metadata", "evidence", "facts", "inferences", "unknowns", "needs", "systems", "actions", "relationships"],
};
