/**
 * Core data schema for the Anesthesia Resident Assistant.
 *
 * IMPORTANT — DATA PROVENANCE MODEL
 * ----------------------------------
 * Every clinical fact in this app carries a `SourceRef` and a
 * `verificationStatus`. Nothing should ever be marked "verified"
 * unless it has been checked, by a qualified clinician, against the
 * actual primary document (ISA guideline PDF, AHA/ACLS algorithm,
 * institutional protocol, etc.) — not against an AI's memory.
 *
 * `unverified-ai-seed` entries exist only as structural placeholders
 * so the UI and search index have something to render; they must be
 * reviewed before this app is used for real clinical decisions.
 */

export type EvidenceLevel =
  | "Guideline (Class I)"
  | "Guideline (Class IIa)"
  | "Guideline (Class IIb)"
  | "Guideline (Class III)"
  | "Expert consensus"
  | "Not graded";

export type VerificationStatus =
  | "verified"          // Checked against primary source by a clinician reviewer
  | "needs-review"       // Imported but not yet clinician-reviewed
  | "unverified-ai-seed"; // Placeholder seed data — DO NOT use clinically as-is

export interface SourceRef {
  organization: string;   // e.g. "Indian Society of Anaesthesiologists (ISA)"
  title: string;          // e.g. "ISA Guidelines for Difficult Airway Management"
  year: number;
  version?: string;
  lastUpdated?: string;   // ISO date
  url?: string;
  evidenceLevel?: EvidenceLevel;
}

export interface DrugDose {
  label: string;          // e.g. "Adult induction"
  value: string;          // e.g. "1–2.5 mg/kg IV"
  notes?: string;
}

// Color used for the drug-class badge (hard-coded hex, not a clinical claim).
export type DrugClassColor =
  | "indigo" | "rose" | "amber" | "emerald" | "sky" | "violet"
  | "orange" | "teal" | "slate" | "fuchsia" | "lime" | "cyan";

export interface Drug {
  id: string;
  genericName: string;
  brandExamplesIndia: string[];
  drugClass: string;
  classColor?: DrugClassColor; // drives the color-coded class badge
  mechanism: string;
  concentrations: string[];
  preparation?: string;
  dilution?: string;
  // Rapid-use helpers (OT-first). Infusion prep strings are copy-paste ready,
  // e.g. "4 mg in 50 mL NS → 80 mcg/mL".
  infusionPrep?: string;
  rsi?: DrugDose;             // rapid sequence induction bolus
  pediatricRsi?: DrugDose;    // infant/child RSI (when distinct from adult RSI)
  fluidCompatibility?: string; // e.g. "Compatible with NS, RL, dextrose"
  storage?: string;
  pharmacokinetics: {
    onset?: string;
    peak?: string;
    duration?: string;
    proteinBinding?: string;
    halfLife?: string;
    metabolism?: string;
    excretion?: string;
  };
  doses: {
    adult?: DrugDose;
    pediatric?: DrugDose;
    geriatric?: DrugDose;
    obese?: DrugDose;
    renalAdjustment?: DrugDose;
    hepaticAdjustment?: DrugDose;
    infusion?: DrugDose;
    emergency?: DrugDose;
    maximum?: DrugDose;
  };
  // Pregnancy / lactation are kept as short strings so the card can show icons.
  // Values: "safe" | "caution" | "avoid" | "unknown" (clinical nuance in free text).
  pregnancyCategory?: "safe" | "caution" | "avoid" | "unknown";
  pregnancy?: string;
  lactation?: string;
  contraindications: string[];
  interactions: string[];
  sideEffects: string[];
  overdoseManagement?: string;
  monitoring: string[];
  ampouleColor?: string; // per ISA colour-coding convention where applicable
  quickTips?: string[];
  tags: string[]; // e.g. "emergency", "RSI", "ACLS", "push-dose-pressor"
  source: SourceRef;
  verificationStatus: VerificationStatus;
}

export interface ProtocolSection {
  heading: string;
  body: string; // plain-language summary, NOT verbatim guideline text
}

export interface Protocol {
  id: string;
  title: string;
  category: string;
  summary: string;
  sections: ProtocolSection[];
  flowchartDescription?: string; // textual description of decision flow
  source: SourceRef;
  verificationStatus: VerificationStatus;
}

export interface CrisisStep {
  id: string;
  title: string;
  instruction: string;
  timerSeconds?: number;
  drugSuggestions?: string[]; // free text, cross-links to Drug.id where possible
  checklist?: string[];
}

export interface CrisisAlgorithm {
  id: string;
  title: string;
  category: string;
  triggerCriteria: string;
  steps: CrisisStep[];
  source: SourceRef;
  verificationStatus: VerificationStatus;
}

export interface ChecklistItem {
  id: string;
  label: string;
  critical?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  phase: string; // e.g. "Sign In", "Time Out", "Sign Out"
  items: ChecklistItem[];
  source: SourceRef;
  verificationStatus: VerificationStatus;
}

// -------- Regional anesthesia block library --------

export type RegionalBlockCategory =
  | "Upper limb"
  | "Lower limb"
  | "Trunk & abdominal wall"
  | "Neuraxial"
  | "Head & neck";

export interface RegionalBlock {
  id: string;
  name: string;
  category: RegionalBlockCategory;
  targetNervesOrPlane: string; // e.g. "Brachial plexus, trunks"
  commonIndications: string[];
  patientPosition: string;
  landmarkTechnique?: string; // plain-language landmark description (no image)
  ultrasoundApproach?: string; // plain-language sonoanatomy description (no image/video)
  needleApproach?: string;
  localAnestheticVolume: string; // e.g. "20–30 mL" — a taught range, not a prescription
  onsetTime?: string;
  keyComplications: string[];
  contraindications: string[];
  pearls: string[];
  source: SourceRef;
  verificationStatus: VerificationStatus;
}

export type SearchableKind = "drug" | "protocol" | "crisis" | "checklist" | "calculator" | "airway" | "regional-block";

export interface SearchDoc {
  kind: SearchableKind;
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  href: string;
}

// -------- Patient Case Mode (OT plan generator) --------

export type Sex = "male" | "female";
export type AsaStatus = "I" | "II" | "III" | "IV" | "V" | "VI" | "E";

export interface CaseInput {
  ageYears: number;
  weightKg: number;
  sex: Sex;
  asa: AsaStatus;
  surgery?: string;
  comorbidities: string[]; // e.g. "renal-failure", "ckd", "pregnancy", "copd"
}

// A generated plan row returned by the case engine. `rationale` is short and
// flags that it is heuristic (not a substitute for clinician judgement).
export interface CasePlanRow {
  section: string; // "Induction" | "Airway" | "Monitoring" | "Analgesia" | "Antiemetic" | "Antibiotic"
  text: string;
  rationale?: string;
  drugIds?: string[]; // cross-links into the drug handbook
}

export interface CaseRecord {
  id: string;
  input: CaseInput;
  plan: CasePlanRow[];
  createdAt: number;
  label?: string; // e.g. "65M / Lap chole"
}

// -------- IndexedDB record shapes (user-generated, local-only) --------

export interface FavoriteRecord {
  id: string;          // `${kind}:${refId}`
  kind: SearchableKind;
  refId: string;
  createdAt: number;
}

export interface NoteRecord {
  id: string;
  title: string;
  body: string;
  linkedRefId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalculatorHistoryRecord {
  id: string;
  calculatorId: string;
  inputs: Record<string, number | string>;
  result: Record<string, number | string>;
  createdAt: number;
}
