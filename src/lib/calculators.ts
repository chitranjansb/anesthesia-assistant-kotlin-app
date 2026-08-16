/**
 * Clinical calculators.
 *
 * Everything in this file is a fixed, published mathematical formula or a
 * standard published scoring rubric (e.g. Apfel, RCRI, Child-Pugh) — not a
 * dosing recommendation. These are safe to compute deterministically because
 * there is a single, well-defined, citable equation behind each one.
 *
 * Where a widely-cited tool has too many edge-case-dependent point tables to
 * reproduce reliably from memory (e.g. full POSSUM), it is intentionally
 * left as "not implemented" rather than guessed — see calculators/registry.ts.
 */

export type Sex = "male" | "female";

// ---------- Anthropometric ----------

/** BMI = weight(kg) / height(m)^2 */
export function bmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

/**
 * Ideal Body Weight — Devine formula (1974).
 * Male: 50 + 2.3 * (height_in_inches - 60)
 * Female: 45.5 + 2.3 * (height_in_inches - 60)
 */
export function idealBodyWeight(heightCm: number, sex: Sex): number {
  const inches = heightCm / 2.54;
  const base = sex === "male" ? 50 : 45.5;
  return base + 2.3 * (inches - 60);
}

/**
 * Lean Body Weight — Boer formula (1984).
 * Male: 0.407*weight(kg) + 0.267*height(cm) - 19.2
 * Female: 0.252*weight(kg) + 0.473*height(cm) - 48.3
 */
export function leanBodyWeight(weightKg: number, heightCm: number, sex: Sex): number {
  return sex === "male"
    ? 0.407 * weightKg + 0.267 * heightCm - 19.2
    : 0.252 * weightKg + 0.473 * heightCm - 48.3;
}

/** Adjusted Body Weight = IBW + 0.4 * (actual weight - IBW). Commonly used for dosing in obesity. */
export function adjustedBodyWeight(actualWeightKg: number, ibwKg: number): number {
  return ibwKg + 0.4 * (actualWeightKg - ibwKg);
}

// ---------- Fluids ----------

/**
 * Maintenance fluid rate — Holliday-Segar "4-2-1" rule (1957).
 * First 10kg: 4 mL/kg/hr; next 10kg: 2 mL/kg/hr; each kg over 20: 1 mL/kg/hr.
 */
export function maintenanceFluidRateMlPerHr(weightKg: number): number {
  if (weightKg <= 0) return 0;
  let rate = 0;
  const first10 = Math.min(weightKg, 10);
  rate += first10 * 4;
  if (weightKg > 10) {
    const next10 = Math.min(weightKg - 10, 10);
    rate += next10 * 2;
  }
  if (weightKg > 20) {
    rate += (weightKg - 20) * 1;
  }
  return rate;
}

/** NPO fluid deficit = maintenance hourly rate × hours fasted. */
export function npoFluidDeficitMl(weightKg: number, hoursNPO: number): number {
  return maintenanceFluidRateMlPerHr(weightKg) * hoursNPO;
}

/**
 * Parkland formula (burns resuscitation): 4 mL × weight(kg) × %TBSA burned,
 * over 24h from time of injury — half in the first 8h, half over the next 16h.
 */
export function parklandFormula(weightKg: number, tbsaPercent: number) {
  const total24h = 4 * weightKg * tbsaPercent;
  return {
    total24hMl: total24h,
    first8hMl: total24h / 2,
    next16hMl: total24h / 2,
  };
}

// ---------- Hemodynamics / labs ----------

/** MAP = DBP + 1/3 (SBP - DBP) */
export function meanArterialPressure(sbp: number, dbp: number): number {
  return dbp + (sbp - dbp) / 3;
}

/** Anion gap = Na - (Cl + HCO3). Add K in the bracket if using the K-inclusive variant. */
export function anionGap(na: number, cl: number, hco3: number, k?: number): number {
  const cation = k !== undefined ? na + k : na;
  return cation - (cl + hco3);
}

/**
 * Corrected sodium for hyperglycemia — Katz formula (1973):
 * corrected Na = measured Na + 1.6 × ((glucose - 100) / 100)
 * (A 2.4 factor variant (Hillier 1999) also exists in some references.)
 */
export function correctedSodium(measuredNa: number, glucoseMgDl: number, factor: 1.6 | 2.4 = 1.6): number {
  return measuredNa + factor * ((glucoseMgDl - 100) / 100);
}

