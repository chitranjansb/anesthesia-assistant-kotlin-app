import type { CaseInput, CasePlanRow } from "./types";

// Heuristic patient-case plan generator.
//
// IMPORTANT: These are STRUCTURAL SUGGESTIONS only — they encode common
// anaesthesia teaching patterns, NOT a verified clinical protocol. Every
// suggestion must be reconciled with the actual patient, institutional
// protocol, and a supervising clinician. The plan is returned with a
// `rationale` and drug cross-links so the resident can open each monograph
// (all tagged needs-review) for the real dosing detail.

export function generateCasePlan(input: CaseInput): CasePlanRow[] {
  const { ageYears, weightKg, sex, asa, surgery = "", comorbidities } = input;
  const co = new Set(comorbidities.map((c) => c.toLowerCase()));
  const isPregnant = co.has("pregnancy") || co.has("obstetric");
  const isRenal = co.has("renal-failure") || co.has("ckd") || co.has("renal insufficiency");
  const isHepatic = co.has("liver") || co.has("cirrhosis") || co.has("hepatic-failure");
  const isCopd = co.has("copd") || co.has("asthma") || co.has("bronchospasm");
  const isElderly = ageYears >= 65;
  const isPediatric = ageYears < 16;
  const highRisk = asa === "III" || asa === "IV" || asa === "V" || asa.startsWith("E");
  const major = /lap|lapar|thorac|vascular|neuro|ortho|spine|abdo|intracranial|cardiac/i.test(surgery);

  const rows: CasePlanRow[] = [];

  // ---- Induction ----
  const inductionDrug = highRisk || isPregnant ? "etomidate" : "propofol";
  const inductionDose = isElderly
    ? "induction dose reduced ~20–50%"
    : isPediatric
    ? "weight-based induction dose"
    : "standard induction dose";
  rows.push({
    section: "Induction",
    text: `${inductionDrug} for induction${highRisk ? " (preferred when haemodynamic stability is critical)" : ""}; ${inductionDose}. Pair with rocuronium for paralysis (reverse deep block with sugammadex).`,
    rationale: "Common balanced-TIVA pattern; etomidate preferred in shock/high-risk for cardiovascular stability.",
    drugIds: [inductionDrug, "rocuronium", "sugammadex"],
  });

  // ---- Airway ----
  const airwayText = highRisk || co.has("obesity") || co.has("neck")
    ? "Anticipate possible difficult airway: have supraglottic airway (LMA) and cricothyrotomy kit ready; consider awake technique if predictors present."
    : "Standard rapid sequence induction with direct/video laryngoscopy; have supraglottic airway as rescue.";
  rows.push({
    section: "Airway",
    text: airwayText,
    rationale: "Difficult-airway planning reduces failed-airway harm; confirm predictors (LEMON/Mallampati) pre-induction.",
    drugIds: ["rocuronium", "succinylcholine"],
  });

  // ---- Monitoring ----
  const monitorText = highRisk || major
    ? "ASA standard monitors + invasive arterial line and invasive BP for major/unstable cases; consider CVP/urine output."
    : "ASA standard monitors (ECG, SpO2, NIBP, ETCO2, temperature).";
  rows.push({
    section: "Monitoring",
    text: monitorText,
    rationale: "Escalate monitoring with physiologic reserve and surgical magnitude.",
  });

  // ---- Analgesia ----
  const analgesia: string[] = ["Multi-modal: paracetamol + intra-op opioid (fentanyl/remifentanil)"];
  if (!isRenal) analgesia.push("consider NSAID if no contraindication");
  if (major) analgesia.push("consider regional/nerve block for major surgery");
  rows.push({
    section: "Analgesia",
    text: analgesia.join("; ") + ".",
    rationale: "Multi-modal analgesia reduces opioid requirement and PONV.",
    drugIds: ["fentanyl", "remifentanil"],
  });

  // ---- Antiemetic (PONV) ----
  rows.push({
    section: "Antiemetic",
    text: "Multimodal PONV prophylaxis: ondansetron 4 mg IV near end of surgery + dexamethasone 0.1–0.2 mg/kg IV at induction (avoid if diabetic/risk factors).",
    rationale: "Combination prophylaxis outperforms single-agent; scale with Apfel risk factors. [Miller's Ch. 76]",
    drugIds: ["ondansetron"],
  });

  // ---- Antibiotic ----
  rows.push({
    section: "Antibiotic",
    text: "Surgical antibiotic prophylaxis within 60 min before incision (cefazolin 2 g IV if no allergy); redose per institutional guidance for long cases.",
    rationale: "Timely prophylaxis reduces SSIs; confirm allergy and local protocol.",
  });

  // ---- Comorbidity-specific flags ----
  if (isRenal) {
    rows.push({
      section: "Renal adjustment",
      text: "Dose-adjust renally-cleared drugs; avoid nephrotoxins; check K+ and last dialysis. Prefer drugs with non-renal clearance where possible.",
      rationale: "Renal impairment changes volume of distribution and elimination.",
      drugIds: ["rocuronium", "vecuronium", "neostigmine"],
    });
  }
  if (isHepatic) {
    rows.push({
      section: "Hepatic adjustment",
      text: "Prefer agents with extra-hepatic/plasma metabolism; reduce doses of hepatically cleared drugs; correct coagulopathy pre-op.",
      rationale: "Reduced synthetic and metabolic reserve.",
      drugIds: ["remifentanil", "vecuronium"],
    });
  }
  if (isCopd) {
    rows.push({
      section: "Respiratory precaution",
      text: "Optimise bronchodilators; have bronchospasm rescue (β-agonist + epinephrine) ready; avoid histamine-releasing drugs where possible.",
      rationale: "Reactive airway increases bronchospasm risk peri-induction.",
      drugIds: ["epinephrine"],
    });
  }
  if (isPregnant) {
    rows.push({
      section: "Obstetric note",
      text: "Left uterine displacement after 20 wk; increased gastric aspirate risk — rapid sequence with cricoid pressure; avoid teratogens.",
      rationale: "Aortocaval compression and reduced LES tone in pregnancy.",
    });
  }
  if (isElderly) {
    rows.push({
      section: "Geriatric note",
      text: "Reduce induction and opioid doses; attention to frailty, cognition, and post-op delirium risk.",
      rationale: "Age reduces MAC and drug tolerance; narrow therapeutic index.",
    });
  }

  return rows;
}
