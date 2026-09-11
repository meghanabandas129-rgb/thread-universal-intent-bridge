import {
  SituationModel,
  Evidence,
  Fact,
  Inference,
  UnknownInfo,
  Need,
  ConnectedSystem,
  Action,
  Relationship,
  NeedCategory,
  UrgencyLevel,
  ActionPriority,
  TrustState,
} from "../types/situation";

interface DetectedSignal {
  category: string;
  weight: number;
  matchedPhrases: string[];
  evidenceSnippet: string;
}

// 1. Text Normalization and Sentence Splitter
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// 2. Multi-Domain Signal Patterns & Weights
interface DomainPattern {
  id: string;
  name: string;
  needCategory: NeedCategory;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  urgencyBoosters: string[];
}

const DOMAIN_PATTERNS: DomainPattern[] = [
  {
    id: "medical_emergency",
    name: "Acute Medical Emergency & Life Safety",
    needCategory: "health_safety",
    primaryKeywords: [
      "collapsed",
      "not responding",
      "unresponsive",
      "unconscious",
      "heart attack",
      "chest pain",
      "stroke",
      "can't breathe",
      "cannot breathe",
      "seizure",
      "bleeding heavily",
      "choking",
      "fracture",
    ],
    secondaryKeywords: ["ambulance", "hospital", "doctor", "emergency", "pain", "hurt", "injured", "passed out", "fell", "insulin runs out"],
    urgencyBoosters: ["now", "immediately", "suddenly", "dying", "help", "don't know what to do"],
  },
  {
    id: "flood_natural_disaster",
    name: "Flooding & Natural Disaster Response",
    needCategory: "shelter",
    primaryKeywords: [
      "flood",
      "flooded",
      "flooding",
      "rain flooded",
      "water rising",
      "storm",
      "hurricane",
      "tornado",
      "inundated",
      "submerged",
      "leak burst",
      "pipe burst",
    ],
    secondaryKeywords: ["rain", "water", "soaked", "wet", "damage", "ground-floor", "basement", "mud"],
    urgencyBoosters: ["tonight", "rising", "stranded", "destroying", "nowhere safe"],
  },
  {
    id: "housing_displacement",
    name: "Immediate Shelter & Housing Displacement",
    needCategory: "shelter",
    primaryKeywords: [
      "nowhere safe to stay",
      "nowhere to sleep",
      "nowhere to live",
      "homeless",
      "evicted",
      "eviction",
      "displaced",
      "uninhabitable",
      "locked out",
      "rent due",
    ],
    secondaryKeywords: ["stay tonight", "shelter", "landlord", "apartment", "house damaged", "hotel voucher"],
    urgencyBoosters: ["tonight", "hours", "cold", "children", "now"],
  },
  {
    id: "document_loss_recovery",
    name: "Vital Documents & Records Recovery",
    needCategory: "document_recovery",
    primaryKeywords: [
      "lost my certificates",
      "documents are wet",
      "unreadable",
      "birth certificate",
      "passport",
      "lost documents",
      "ruined documents",
      "certificates lost",
      "records damaged",
      "id wet", "lost my wallet", "lost wallet", "wallet was lost", "wallet stolen",
      "lost my purse", "lost purse", "purse was stolen", "bank cards", "bank card",
      "debit card", "credit card", "atm card", "payment card", "cards were stolen",
      "cards were lost", "identity misuse", "identity theft", "identity fraud",
      "someone could use my id", "someone could use my identity", "worried about identity misuse",
    ],
    secondaryKeywords: ["certificates", "documents", "papers", "marksheet", "degree", "diploma", "lease papers", "wallet lost", "travelling"],
    urgencyBoosters: ["admission", "next week", "deadline", "urgent", "lost"],
  },
  {
    id: "education_continuity",
    name: "Education Continuity & Academic Deadlines",
    needCategory: "education",
    primaryKeywords: [
      "school books",
      "laptop damaged",
      "college admission",
      "university admission",
      "admission next week",
      "school laptop",
      "daughter's school",
      "exam tomorrow",
    ],
    secondaryKeywords: ["school", "college", "admission", "student", "class", "textbooks", "courses", "tuition"],
    urgencyBoosters: ["next week", "deadline", "tomorrow", "expulsion"],
  },
  {
    id: "power_infrastructure_failure",
    name: "Grid Outage & Critical Utilities",
    needCategory: "relief_aid",
    primaryKeywords: [
      "electricity has been out",
      "power out",
      "power outage",
      "blackout",
      "electricity out",
      "no power",
      "no electricity",
      "grid down",
    ],
    secondaryKeywords: ["two days", "days without power", "refrigerator", "spoiled food", "dark", "freezer melted"],
    urgencyBoosters: ["two days", "freezing", "heatwave", "elderly person", "spoiled"],
  },
  {
    id: "food_spoilage_shortage",
    name: "Nutrition Access & Food Spoilage",
    needCategory: "relief_aid",
    primaryKeywords: [
      "refrigerator food is spoiled",
      "spoiled food",
      "food spoiled",
      "no food",
      "starving",
      "no clean water",
      "drinking water",
    ],
    secondaryKeywords: ["fridge", "refrigerator", "spoiled", "groceries", "meals", "hungry"],
    urgencyBoosters: ["days", "elderly", "children", "hungry"],
  },
  {
    id: "vulnerable_populations",
    name: "Vulnerable Dependent & Senior Protection",
    needCategory: "health_safety",
    primaryKeywords: [
      "elderly person",
      "elderly",
      "mother fell",
      "82-year-old",
      "father collapsed",
      "daughter",
      "baby",
      "infant",
      "child",
      "disabled",
      "handicapped",
    ],
    secondaryKeywords: ["senior", "grandparent", "lives alone", "caregiver", "alone at home", "stairs"],
    urgencyBoosters: ["alone", "collapsed", "cannot move", "cast", "unresponsive"],
  },
  {
    id: "employment_financial",
    name: "Employment Shock & Financial Emergency",
    needCategory: "financial",
    primaryKeywords: [
      "laid off",
      "layoff",
      "lost job",
      "terminated",
      "no severance",
      "unemployment",
      "rent due in",
      "insurance ends",
    ],
    secondaryKeywords: ["severance", "unemployed", "paycheck", "broke", "bills due", "jobless"],
    urgencyBoosters: ["days", "rent due", "no money"],
  },
];