/** Corrected calcium for hypoalbuminemia: corrected Ca = measured Ca + 0.8 × (4 - albumin g/dL) */
export function correctedCalcium(measuredCa: number, albuminGDl: number): number {
  return measuredCa + 0.8 * (4 - albuminGDl);
}

/**
 * Alveolar gas equation (simplified, sea level, R=0.8):
 * PAO2 = FiO2 × (Patm - PH2O) - PaCO2 / R
 * A-a gradient = PAO2 - PaO2
 */
export function aaGradient(params: {
  fiO2: number; // 0.21–1.0
  paCO2: number;
  paO2: number;
  patmMmHg?: number; // default 760
  pH2OMmHg?: number; // default 47
  respiratoryQuotient?: number; // default 0.8
}): { pAO2: number; gradient: number } {
  const patm = params.patmMmHg ?? 760;
  const pH2O = params.pH2OMmHg ?? 47;
  const r = params.respiratoryQuotient ?? 0.8;
  const pAO2 = params.fiO2 * (patm - pH2O) - params.paCO2 / r;
  return { pAO2, gradient: pAO2 - params.paO2 };
}

// ---------- Estimated blood volume / allowable blood loss ----------

/** Average EBV by population, mL/kg (standard teaching values). */
export const EBV_ML_PER_KG = {
  prematureNeonate: 100,
  termNeonate: 90,
  infant: 80,
  adultMale: 75,
  adultFemale: 65,
} as const;

export function estimatedBloodVolumeMl(weightKg: number, category: keyof typeof EBV_ML_PER_KG): number {
  return weightKg * EBV_ML_PER_KG[category];
}

/** Allowable Blood Loss = EBV × (Hct_initial - Hct_target) / Hct_initial */
export function allowableBloodLossMl(ebvMl: number, hctInitial: number, hctTarget: number): number {
  return ebvMl * ((hctInitial - hctTarget) / hctInitial);
}

// ---------- Infusion math ----------

/**
 * Convert a mcg/kg/min infusion order into a mL/hr pump rate.
 * rate(mL/hr) = dose(mcg/kg/min) × weight(kg) × 60 / concentration(mcg/mL)
 */
export function mcgKgMinToMlPerHr(doseMcgKgMin: number, weightKg: number, concentrationMcgPerMl: number): number {
  return (doseMcgKgMin * weightKg * 60) / concentrationMcgPerMl;
}

/** rate(mL/hr) = dose(mg/kg/hr) × weight(kg) / concentration(mg/mL) */
export function mgKgHrToMlPerHr(doseMgKgHr: number, weightKg: number, concentrationMgPerMl: number): number {
  return (doseMgKgHr * weightKg) / concentrationMgPerMl;
}

/** Simple weight-based bolus dose in mg. */
export function weightBasedDoseMg(doseMgPerKg: number, weightKg: number): number {
  return doseMgPerKg * weightKg;
}

// ---------- Airway sizing ----------

/**
 * Pediatric uncuffed ETT internal diameter (mm) — Cole's formula:
 * ID = (age in years / 4) + 4     (age ≥ 1 year)
 * Cuffed tubes are typically 0.5 mm smaller: ID = (age/4) + 3.5
 */
export function pediatricEttSizeMm(ageYears: number, cuffed: boolean): number {
  return cuffed ? ageYears / 4 + 3.5 : ageYears / 4 + 4;
}

/** Pediatric oral ETT insertion depth at lips (cm) — common estimate: (age/2) + 12 */
export function pediatricEttDepthCm(ageYears: number): number {
  return ageYears / 2 + 12;
}

/** Alternative pediatric depth estimate: 3 × internal tube diameter (mm) → depth in cm */
export function pediatricEttDepthByTubeSizeCm(tubeSizeMm: number): number {
  return 3 * tubeSizeMm;
}

export interface LmaSizeGuide {
  size: number;
  weightRangeKg: string;
}
export const LMA_SIZE_CHART: LmaSizeGuide[] = [
  { size: 1, weightRangeKg: "< 5" },
  { size: 1.5, weightRangeKg: "5 – 10" },
  { size: 2, weightRangeKg: "10 – 20" },
  { size: 2.5, weightRangeKg: "20 – 30" },
  { size: 3, weightRangeKg: "30 – 50" },
  { size: 4, weightRangeKg: "50 – 70" },
  { size: 5, weightRangeKg: "> 70" },
];

