export interface CalculatorMeta {
  id: string;
  title: string;
  category: "Anthropometric & Dosing" | "Fluids" | "Hemodynamics & Labs" | "Airway" | "Risk Scores" | "ICU & Ventilation" | "Regional Anesthesia";
  description: string;
  implemented: boolean;
}

export const CALCULATOR_REGISTRY: CalculatorMeta[] = [
  { id: "bmi-ibw-lbw-abw", title: "BMI · IBW · LBW · ABW", category: "Anthropometric & Dosing", description: "Body mass index and dosing weights (Devine IBW, Boer LBW, adjusted body weight).", implemented: true },
  { id: "weight-dose", title: "Weight-based dose", category: "Anthropometric & Dosing", description: "mg/kg → mg, given a dose per kg and patient weight.", implemented: true },
  { id: "infusion-rate", title: "Infusion rate converter", category: "Anthropometric & Dosing", description: "mcg/kg/min or mg/kg/hr → mL/hr pump rate for a given concentration.", implemented: true },
  { id: "maintenance-fluids", title: "Maintenance fluids (4-2-1 rule)", category: "Fluids", description: "Holliday-Segar hourly maintenance rate.", implemented: true },
  { id: "npo-deficit", title: "NPO fluid deficit", category: "Fluids", description: "Maintenance rate × hours fasted.", implemented: true },
  { id: "parkland", title: "Parkland formula (burns)", category: "Fluids", description: "24h burn resuscitation volume, split 8h/16h.", implemented: true },
  { id: "blood-loss", title: "Estimated blood volume & allowable blood loss", category: "Fluids", description: "EBV by age/sex category and ABL from Hct trend.", implemented: true },
  { id: "map", title: "Mean arterial pressure (MAP)", category: "Hemodynamics & Labs", description: "MAP from systolic/diastolic BP.", implemented: true },
  { id: "anion-gap", title: "Anion gap", category: "Hemodynamics & Labs", description: "Na − (Cl + HCO3), with optional K.", implemented: true },
  { id: "corrected-sodium", title: "Corrected sodium (hyperglycemia)", category: "Hemodynamics & Labs", description: "Katz correction for measured Na given glucose.", implemented: true },
  { id: "corrected-calcium", title: "Corrected calcium (hypoalbuminemia)", category: "Hemodynamics & Labs", description: "Correction for measured total calcium given albumin.", implemented: true },
  { id: "aa-gradient", title: "A-a gradient", category: "Hemodynamics & Labs", description: "Alveolar gas equation and A-a gradient.", implemented: true },
  { id: "ett-sizing", title: "Pediatric ETT size & depth", category: "Airway", description: "Cole's formula for tube size; depth estimates by age or tube size.", implemented: true },
  { id: "lma-sizing", title: "LMA size by weight", category: "Airway", description: "Standard LMA sizing chart by patient weight.", implemented: true },
  { id: "gcs", title: "Glasgow Coma Scale", category: "Risk Scores", description: "Eye + Verbal + Motor components.", implemented: true },
  { id: "apfel", title: "Apfel PONV risk score", category: "Risk Scores", description: "Simplified 4-factor PONV risk score.", implemented: true },
  { id: "rcri", title: "Revised Cardiac Risk Index (Lee)", category: "Risk Scores", description: "6-factor perioperative cardiac risk index.", implemented: true },
  { id: "stop-bang", title: "STOP-BANG", category: "Risk Scores", description: "8-item OSA screening questionnaire.", implemented: true },
  { id: "child-pugh", title: "Child-Pugh score", category: "Risk Scores", description: "Hepatic reserve grading A/B/C.", implemented: true },
  { id: "meld", title: "MELD score", category: "Risk Scores", description: "Original 3-variable MELD formula.", implemented: true },
  { id: "news2", title: "NEWS2 early warning score", category: "Risk Scores", description: "Totals pre-scored NEWS2 sub-scores.", implemented: true },
  { id: "sofa", title: "SOFA score", category: "Risk Scores", description: "Sequential organ failure assessment — 6 organ systems, pre-scored 0–4 each.", implemented: true },
  { id: "qsofa", title: "qSOFA", category: "Risk Scores", description: "Bedside 3-criteria quick SOFA screen for sepsis.", implemented: true },
  { id: "possum", title: "POSSUM", category: "Risk Scores", description: "Physiological & operative severity score — full point tables need verified source import before this is safe to compute.", implemented: false },
  { id: "asa-ps", title: "ASA Physical Status", category: "Risk Scores", description: "Reference descriptions for ASA I–VI classification.", implemented: true },
  { id: "lung-protective-tv", title: "Lung-protective tidal volume", category: "ICU & Ventilation", description: "ARDSnet 6 mL/kg predicted body weight target (4–8 mL/kg range).", implemented: true },
  { id: "pf-ratio", title: "PaO2/FiO2 ratio & ARDS severity", category: "ICU & Ventilation", description: "P/F ratio with Berlin-definition mild/moderate/severe banding.", implemented: true },
  { id: "sf-ratio", title: "SpO2/FiO2 ratio", category: "ICU & Ventilation", description: "Non-invasive P/F surrogate when no ABG is available.", implemented: true },
  { id: "oxygenation-index", title: "Oxygenation Index", category: "ICU & Ventilation", description: "FiO2 × mean airway pressure × 100 / PaO2 — used in peds/neonatal ICU and ECMO referral.", implemented: true },
  { id: "driving-pressure", title: "Driving pressure", category: "ICU & Ventilation", description: "Plateau pressure − PEEP.", implemented: true },
  { id: "minute-ventilation", title: "Minute ventilation", category: "ICU & Ventilation", description: "Tidal volume × respiratory rate.", implemented: true },
  { id: "crrt-dose", title: "CRRT effluent dose", category: "ICU & Ventilation", description: "Required effluent flow rate for a target mL/kg/hr dose (KDIGO-referenced 20–25 range).", implemented: true },
  { id: "norepi-equivalent", title: "Norepinephrine-equivalent dose", category: "ICU & Ventilation", description: "Rough comparative vasopressor-burden index across agents.", implemented: true },
  { id: "la-max-dose", title: "Local anesthetic maximum dose", category: "Regional Anesthesia", description: "mg/kg ceiling (plain vs. with epinephrine) for lidocaine, bupivacaine, ropivacaine, checked against a planned volume/concentration.", implemented: true },
];