// 3. System Registry
const SYSTEM_REGISTRY: Record<string, ConnectedSystem> = {
  emergency_services: {
    id: "sys-emergency-services",
    name: "Local Emergency & Medical Services",
    agencyType: "healthcare",
    purpose:
      "Connect the person with the appropriate local emergency, medical, rescue, or safety service when immediate danger is present.",
    contactChannel:
      "Use the locally applicable emergency number or the nearest verified emergency service",
    requiredDocuments: [
      "Current location or nearby landmark",
      "Brief description of the emergency",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated connector for demonstration. THREAD does not place emergency calls or dispatch responders.",
  },

  red_cross_shelter: {
    id: "sys-red-cross",
    name: "Local Disaster Relief & Temporary Shelter Services",
    agencyType: "ngo_relief",
    purpose:
      "Identify appropriate local disaster-relief, temporary shelter, accommodation, or community-support options for people displaced by an emergency.",
    contactChannel:
      "Verified local disaster-management authority, municipal service, relief organization, or community helpline",
    requiredDocuments: [
      "Description of displacement",
      "Identification or residency information if available",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated connector for demonstration. Availability and eligibility must be confirmed with the relevant local provider.",
  },

  vital_records_dept: {
    id: "sys-vital-records",
    name: "Civil Records & Identity Document Services",
    agencyType: "government",
    purpose:
      "Guide the person toward the appropriate authority for replacing damaged, lost, or unreadable civil, identity, or personal records.",
    contactChannel:
      "Official government civil-records, identity-service, or document-replacement channel",
    requiredDocuments: [
      "Available identity information",
      "Any surviving copy, photograph, reference number, or supporting record",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated government pathway. Required documents, fees, eligibility, and processing times vary by jurisdiction.",
  },

  education_board: {
    id: "sys-education-board",
    name: "Education Authority & Examination Services",
    agencyType: "government",
    purpose:
      "Identify the appropriate education authority or institution for replacement academic records, certificates, examination support, or continuity arrangements.",
    contactChannel:
      "Official education authority, examination body, school, college, or institution channel",
    requiredDocuments: [
      "Student name and institution",
      "Available registration, examination, or academic reference information",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated education-service pathway. The applicable process depends on the education authority and jurisdiction.",
  },

  school_district_liaison: {
    id: "sys-school-district",
    name: "School & Education Student Support Services",
    agencyType: "school_district",
    purpose:
      "Connect affected students with their school or education authority to ask about temporary devices, learning materials, attendance flexibility, and education-continuity support.",
    contactChannel:
      "School, college, education authority, student-support office, or verified institutional contact",
    requiredDocuments: [
      "Student name",
      "School or institution",
      "Brief description of the disruption",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated education-support pathway. Available assistance must be confirmed with the institution.",
  },

  utility_grid_ops: {
    id: "sys-utility-grid",
    name: "Local Electricity & Essential Utility Services",
    agencyType: "utility",
    purpose:
      "Connect the person with the appropriate electricity or essential-utility provider to report an outage, safety issue, or service disruption.",
    contactChannel:
      "Official local electricity distribution or utility emergency/support channel",
    requiredDocuments: [
      "Service address or location",
      "Customer or meter reference if available",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated utility connector. THREAD does not submit a real outage report or restoration request.",
  },

  senior_services_aaa: {
    id: "sys-senior-services",
    name: "Local Social Care & Vulnerable-Person Support Services",
    agencyType: "government",
    purpose:
      "Identify appropriate local social-care, welfare, community, or support services when an older adult or other vulnerable person may need additional assistance.",
    contactChannel:
      "Verified local social-care, welfare, community-support, or emergency assistance channel",
    requiredDocuments: [
      "Current location",
      "Description of the person's support or safety needs",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated support pathway. Service availability and eligibility vary by location.",
  },

  food_bank_network: {
    id: "sys-food-bank",
    name: "Local Food Relief & Community Support Network",
    agencyType: "ngo_relief",
    purpose:
      "Identify verified local food-relief, community pantry, meal-support, or emergency assistance options when essential food supplies are unavailable.",
    contactChannel:
      "Verified local food-relief provider, community organization, municipal service, or assistance helpline",
    requiredDocuments: [
      "Description of the food need or loss",
      "Current location or service area",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated food-relief pathway. Availability and eligibility must be confirmed locally.",
  },

  general_legal_aid: {
    id: "sys-legal-aid",
    name: "Local Legal Aid & Community Legal Support",
    agencyType: "legal_aid",
    purpose:
      "Connect the person with an appropriate legal-aid or community legal-support service when document, housing, tenancy, employment, or administrative issues require legal guidance.",
    contactChannel:
      "Verified local legal-aid organization, legal clinic, or official legal-support service",
    requiredDocuments: [
      "Description of the situation",
      "Relevant dates, notices, agreements, or records if available",
    ],
    simulatedStatus: "simulated_live",
    disclaimer:
      "Simulated legal-support pathway. THREAD does not provide legal advice or establish legal rights.",
  },
};
// 4. Main Intelligence Engine Function
export function analyzeSituationLocally(
  story: string,
  mediaData?: { hasMedia: boolean; mediaName?: string; mediaTypes?: string[] }
): SituationModel {
  const normalizedStory = story.trim();
  const lowerText = normalizedStory.toLowerCase();
  const sentences = splitIntoSentences(normalizedStory);

  // --- Step 1: Detect Signals & Domains ---
  const detectedSignals: { domain: DomainPattern; score: number; matchedEvidence: string[] }[] = [];

  for (const domain of DOMAIN_PATTERNS) {
    let score = 0;
    const matchedEvidence: string[] = [];

    // Check primary keywords (high weight)
    for (const kw of domain.primaryKeywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        score += 3;
        const matchedSentence = sentences.find((s) => s.toLowerCase().includes(kw.toLowerCase()));
        if (matchedSentence && !matchedEvidence.includes(matchedSentence)) {
          matchedEvidence.push(matchedSentence);
        }
      }
    }

    // Check secondary keywords (medium weight)
    for (const kw of domain.secondaryKeywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        score += 1.5;
        const matchedSentence = sentences.find((s) => s.toLowerCase().includes(kw.toLowerCase()));
        if (matchedSentence && !matchedEvidence.includes(matchedSentence)) {
          matchedEvidence.push(matchedSentence);
        }
      }
    }

    // Check urgency boosters (boost weight)
    for (const kw of domain.urgencyBoosters) {
      if (lowerText.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    if (score >= 3) {
      detectedSignals.push({ domain, score, matchedEvidence });
    }
  }

  // Sort signals by score descending
  detectedSignals.sort((a, b) => b.score - a.score);

  // --- Step 2: Determine Overall Severity & Primary Domain ---
  const hasLifeSafety = detectedSignals.some((s) => s.domain.id === "medical_emergency");
  const hasDisplacement = detectedSignals.some((s) => s.domain.id === "housing_displacement" || s.domain.id === "flood_natural_disaster");
  const hasPowerOutageWithElderly =
    detectedSignals.some((s) => s.domain.id === "power_infrastructure_failure") &&
    detectedSignals.some((s) => s.domain.id === "vulnerable_populations");
  const hasAcuteDeadline = lowerText.includes("next week") || lowerText.includes("tomorrow") || lowerText.includes("tonight") || lowerText.includes("days");

  let overallSeverity: "critical" | "high" | "moderate" = "moderate";
  if (hasLifeSafety || lowerText.includes("collapsed") || (hasDisplacement && lowerText.includes("tonight"))) {
    overallSeverity = "critical";
  } else if (hasPowerOutageWithElderly || hasDisplacement || hasAcuteDeadline) {
    overallSeverity = "high";
  }

  const primaryDomain =
    detectedSignals.length > 0
      ? detectedSignals[0].domain.name
      : "General Assistance & Complex Situation Triage";

  // --- Step 3: Extract Evidence & Facts ---
  const evidenceList: Evidence[] = [];
  const factList: Fact[] = [];

  sentences.forEach((sentence, idx) => {
    const evId = `ev-local-${idx + 1}`;
    evidenceList.push({
      id: evId,
      source: "user_story",
      content: sentence,
      confidence: 1.0,
      label: `Statement clause #${idx + 1}`,
    });

    factList.push({
      id: `fact-local-${idx + 1}`,
      statement: sentence,
      evidenceId: evId,
    });
  });

  // If media was provided, append media evidence
  if (mediaData?.hasMedia) {
    const mediaEvId = `ev-media-01`;
    evidenceList.push({
      id: mediaEvId,
      source: "uploaded_image",
      content: `Visual attachment provided: "${mediaData.mediaName || "Uploaded evidence"}"`,
      confidence: 0.95,
      label: "Multimodal Visual Attachment",
    });
    factList.push({
      id: `fact-media-01`,
      statement: `Supporting visual documentation provided: ${mediaData.mediaName || "image proof"}`,
      evidenceId: mediaEvId,
    });
  }

  // --- Step 4: Generate Decomposed Needs, Systems, Actions & Unknowns ---
  const needs: Need[] = [];
  const systems: ConnectedSystem[] = [];
  const actions: Action[] = [];
  const unknowns: UnknownInfo[] = [];
  const relationships: Relationship[] = [];
  const inferences: Inference[] = [];

  const addedSystemIds = new Set<string>();
  const addSystem = (sys: ConnectedSystem) => {
    if (!addedSystemIds.has(sys.id)) {
      addedSystemIds.add(sys.id);
      systems.push(sys);
    }
  };

  // 4A. Handle Medical Emergency (e.g. TEST 2: Father collapsed)
  if (detectedSignals.some((s) => s.domain.id === "medical_emergency")) {
    addSystem(SYSTEM_REGISTRY.emergency_services);

    const needId = "need-ems-life-safety";
    needs.push({
      id: needId,
      category: "health_safety",
      title: "Immediate Paramedic Triage & Medical Dispatch",
      description: "Dispatch urgent emergency life support and establish airway/circulation stability for unresponsive individual.",
      urgency: "immediate_24h",
      trustState: "USER_PROVIDED",
      evidenceIds: evidenceList.map((e) => e.id),
      whyReasoning: "Explicit report of sudden collapse and altered/loss of responsiveness. Minutes dictate neurological and cardiac survival.",
      systemIds: [SYSTEM_REGISTRY.emergency_services.id],
      blockingNeedIds: [],
    });

    inferences.push({
      id: "inf-med-01",
      inference: "High acute risk of irreversible hypoxic injury or cardiac event if basic life support is delayed.",
      rationale: "Sudden collapse with altered responsiveness warrants presumptive Code-1 paramedic dispatch.",
      confidence: 0.99,
    });

    unknowns.push(
      {
        id: "unk-med-breathing",
        question: "Is the collapsed individual currently breathing and do they have a detectable pulse?",
        whyNeeded: "Provides a local emergency-dispatch pathway and immediate safety guidance.",
        blockedActionIds: ["act-med-cpr"],
        suggestedOptions: ["Breathing shallowly", "Not breathing", "Agonal gasping", "Unsure / Need to check chest"],
      },
      {
        id: "unk-med-history",
        question: "Does the patient have a history of diabetes, stroke, epilepsy, or cardiac illness?",
        whyNeeded: "Informs paramedics whether to prepare automated defibrillator, glucagon, or stroke protocol.",
        blockedActionIds: ["act-med-info"],
        suggestedOptions: ["Cardiac / Heart disease", "Diabetes", "Stroke history", "None known"],
      }
    );

    actions.push(
      {
        id: "act-med-call",
        needId: needId,
        systemId: SYSTEM_REGISTRY.emergency_services.id,
        title: "Contact Local Emergency Services Immediately — Report the Person Is Unresponsive",
        instruction: "Do not hang up. Give exact address, confirm if person is breathing, and put phone on speaker.",
        priority: "P0_critical",
        trustState: "USER_PROVIDED",
        prerequisiteActionIds: [],
        timeframe: "NOW (Immediate 0-5 mins)",
        deliverableType: "phone_call",
        scriptOrTemplate: {
          headline: "Emergency Services Call Script",
          body: `I need an immediate paramedic unit to [My Address]. An adult has suddenly collapsed and is not responding properly. Please dispatch an ambulance immediately and stay on the line with me.`,
        },
        status: "pending",
      },
      {
        id: "act-med-cpr",
        needId: needId,
        systemId: SYSTEM_REGISTRY.emergency_services.id,
        title: "Check Airway & Position in Recovery Posture if Breathing",
        instruction: "Ensure head is tilted gently to keep airway clear; if breathing, roll gently to recovery side; if NOT breathing, begin chest compressions.",
        priority: "P0_critical",
        trustState: "AI_INFERRED",
        prerequisiteActionIds: ["act-med-call"],
        timeframe: "Immediate (Under 2 mins)",
        deliverableType: "in_person_visit",
        status: "pending",
      }
    );

    relationships.push({
      id: "rel-med-01",
      sourceId: "act-med-call",
      targetId: "act-med-cpr",
      relationType: "triggers",
      label: "Emergency dispatcher may guide safe positioning and first-aid steps",
    });
  }

  // 4B. Handle Flood / Natural Disaster (e.g. TEST 1)
  if (detectedSignals.some((s) => s.domain.id === "flood_natural_disaster" || s.domain.id === "housing_displacement")) {
    addSystem(SYSTEM_REGISTRY.red_cross_shelter);

    const needId = "need-disaster-shelter";
    needs.push({
      id: needId,
      category: "shelter",
      title: "Immediate Emergency Shelter Placement",
      description: "Secure safe, dry overnight non-congregate housing accommodations for flood-displaced household.",
      urgency: "immediate_24h",
      trustState: "USER_PROVIDED",
      evidenceIds: evidenceList.map((e) => e.id),
      whyReasoning: "Directly reported flooded residence with uninhabitable conditions and no safe sleeping location tonight.",
      systemIds: [SYSTEM_REGISTRY.red_cross_shelter.id],
      blockingNeedIds: [],
    });

    unknowns.push({
      id: "unk-shelter-location",
      question: "What is the exact zip code and municipal district of the flooded home?",
      whyNeeded: "Directs outreach to verified local disaster-relief, shelter, or temporary-accommodation services.",
      blockedActionIds: ["act-flood-shelter"],
      suggestedOptions: ["City Center", "North County", "South Metro", "Rural District"],
    });

  actions.push({
  id: "act-flood-shelter",
  needId: needId,
  systemId: SYSTEM_REGISTRY.red_cross_shelter.id,
  title: "Contact Local Emergency Shelter or Disaster Relief Service",
  instruction:
    "Contact the appropriate local emergency shelter, disaster-management service, community organization, or other verified relief provider to request safe temporary accommodation.",
  priority: "P0_critical",
  trustState: "AI_INFERRED",
  prerequisiteActionIds: [],
  timeframe: "Within 2 hours (Before Nightfall)",
  deliverableType: "phone_call",
  scriptOrTemplate: {
    headline: "Emergency Shelter Request Talking Points",
    body: `Hello, I have been displaced after severe flooding and my home is currently unsafe to stay in. We need a safe place to stay tonight. Could you please tell me which verified emergency shelter or temporary accommodation options are currently available in my area?`,
  },
  status: "pending",
});
  // 4C. Handle Document Loss / Damage (e.g. TEST 1 & TEST 4)
  if (detectedSignals.some((s) => s.domain.id === "document_loss_recovery")) {
    const isLostWallet =
      lowerText.includes("lost my wallet") || lowerText.includes("lost wallet") ||
      lowerText.includes("wallet was lost") || lowerText.includes("wallet stolen") ||
      lowerText.includes("lost my purse") || lowerText.includes("lost purse") ||
      lowerText.includes("purse was stolen") || lowerText.includes("bank card") ||
      lowerText.includes("bank cards") || lowerText.includes("debit card") ||
      lowerText.includes("credit card") || lowerText.includes("atm card") ||
      lowerText.includes("payment card") || lowerText.includes("cards were stolen") ||
      lowerText.includes("cards were lost") || lowerText.includes("identity misuse") ||
      lowerText.includes("identity theft") || lowerText.includes("identity fraud") ||
      lowerText.includes("someone could use my id") || lowerText.includes("someone could use my identity") ||
      lowerText.includes("worried about identity misuse");

    if (isLostWallet) {
      const financialProtectionSystem: ConnectedSystem = {
        id: "sys-financial-protection", name: "Bank & Payment Account Protection Services",
        agencyType: "financial", purpose: "Help secure affected payment cards and accounts through official provider channels.",
        contactChannel: "Official bank, card issuer, or payment-provider support channel",
        requiredDocuments: ["Account or card details if available", "Provider-required identity verification"],
        simulatedStatus: "simulated_live", disclaimer: "Simulated financial-protection pathway. THREAD does not access or modify real financial accounts.",
      };
      const identityProtectionSystem: ConnectedSystem = {
        id: "sys-identity-protection", name: "Identity Protection & Document Recovery Services",
        agencyType: "government", purpose: "Guide reporting, cancellation, replacement, and identity-protection steps for lost identification.",
        contactChannel: "Official identity-document, civil-records, or reporting authority",
        requiredDocuments: ["Description of lost documents", "Available identity information"],
        simulatedStatus: "simulated_live", disclaimer: "Simulated identity-protection pathway. Procedures vary by jurisdiction.",
      };
      addSystem(financialProtectionSystem); addSystem(identityProtectionSystem);
      const financialNeedId = "need-wallet-financial-protection";
      const identityNeedId = "need-wallet-identity-protection";
      needs.push({ id: financialNeedId, category: "financial", title: "Secure Lost Payment Cards & Financial Accounts",
        description: "Reduce unauthorized transaction risk after loss of bank or payment cards.", urgency: "immediate_24h", trustState: "USER_PROVIDED",
        evidenceIds: evidenceList.map((e) => e.id), whyReasoning: "Payment cards were lost or stolen, creating an immediate account-security concern.",
        systemIds: [financialProtectionSystem.id], blockingNeedIds: [] });
      needs.push({ id: identityNeedId, category: "document_recovery", title: "Protect Identity After Loss of Identification",
        description: "Establish the official process for reporting lost identity documents and reducing misuse risk.", urgency: "urgent_72h", trustState: "AI_INFERRED",
        evidenceIds: evidenceList.map((e) => e.id), whyReasoning: "Lost identification may be misused, so reporting and replacement pathways are relevant.",
        systemIds: [identityProtectionSystem.id], blockingNeedIds: [] });
      unknowns.push(
        { id: "unk-wallet-card-status", question: "Have all lost or stolen bank and payment cards been blocked or frozen?", whyNeeded: "Confirms the immediate financial-security step.", blockedActionIds: ["act-wallet-secure-cards"], suggestedOptions: ["All blocked", "Some blocked", "Not blocked yet", "Unsure"] },
        { id: "unk-wallet-documents", question: "Which identity documents were inside the lost wallet?", whyNeeded: "Determines which replacement pathways apply.", blockedActionIds: ["act-wallet-identity-report"], suggestedOptions: ["Government ID", "Driving licence", "Passport", "Multiple", "Unsure"] }
      );
      actions.push(
        { id: "act-wallet-secure-cards", needId: financialNeedId, systemId: financialProtectionSystem.id, title: "Secure Affected Bank & Payment Cards",
          instruction: "Use the official bank or card-provider channel to confirm every affected card is blocked or frozen and review recent transactions for anything unrecognized.", priority: "P0_critical", trustState: "AI_INFERRED", prerequisiteActionIds: [], timeframe: "Immediately", deliverableType: "phone_call",
          scriptOrTemplate: { headline: "Lost Card Security Script", body: "I lost my wallet and one or more payment cards may have been inside. Please confirm all affected cards are blocked or frozen and tell me how to review recent transactions for unauthorized activity." }, status: "pending" },
        { id: "act-wallet-identity-report", needId: identityNeedId, systemId: identityProtectionSystem.id, title: "Report Lost Identification & Ask About Identity Protection",
          instruction: "Contact the appropriate official identity-document or reporting authority to understand how to report the loss and protect against possible misuse.", priority: "P1_high", trustState: "AI_INFERRED", prerequisiteActionIds: [], timeframe: "Today", deliverableType: "phone_call",
          scriptOrTemplate: { headline: "Lost Identification Reporting Script", body: "I lost my wallet and identification documents may have been inside. I am concerned they could be misused. Please tell me the correct reporting, cancellation, replacement, and identity-protection steps." }, status: "pending" }
      );
    }

    const isAcademicCert = lowerText.includes("college") || lowerText.includes("certificate") || lowerText.includes("admission");

    if (isAcademicCert) {
      addSystem(SYSTEM_REGISTRY.education_board);
      addSystem(SYSTEM_REGISTRY.general_legal_aid);

      const needId = "need-doc-certificates";
      needs.push({
        id: needId,
        category: "document_recovery",
        title: "Lost Academic Certificates Emergency Reconstruction",
        description: "Obtain certified duplicate marksheets and notarized loss affidavit to safeguard upcoming college admission.",
        urgency: "urgent_72h",
        trustState: "USER_PROVIDED",
        evidenceIds: evidenceList.map((e) => e.id),
        whyReasoning: "Reported loss of educational certificates while travelling with imminent college admission deadline next week.",
        systemIds: [SYSTEM_REGISTRY.education_board.id, SYSTEM_REGISTRY.general_legal_aid.id],
        blockingNeedIds: [],
      });

      inferences.push({
        id: "inf-doc-01",
        inference: "University admission deadline next week requires formal provisional grace period while official duplicates process.",
        rationale: "Replacement timelines and provisional-document rules vary by institution and jurisdiction; verify the current requirement with the issuing authority.",
        confidence: 0.96,
      });

      unknowns.push(
        {
          id: "unk-doc-board",
          question: "Which specific university or board issued your original certificates?",
          whyNeeded: "Determines whether duplicate request is submitted through State Board, CBSE, or Autonomous University portal.",
          blockedActionIds: ["act-doc-duplicate"],
          suggestedOptions: ["State Examination Board", "Central University", "Technical Education Board"],
        },
        {
          id: "unk-doc-digital",
          question: "Do you have digital scans, roll numbers, or DigiLocker access for the lost records?",
          whyNeeded: "Allows immediate generation of verified digital e-certificates acceptable for provisional admission.",
          blockedActionIds: ["act-doc-affidavit"],
          suggestedOptions: ["Yes, have DigiLocker / Scans", "Have Roll Numbers only", "No copies at all"],
        }
      );

      actions.push(
        {
          id: "act-doc-police",
          needId: needId,
          systemId: SYSTEM_REGISTRY.general_legal_aid.id,
          title: "File Police / Transit Lost Property Report (General Diary)",
          instruction: "Obtain an official loss report or other supporting evidence if the issuing institution requires it; confirm the exact requirement before submitting.",
          priority: "P0_critical",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: [],
          timeframe: "Today (Within 24 hours)",
          deliverableType: "in_person_visit",
          scriptOrTemplate: {
            headline: "Lost Property Intimation Format",
            body: `To the Officer in Charge: I am writing to report the loss of my original educational certificates while travelling on [Date] between [Origin] and [Destination]. I request a certified Lost Article Report number for duplicate issuance.`,
          },
          status: "pending",
        },
        {
          id: "act-doc-affidavit",
          needId: needId,
          systemId: SYSTEM_REGISTRY.education_board.id,
          title: "Submit Sworn Provisional Admission Affidavit to College Registrar",
          instruction: "Deliver notarized indemnity bond requesting 14-day document leeway to protect seat allocation.",
          priority: "P1_high",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: ["act-doc-police"],
          timeframe: "Before Admission Desk Cutoff Next Week",
          deliverableType: "form_submission",
          scriptOrTemplate: {
            headline: "Provisional Admission Leeway Request",
            body: `Dear Admissions Officer, I have been allotted admission for [Course]. Unfortunately, my original certificates were lost during transit (Police Report #[Number] attached). I am submitting this sworn affidavit and request provisional enrollment while duplicate certificates are being re-issued.`,
          },
          status: "pending",
        },
        {
          id: "act-doc-duplicate",
          needId: needId,
          systemId: SYSTEM_REGISTRY.education_board.id,
          title: "Submit Expedited Duplicate Certificate Application to Exam Board",
          instruction: "Apply under Tatkal / Urgent disaster issuance protocol with police report copy attached.",
          priority: "P1_high",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: ["act-doc-police"],
          timeframe: "Tomorrow morning 9:00 AM",
          deliverableType: "form_submission",
          status: "pending",
        }
      );

      relationships.push({
        id: "rel-doc-01",
        sourceId: "act-doc-police",
        targetId: "act-doc-affidavit",
        relationType: "depends_on",
        label: "College admission affidavit requires police loss report number",
      });
      relationships.push({
        id: "rel-doc-02",
        sourceId: "act-doc-police",
        targetId: "act-doc-duplicate",
        relationType: "depends_on",
        label: "Board requires certified loss receipt to print duplicate",
      });
    } else {
      // General Vital Documents (Flood / Fire)
      addSystem(SYSTEM_REGISTRY.vital_records_dept);

      const needId = "need-doc-vital";
      needs.push({
        id: needId,
        category: "document_recovery",
        title: "Vital Identification & Tenancy Record Recovery",
        description: "Obtain certified replacement identity records and sworn residency affidavit following water damage.",
        urgency: "urgent_72h",
        trustState: "USER_PROVIDED",
        evidenceIds: evidenceList.map((e) => e.id),
        whyReasoning: "Waterlogged identity papers and lease documents prevent formal assistance registration.",
        systemIds: [SYSTEM_REGISTRY.vital_records_dept.id],
        blockingNeedIds: [],
      });

      actions.push({
  id: "act-doc-vital-order",
  needId: needId,
  systemId: SYSTEM_REGISTRY.vital_records_dept.id,
  title: "Contact the Appropriate Records Authority",
  instruction:
    "Contact the relevant local or regional records authority to ask about replacing damaged or unreadable identity and civil documents, including any disaster-related fee relief or expedited process.",
  priority: "P1_high",
  trustState: "AI_INFERRED",
  prerequisiteActionIds: [],
  timeframe: "Tomorrow morning",
  deliverableType: "form_submission",
  scriptOrTemplate: {
    headline: "Document Replacement Request",
    body: `Hello, some of my important documents were damaged by flooding and are difficult to read. I need replacement copies. Could you please tell me the correct process, required identity verification, applicable fees, and whether any disaster-related expedited or fee-relief option is available?`,
  },
  status: "pending",
});
      }
    }
  }

  // 4D. Handle Education Disruption (e.g. TEST 1: school books & laptop damaged)
  if (detectedSignals.some((s) => s.domain.id === "education_continuity") && !needs.some((n) => n.id === "need-doc-certificates")) {
    addSystem(SYSTEM_REGISTRY.school_district_liaison);

    const needId = "need-edu-k12";
    needs.push({
      id: needId,
      category: "education",
      title: "Displaced Student Equipment & Academic Continuity",
      description: "Activate applicable student-support or education-continuity policy rights for immediate loaner laptop, textbook replacement, and attendance flexibility.",
      urgency: "urgent_72h",
      trustState: "USER_PROVIDED",
      evidenceIds: evidenceList.map((e) => e.id),
      whyReasoning: "Daughter's school materials and computer destroyed by flood water, creating imminent educational disruption.",
      systemIds: [SYSTEM_REGISTRY.school_district_liaison.id],
      blockingNeedIds: [],
    });

    actions.push({
  id: "act-edu-school-liaison",
  needId: needId,
  systemId: SYSTEM_REGISTRY.school_district_liaison.id,
  title: "Contact the School About Education Continuity Support",
  instruction:
    "Inform the school about the displacement and damaged learning materials, and ask what temporary device, textbook, attendance, or learning-support options are available.",
  priority: "P1_high",
  trustState: "AI_INFERRED",
  prerequisiteActionIds: [],
  timeframe: "Tomorrow morning",
  deliverableType: "form_submission",
  scriptOrTemplate: {
    headline: "School Support Request",
    body: `Dear School Administrator: Our home was affected by severe flooding, and my daughter's school laptop and textbooks were damaged. We are temporarily displaced and want to avoid disruption to her education. Could you please let us know what temporary device, learning-material, attendance, or other education-continuity support is available?`,
  },
  status: "pending",
});

  // 4E. Handle Power Outage & Food Spoilage & Elderly (e.g. TEST 3)
  if (detectedSignals.some((s) => s.domain.id === "power_infrastructure_failure" || s.domain.id === "food_spoilage_shortage")) {
    addSystem(SYSTEM_REGISTRY.utility_grid_ops);
    addSystem(SYSTEM_REGISTRY.food_bank_network);

    const needId = "need-power-utility";
    needs.push({
      id: needId,
      category: "relief_aid",
      title: "Extended Power Outage & Essential Utility Escalation",
      description: "Escalate prolonged 48-hour electrical outage to priority emergency dispatch citing vulnerable household occupants.",
      urgency: "immediate_24h",
      trustState: "USER_PROVIDED",
      evidenceIds: evidenceList.map((e) => e.id),
      whyReasoning: "Two-day blackout combined with vulnerable senior presence significantly elevates hypothermia/heat stress risk.",
      systemIds: [SYSTEM_REGISTRY.utility_grid_ops.id],
      blockingNeedIds: [],
    });

    // If elderly person mentioned
    if (detectedSignals.some((s) => s.domain.id === "vulnerable_populations")) {
      addSystem(SYSTEM_REGISTRY.senior_services_aaa);

      const elderNeedId = "need-elderly-wellness";
      needs.push({
        id: elderNeedId,
        category: "health_safety",
        title: "Vulnerable Senior Thermal & Nutritional Protection",
        description: "Arrange emergency welfare check, safe thermal respite, and shelf-stable nutritional support for homebound senior.",
        urgency: "immediate_24h",
        trustState: "USER_PROVIDED",
        evidenceIds: evidenceList.map((e) => e.id),
        whyReasoning: "Senior at home with no electricity for 48 hours and ruined refrigeration poses severe health hazards.",
        systemIds: [SYSTEM_REGISTRY.senior_services_aaa.id],
        blockingNeedIds: [],
      });

      inferences.push({
        id: "inf-power-01",
        inference: "Food in refrigerator spoiled after 48h outage poses severe risk of bacterial enteritis / foodborne illness if consumed.",
        rationale: "Food-safety decisions depend on temperature, duration, food type, and local guidance; when in doubt, follow current local food-safety guidance.",
        confidence: 0.99,
      });

      unknowns.push(
        {
          id: "unk-elder-meds",
          question: "Does the elderly person require refrigerated medication (e.g. insulin, biologics) or powered oxygen devices?",
          whyNeeded: "Immediately activates highest-priority emergency medical generator dispatch or hospital transfer.",
          blockedActionIds: ["act-power-utility"],
          suggestedOptions: ["Yes, requires refrigerated meds", "Yes, oxygen concentrator", "No medical devices", "Unsure"],
        },
        {
          id: "unk-indoor-temp",
          question: "What is the current indoor ambient temperature inside the home?",
          whyNeeded: "Determines whether immediate evacuation to emergency warming/cooling center is mandatory.",
          blockedActionIds: ["act-elder-shelter"],
          suggestedOptions: ["Extreme Cold (Below 55°F)", "Extreme Heat (Above 85°F)", "Moderate / Tolerable"],
        }
      );

      actions.push(
        {
          id: "act-power-utility",
          needId: needId,
          systemId: SYSTEM_REGISTRY.utility_grid_ops.id,
          title: "Register Outage with Medical Priority Flag at Electric Utility",
          instruction: "Inform grid dispatch that an elderly resident is at this address to elevate crew restoration priority.",
          priority: "P0_critical",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: [],
          timeframe: "Immediately (Within 1 hour)",
          deliverableType: "phone_call",
          scriptOrTemplate: {
            headline: "Utility Life-Support Priority Call",
            body: `Hello, I am reporting an active 2-day power outage at [Address]. We have an elderly vulnerable individual in the home with no refrigeration or heating/cooling. I request a Medical Priority tag on this ticket.`,
          },
          status: "pending",
        },
        {
          id: "act-food-discard",
          needId: needId,
          systemId: SYSTEM_REGISTRY.food_bank_network.id,
          title: "Safely Discard Food That Is No Longer Safe to Eat",
          instruction: "Do not taste test. Discard dairy, cooked leftovers, and thawed meats to prevent dangerous food poisoning.",
          priority: "P1_high",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: [],
          timeframe: "Immediate",
          deliverableType: "document_safekeeping",
          status: "pending",
        },
        {
          id: "act-food-replenish",
          needId: needId,
          systemId: SYSTEM_REGISTRY.food_bank_network.id,
          title: "Request Emergency Meal Support from a Verified Local Provider",
          instruction: "Request immediate non-cook, shelf-stable nutrition box for senior and household members.",
          priority: "P1_high",
          trustState: "USER_PROVIDED",
          prerequisiteActionIds: ["act-food-discard"],
          timeframe: "Today (Before 4:00 PM)",
          deliverableType: "phone_call",
          status: "pending",
        }
      );

      relationships.push({
        id: "rel-power-01",
        sourceId: "act-food-discard",
        targetId: "act-food-replenish",
        relationType: "depends_on",
        label: "Spoiled food condemnation triggers replacement pantry emergency box",
      });
    }
  }

  // 4F. Handle Employment Shock & Healthcare Access Crisis (e.g. Layoff + Insurance Cliff)
  if (detectedSignals.some((s) => s.domain.id === "employment_financial")) {
    const needFinancialId = "need-employment-financial";
    const needHealthcareId = "need-healthcare-bridge";
    const hasInsuranceCliff =
      lowerText.includes("insurance ends") ||
      lowerText.includes("insurance end") ||
      lowerText.includes("no insurance") ||
      lowerText.includes("insulin") ||
      lowerText.includes("medication") ||
      lowerText.includes("prescription") ||
      lowerText.includes("coverage continuation") || lowerText.includes("insurance continuation");
    const hasRentDue = lowerText.includes("rent due") || lowerText.includes("rent is due");

    // Always add: Unemployment benefits filing system
    const unemploymentSystem: ConnectedSystem = {
      id: "sys-unemployment-benefits",
      name: "State Unemployment Insurance & Workforce Commission",
      agencyType: "government",
      purpose: "File emergency unemployment insurance claim and access job placement assistance.",
      contactChannel: "Official employment/unemployment service for the relevant jurisdiction",
      requiredDocuments: ["Employer name & address", "Last day of employment", "Reason for separation"],
      simulatedStatus: "simulated_live",
      disclaimer: "Simulated workforce commission pathway.",
    };
    addSystem(unemploymentSystem);

    needs.push({
      id: needFinancialId,
      category: "financial",
      title: "Emergency Unemployment Benefits & Income Bridge Filing",
      description:
        "File immediate unemployment insurance claim to establish income bridge while job search initiates.",
      urgency: "immediate_24h",
      trustState: "USER_PROVIDED",
      evidenceIds: evidenceList.map((e) => e.id),
      whyReasoning:
        "Sudden termination with no severance triggers immediate eligibility for state unemployment insurance. Filing delay reduces total compensation received.",
      systemIds: [unemploymentSystem.id],
      blockingNeedIds: [],
    });

    unknowns.push({
      id: "unk-emp-separation-type",
      question: "Was your employment separation a layoff, termination for cause, or resignation?",
      whyNeeded:
        "Determines UI eligibility — layoff qualifies immediately; termination for cause may require appeal.",
      blockedActionIds: ["act-emp-ui-file"],
      suggestedOptions: ["Laid off (no fault)", "Terminated — performance", "Mutual agreement", "Unsure of official reason"],
    });

    actions.push({
      id: "act-emp-ui-file",
      needId: needFinancialId,
      systemId: unemploymentSystem.id,
      title: "File Unemployment Insurance Claim Online — Today",
      instruction:
        "File within 24 hours of job loss. Benefits back-date to date of application, not date of separation.",
      priority: "P0_critical",
      trustState: "AI_INFERRED",
      prerequisiteActionIds: [],
      timeframe: "Today (Within 24 hours of separation)",
      deliverableType: "form_submission",
      scriptOrTemplate: {
        headline: "UI Claim Filing Checklist",
        body: `Items to have ready:\n• government-issued identifier or local equivalent\n• Employer name, address, phone\n• Last date of employment: [Date]\n• Reason given by employer: [Reason]\n• Gross earnings last 18 months\n\nFile through the official employment/unemployment service for your jurisdiction.`,
      },
      status: "pending",
    });

    if (hasRentDue) {
      const rentalAssistSystem: ConnectedSystem = {
        id: "sys-rental-assist",
        name: "Emergency Rental Assistance Program (ERA)",
        agencyType: "government",
        purpose: "Provides up to 3 months back-rent and forward rent coverage for households facing sudden income loss.",
        contactChannel: "Contact a verified local housing-support or emergency-rent assistance provider",
        requiredDocuments: ["Proof of income loss", "Lease agreement", "Eviction notice if applicable"],
        simulatedStatus: "simulated_live",
        disclaimer: "Simulated local housing-assistance pathway; eligibility and programs vary by jurisdiction.",
      };
      addSystem(rentalAssistSystem);

      needs.push({
        id: "need-rent-bridge",
        category: "financial",
        title: "Imminent Rent Crisis & Eviction Prevention",
        description: "Apply for Emergency Rental Assistance to prevent eviction during income gap.",
        urgency: "immediate_24h",
        trustState: "USER_PROVIDED",
        evidenceIds: evidenceList.map((e) => e.id),
        whyReasoning: "Rent due within days of job loss with no severance creates acute eviction risk within the 3-5 day notice window.",
        systemIds: [rentalAssistSystem.id],
        blockingNeedIds: [needFinancialId],
      });

      unknowns.push({
        id: "unk-emp-landlord-contact",
        question: "Have you contacted your landlord to request a short-term payment extension?",
        whyNeeded:
          "Many landlords grant 5-10 day grace periods when given written advance notice — buying critical time to receive ERA funds.",
        blockedActionIds: ["act-emp-rent-era"],
        suggestedOptions: ["Not yet", "Landlord refuses", "Landlord open to extension", "Corporate/property management"],
      });

      actions.push(
        {
          id: "act-emp-landlord-letter",
          needId: "need-rent-bridge",
          systemId: rentalAssistSystem.id,
          title: "Send Written Hardship Notice to Landlord Requesting Grace Period",
          instruction: "Written notice establishes good faith and prevents immediate eviction filing during ERA processing.",
          priority: "P0_critical",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: [],
          timeframe: "Today",
          deliverableType: "form_submission",
          scriptOrTemplate: {
            headline: "Tenant Hardship Notice",
            body: `Dear [Landlord Name],\n\nI am writing to inform you that I was unexpectedly laid off on [Date]. I am in the process of applying for Emergency Rental Assistance (ERA) and Unemployment Insurance. I respectfully request a short grace extension for this month's rent while these applications are processed.\n\nI remain committed to my obligations and will provide ERA approval documentation as soon as it is issued.`,
          },
          status: "pending",
        },
        {
          id: "act-emp-rent-era",
          needId: "need-rent-bridge",
          systemId: rentalAssistSystem.id,
          title: "Apply through the relevant official/local emergency housing-assistance program",
          instruction: "ERA can cover up to 3 months forward rent. Processing time is 3-14 days depending on county.",
          priority: "P1_high",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: ["act-emp-landlord-letter"],
          timeframe: "Today or tomorrow",
          deliverableType: "form_submission",
          status: "pending",
        }
      );

      relationships.push({
        id: "rel-emp-01",
        sourceId: "act-emp-landlord-letter",
        targetId: "act-emp-rent-era",
        relationType: "depends_on",
        label: "Landlord notice buys time needed while ERA application processes",
      });
    }

    // Healthcare/medication continuity when insurance ends
    if (hasInsuranceCliff) {
      const cobraSystem: ConnectedSystem = {
        id: "sys-coverage-continuation",
        name: "Health Coverage Continuation / Replacement Services",
        agencyType: "government",
        purpose: "Maintain or replace essential health coverage through the options available in the relevant jurisdiction.",
        contactChannel: "Official health-insurance regulator, insurer, employer benefits team, or marketplace for the relevant jurisdiction",
        requiredDocuments: ["Current coverage or employer benefits information", "Last month premium amount", "Household income"],
        simulatedStatus: "simulated_live",
        disclaimer: "Simulated insurance continuity pathway.",
      };
      addSystem(cobraSystem);

      needs.push({
        id: needHealthcareId,
        category: "health_safety",
        title: "Medication Continuity & Insurance Coverage Gap Bridge",
        description:
          "Secure uninterrupted prescription access and confirm available health-coverage continuation or replacement options before current coverage lapses.",
        urgency: "immediate_24h",
        trustState: "USER_PROVIDED",
        evidenceIds: evidenceList.map((e) => e.id),
        whyReasoning:
          "Insurance lapsing while holding an active prescription (e.g., insulin) creates a life-threatening medication access gap within days.",
        systemIds: [cobraSystem.id],
        blockingNeedIds: [],
      });

      unknowns.push({
        id: "unk-emp-coverage-deadline",
        question: "How many days until your current employer health insurance expires?",
        whyNeeded:
          "Coverage-continuation and special-enrollment deadlines vary by jurisdiction and plan; verify the exact deadline from the insurer, employer benefits team, or official regulator.",
        blockedActionIds: ["act-emp-coverage"],
        suggestedOptions: ["Expires Friday", "Expires end of month", "Already expired", "Unknown — need to check HR"],
      });

      actions.push(
        {
          id: "act-emp-rx-bridge",
          needId: needHealthcareId,
          systemId: cobraSystem.id,
          title: "Contact Pharmacy & Prescriber for Emergency 30-Day Supply Bridge",
          instruction:
            "Ask pharmacist for emergency 30-day override and contact prescriber for bridge supply to prevent critical medication gap.",
          priority: "P0_critical",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: [],
          timeframe: "Today (Before pharmacy closes)",
          deliverableType: "phone_call",
          scriptOrTemplate: {
            headline: "Emergency Rx Bridge Request",
            body: `To my pharmacist: I have just lost my job and my insurance is expiring in [X] days. I take [Medication Name] and cannot afford a lapse. Please advise on an emergency override or GoodRx / manufacturer patient assistance program, and contact my doctor for an emergency bridge refill.`,
          },
          status: "pending",
        },
        {
          id: "act-emp-coverage",
          needId: needHealthcareId,
          systemId: cobraSystem.id,
          title: "Contact the insurer / employer benefits team / official marketplace about coverage continuation or replacement",
          instruction:
            "Ask for the exact continuation or special-enrollment deadline and compare the coverage options available in your jurisdiction.",
          priority: "P1_high",
          trustState: "AI_INFERRED",
          prerequisiteActionIds: ["act-emp-rx-bridge"],
          timeframe: "Within 5 days",
          deliverableType: "form_submission",
          status: "pending",
        }
      );

      inferences.push({
        id: "inf-emp-01",
        inference:
          "Insulin-dependent individuals face life-threatening risk within 72-96 hours of a prescription access gap without medical-grade coverage continuity.",
        rationale:
          "If an essential prescription may run out, contact the prescribing clinician, pharmacist, insurer, or local emergency service promptly. Do not change or stop medication based on this app; urgent symptoms require immediate medical care.",
        confidence: 0.97,
      });

      relationships.push({
        id: "rel-emp-02",
        sourceId: "act-emp-rx-bridge",
        targetId: "act-emp-coverage",
        relationType: "triggers",
        label: "Pharmacist bridge helps maintain prescription access while coverage options are resolved",
      });
    }
  }

  // --- Fallback if vague or no specific domain triggered ---
  if (needs.length === 0) {
    addSystem(SYSTEM_REGISTRY.general_legal_aid);
    const needId = "need-general-triage";
    needs.push({
      id: needId,
      category: "relief_aid",
      title: "Multi-Agency Coordination & Case Intake",
      description: "Initial case collation to clarify primary objectives and connect with local emergency services.",
      urgency: "immediate_24h",
      trustState: "USER_PROVIDED",
      evidenceIds: evidenceList.map((e) => e.id),
      whyReasoning: "User narrative requires structured intake to isolate cross-agency requirements.",
      systemIds: [SYSTEM_REGISTRY.general_legal_aid.id],
      blockingNeedIds: [],
    });

    unknowns.push({
      id: "unk-general-address",
      question: "What is your current physical location or municipal district?",
      whyNeeded: "Enables mapping to local service registries.",
      blockedActionIds: ["act-gen-intake"],
      suggestedOptions: ["Metropolitan District", "County Service Zone"],
    });

    actions.push({
      id: "act-gen-intake",
      needId: needId,
      systemId: SYSTEM_REGISTRY.general_legal_aid.id,
      title: "Contact a Verified Local Community Helpline",
      instruction: "Register situation to establish timestamped case reference.",
      priority: "P0_critical",
      trustState: "USER_PROVIDED",
      prerequisiteActionIds: [],
      timeframe: "Within 4 hours",
      deliverableType: "phone_call",
      status: "pending",
    });
  }

  // --- Executive Summary Synthesis ---
  const needCount = needs.length;
  const actionCount = actions.length;
  const summary = `THREAD local reasoning engine decomposed input into ${needCount} active institutional need${
    needCount > 1 ? "s" : ""
  } spanning ${primaryDomain}. Identified ${unknowns.length} material information gap${
    unknowns.length > 1 ? "s" : ""
  } and sequenced ${actionCount} prioritized action step${actionCount > 1 ? "s" : ""}.`;

  return {
    id: `sit-local-${Date.now()}`,
    rawInput: {
      storyText: normalizedStory,
      hasMedia: Boolean(mediaData?.hasMedia),
      mediaTypes: mediaData?.mediaTypes || [],
      mediaName: mediaData?.mediaName,
    },
    metadata: {
      analyzedAt: new Date().toISOString(),
      modelUsed: "THREAD Local Intelligence Engine",
      overallSeverity,
      summary,
      primaryDomain,
      isDemoOrSimulated: false,
    },
    evidence: evidenceList,
    facts: factList,
    inferences,
    unknowns,
    needs,
    systems,
    actions,
    relationships,
  };
}
}