// ---------- Scoring systems ----------

/** GCS total from component scores. Eye 1–4, Verbal 1–5, Motor 1–6. Range 3–15. */
export function gcsTotal(eye: number, verbal: number, motor: number): number {
  return eye + verbal + motor;
}

/**
 * Apfel simplified PONV risk score (Apfel et al. 1999).
 * 4 risk factors, 1 point each: female sex, non-smoker, history of PONV/motion
 * sickness, planned postoperative opioids.
 * Approximate risk: 0=10%, 1=21%, 2=39%, 3=61%, 4=78%.
 */
export function apfelScore(factors: {
  female: boolean;
  nonSmoker: boolean;
  historyPonvOrMotionSickness: boolean;
  postopOpioids: boolean;
}): { score: number; approxRiskPercent: number } {
  const score = [factors.female, factors.nonSmoker, factors.historyPonvOrMotionSickness, factors.postopOpioids].filter(Boolean).length;
  const riskTable = [10, 21, 39, 61, 78];
  return { score, approxRiskPercent: riskTable[score] };
}

/**
 * Revised Cardiac Risk Index / Lee Index (Lee et al. 1999).
 * 6 factors, 1 point each. Estimated risk of major cardiac event:
 * 0 = 0.4%, 1 = 0.9%, 2 = 6.6%, ≥3 = 11%.
 */
export function rcriScore(factors: {
  highRiskSurgery: boolean;
  ischemicHeartDisease: boolean;
  congestiveHeartFailure: boolean;
  cerebrovascularDisease: boolean;
  insulinDependentDiabetes: boolean;
  renalInsufficiency: boolean; // creatinine > 2 mg/dL
}): { score: number; approxRiskPercent: number } {
  const score = Object.values(factors).filter(Boolean).length;
  const risk = score === 0 ? 0.4 : score === 1 ? 0.9 : score === 2 ? 6.6 : 11;
  return { score, approxRiskPercent: risk };
}

/**
 * STOP-BANG OSA screening (Chung et al. 2008). 8 yes/no items, 1 point each.
 * 0–2 low risk, 3–4 intermediate risk, 5–8 high risk.
 */
export function stopBangScore(answers: {
  snoring: boolean;
  tiredness: boolean;
  observedApnea: boolean;
  bloodPressureHigh: boolean;
  bmiOver35: boolean;
  ageOver50: boolean;
  neckCircumferenceOver40cm: boolean;
  maleGender: boolean;
}): { score: number; risk: "Low" | "Intermediate" | "High" } {
  const score = Object.values(answers).filter(Boolean).length;
  const risk = score <= 2 ? "Low" : score <= 4 ? "Intermediate" : "High";
  return { score, risk };
}

/**
 * Child-Pugh score. Each of 5 parameters scored 1–3; total 5–15.
 * Class A: 5–6, Class B: 7–9, Class C: 10–15.
 */
export function childPughScore(points: {
  bilirubinPoints: 1 | 2 | 3;
  albuminPoints: 1 | 2 | 3;
  inrPoints: 1 | 2 | 3;
  ascitesPoints: 1 | 2 | 3;
  encephalopathyPoints: 1 | 2 | 3;
}): { score: number; grade: "A" | "B" | "C" } {
  const score = Object.values(points).reduce((a, b) => a + b, 0);
  const grade = score <= 6 ? "A" : score <= 9 ? "B" : "C";
  return { score, grade };
}

/**
 * MELD score (original, Kamath et al. 2001):
 * 3.78×ln(bilirubin mg/dL) + 11.2×ln(INR) + 9.57×ln(creatinine mg/dL) + 6.43
 * Lab values below 1.0 are floored to 1.0 per the original specification.
 */
export function meldScore(bilirubin: number, inr: number, creatinine: number): number {
  const b = Math.max(bilirubin, 1);
  const i = Math.max(inr, 1);
  const c = Math.max(Math.min(creatinine, 4), 1); // creatinine capped at 4 in original formula
  const raw = 3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43;
  return Math.round(raw);
}

/**
 * NEWS2 (Royal College of Physicians, 2017) — early warning score.
 * Each parameter is scored 0–3 against its own published threshold table;
 * +2 if supplemental oxygen is required. This function totals pre-scored
 * sub-scores rather than re-deriving thresholds, since the RCP tables have
 * several breakpoints best shown to the user directly (see NEWS2 component).
 */
export function news2Total(subScores: {
  respiratoryRate: number;
  spo2: number;
  airOrOxygen: number; // 0 or 2
  systolicBp: number;
  pulse: number;
  consciousness: number;
  temperature: number;
}): number {
  return Object.values(subScores).reduce((a, b) => a + b, 0);
}

/**
 * SOFA (Sequential Organ Failure Assessment) — Vincent et al. 1996.
 * Totals 6 pre-scored organ sub-scores (0–4 each, range 0–24), the same
 * "select the point value" approach used for Child-Pugh above — the
 * underlying threshold tables (PaO2/FiO2, platelets, bilirubin, MAP/
 * vasopressor dose, GCS, creatinine/urine output) are shown to the user
 * directly in the SOFA component rather than re-derived here, since the
 * cardiovascular sub-score in particular depends on vasopressor *dose*
 * bands that are best selected explicitly.
 */
export function sofaTotal(subScores: {
  respiration: number; // 0–4, PaO2/FiO2
  coagulation: number; // 0–4, platelets
  liver: number; // 0–4, bilirubin
  cardiovascular: number; // 0–4, MAP / vasopressor dose
  cns: number; // 0–4, GCS
  renal: number; // 0–4, creatinine / urine output
}): number {
  return Object.values(subScores).reduce((a, b) => a + b, 0);
}

/**
 * qSOFA (quick SOFA) — bedside screen, 3 criteria, 1 point each (0–3):
 * respiratory rate ≥22/min, systolic BP ≤100 mmHg, altered mentation (GCS <15).
 * ≥2 is associated with worse outcomes and should prompt full SOFA / sepsis workup.
 */
export function qsofaScore(criteria: {
  respiratoryRateOver22: boolean;
  systolicBpUnder100: boolean;
  alteredMentation: boolean;
}): number {
  return Object.values(criteria).filter(Boolean).length;
}

// ---------- ICU / ventilation ----------

/**
 * Lung-protective tidal volume — ARDSnet target of ~6 mL/kg predicted body
 * weight (range commonly taught 4–8 mL/kg), calculated on PBW, NOT actual
 * body weight. PBW uses the same height-based formula as Devine IBW.
 */
export function predictedBodyWeightKg(heightCm: number, sex: Sex): number {
  return idealBodyWeight(heightCm, sex);
}

export function lungProtectiveTidalVolumeMl(pbwKg: number, mlPerKg: number = 6): number {
  return pbwKg * mlPerKg;
}

/**
 * PaO2/FiO2 (P/F) ratio and Berlin-definition ARDS severity band (2012).
 * FiO2 given as a fraction (0.21–1.0). PEEP/CPAP ≥5 cmH2O is a formal
 * requirement of the Berlin definition — if peepCmH2O is provided and <5,
 * the severity label is not applied even though the ratio is still shown.
 */
export function pfRatio(paO2: number, fiO2: number): number {
  return paO2 / fiO2;
}

export function ardsSeverityBerlin(
  ratio: number,
  peepCmH2O?: number
): "Not ARDS by ratio" | "Mild" | "Moderate" | "Severe" | "Meets ratio, but PEEP <5 (Berlin criteria unmet)" {
  if (peepCmH2O !== undefined && peepCmH2O < 5 && ratio <= 300) {
    return "Meets ratio, but PEEP <5 (Berlin criteria unmet)";
  }
  if (ratio > 300) return "Not ARDS by ratio";
  if (ratio > 200) return "Mild";
  if (ratio > 100) return "Moderate";
  return "Severe";
}

/** SpO2/FiO2 (S/F) ratio — non-invasive surrogate for P/F when no ABG is available (Rice et al. 2007). */
export function sfRatio(spo2Percent: number, fiO2: number): number {
  return spo2Percent / fiO2;
}

/**
 * Oxygenation Index = (FiO2 × mean airway pressure(cmH2O) × 100) / PaO2(mmHg).
 * Widely used in pediatric/neonatal ICU and as an ECMO-referral trigger.
 */
export function oxygenationIndex(fiO2: number, meanAirwayPressureCmH2O: number, paO2: number): number {
  return (fiO2 * meanAirwayPressureCmH2O * 100) / paO2;
}

/** Driving pressure = plateau pressure − PEEP (cmH2O). Associated with mortality in ARDS independent of tidal volume. */
export function drivingPressureCmH2O(plateauPressure: number, peep: number): number {
  return plateauPressure - peep;
}

/** Minute ventilation (L/min) = tidal volume (mL) × respiratory rate (/min) / 1000. */
export function minuteVentilationLPerMin(tidalVolumeMl: number, respiratoryRate: number): number {
  return (tidalVolumeMl * respiratoryRate) / 1000;
}

/**
 * CRRT prescribed effluent dose — required effluent flow rate for a target
 * dose (KDIGO-referenced teaching range 20–25 mL/kg/hr). Note the commonly
 * cited caveat: delivered dose typically runs ~20–25% below the prescribed
 * dose because of filter downtime, so prescribing at the upper end of the
 * target range is standard practice.
 */
export function crrtEffluentRateMlPerHr(weightKg: number, doseMlPerKgPerHr: number = 25): number {
  return weightKg * doseMlPerKgPerHr;
}

/**
 * Norepinephrine-equivalent dose — a commonly used (but source-variable)
 * way to compare total vasopressor burden. This implementation uses the
 * frequently taught conversion set: NE 1:1, epinephrine 1:1, dopamine ÷100,
 * phenylephrine ÷10 (all in mcg/kg/min). Vasopressin is deliberately
 * excluded — it's usually run at a fixed dose and published conversion
 * factors for it vary considerably between studies, so folding it in here
 * would overstate precision. Treat the result as a rough comparative index,
 * not a validated clinical score.
 */
export function norepinephrineEquivalentMcgKgMin(doses: {
  norepinephrineMcgKgMin?: number;
  epinephrineMcgKgMin?: number;
  dopamineMcgKgMin?: number;
  phenylephrineMcgKgMin?: number;
}): number {
  const ne = doses.norepinephrineMcgKgMin ?? 0;
  const epi = doses.epinephrineMcgKgMin ?? 0;
  const dopa = (doses.dopamineMcgKgMin ?? 0) / 100;
  const phenyl = (doses.phenylephrineMcgKgMin ?? 0) / 10;
  return ne + epi + dopa + phenyl;
}

// ---------- Regional anesthesia ----------

export type LocalAnesthetic = "lidocaine" | "bupivacaine" | "ropivacaine";

/**
 * Commonly-taught maximum local anesthetic doses (mg/kg) and a commonly-cited
 * absolute adult ceiling, plain vs. with epinephrine. These figures are widely
 * taught teaching ranges (e.g. Miller's Anesthesia-style tables) and DO vary
 * between sources/institutions — treat as an approximate safety guardrail,
 * not a substitute for your institution's adopted reference.
 */
export const LOCAL_ANESTHETIC_MAX_DOSES: Record<
  LocalAnesthetic,
  { plainMgPerKg: number; withEpiMgPerKg: number; plainAbsoluteMaxMg: number; withEpiAbsoluteMaxMg: number }
> = {
  lidocaine: { plainMgPerKg: 4.5, withEpiMgPerKg: 7, plainAbsoluteMaxMg: 300, withEpiAbsoluteMaxMg: 500 },
  bupivacaine: { plainMgPerKg: 2, withEpiMgPerKg: 2.5, plainAbsoluteMaxMg: 150, withEpiAbsoluteMaxMg: 175 },
  ropivacaine: { plainMgPerKg: 3, withEpiMgPerKg: 3, plainAbsoluteMaxMg: 200, withEpiAbsoluteMaxMg: 250 },
};

export function localAnestheticMaxDoseMg(drug: LocalAnesthetic, weightKg: number, withEpinephrine: boolean): number {
  const table = LOCAL_ANESTHETIC_MAX_DOSES[drug];
  const perKgMax = weightKg * (withEpinephrine ? table.withEpiMgPerKg : table.plainMgPerKg);
  const absoluteMax = withEpinephrine ? table.withEpiAbsoluteMaxMg : table.plainAbsoluteMaxMg;
  return Math.min(perKgMax, absoluteMax);
}

/** Total planned dose (mg) from a volume (mL) at a given percentage concentration (e.g. 0.5% = 5 mg/mL). */
export function localAnestheticDoseFromVolumeMg(volumeMl: number, percentConcentration: number): number {
  const mgPerMl = percentConcentration * 10; // 1% = 10 mg/mL
  return volumeMl * mgPerMl;
}
