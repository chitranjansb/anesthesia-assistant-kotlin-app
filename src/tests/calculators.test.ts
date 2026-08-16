import { describe, it, expect } from "vitest";
import {
  bmi,
  idealBodyWeight,
  leanBodyWeight,
  adjustedBodyWeight,
  maintenanceFluidRateMlPerHr,
  parklandFormula,
  meanArterialPressure,
  anionGap,
  correctedSodium,
  correctedCalcium,
  aaGradient,
  mcgKgMinToMlPerHr,
  pediatricEttSizeMm,
  pediatricEttDepthCm,
  gcsTotal,
  apfelScore,
  rcriScore,
  stopBangScore,
  childPughScore,
  meldScore,
  sofaTotal,
  qsofaScore,
  predictedBodyWeightKg,
  lungProtectiveTidalVolumeMl,
  pfRatio,
  ardsSeverityBerlin,
  sfRatio,
  oxygenationIndex,
  drivingPressureCmH2O,
  minuteVentilationLPerMin,
  crrtEffluentRateMlPerHr,
  norepinephrineEquivalentMcgKgMin,
  localAnestheticMaxDoseMg,
  localAnestheticDoseFromVolumeMg,
} from "../lib/calculators";

describe("anthropometric", () => {
  it("computes BMI", () => {
    expect(bmi(70, 175)).toBeCloseTo(22.86, 1);
  });

  it("computes Devine IBW for a 70-inch male", () => {
    // 70 inches = 177.8 cm; IBW = 50 + 2.3*(70-60) = 73
    expect(idealBodyWeight(177.8, "male")).toBeCloseTo(73, 1);
  });

  it("computes Boer LBW", () => {
    const lbw = leanBodyWeight(90, 180, "male");
    expect(lbw).toBeCloseTo(0.407 * 90 + 0.267 * 180 - 19.2, 5);
  });

  it("computes adjusted body weight", () => {
    expect(adjustedBodyWeight(100, 70)).toBeCloseTo(70 + 0.4 * 30, 5);
  });
});

describe("fluids", () => {
  it("computes 4-2-1 maintenance rate for 25kg child", () => {
    // 10*4 + 10*2 + 5*1 = 40+20+5 = 65
    expect(maintenanceFluidRateMlPerHr(25)).toBe(65);
  });

  it("computes 4-2-1 maintenance rate for 8kg infant", () => {
    expect(maintenanceFluidRateMlPerHr(8)).toBe(32);
  });

  it("computes Parkland formula split", () => {
    const r = parklandFormula(70, 30); // 4*70*30 = 8400
    expect(r.total24hMl).toBe(8400);
    expect(r.first8hMl).toBe(4200);
    expect(r.next16hMl).toBe(4200);
  });
});

describe("hemodynamics and labs", () => {
  it("computes MAP", () => {
    expect(meanArterialPressure(120, 80)).toBeCloseTo(93.33, 1);
  });

  it("computes anion gap", () => {
    expect(anionGap(140, 100, 24)).toBe(16);
  });

  it("computes corrected sodium", () => {
    // Na 130, glucose 400 -> 130 + 1.6*((400-100)/100) = 130 + 4.8 = 134.8
    expect(correctedSodium(130, 400)).toBeCloseTo(134.8, 5);
  });

  it("computes corrected calcium", () => {
    expect(correctedCalcium(7.5, 2)).toBeCloseTo(7.5 + 0.8 * 2, 5);
  });

  it("computes A-a gradient on room air", () => {
    const { pAO2, gradient } = aaGradient({ fiO2: 0.21, paCO2: 40, paO2: 90 });
    expect(pAO2).toBeCloseTo(0.21 * 713 - 50, 1);
    expect(gradient).toBeCloseTo(pAO2 - 90, 5);
  });
});

describe("infusion math", () => {
  it("converts mcg/kg/min to mL/hr", () => {
    // 0.1 mcg/kg/min, 70kg, concentration 16 mcg/mL (norepi 4mg/250mL)
    // = 0.1*70*60/16 = 26.25
    expect(mcgKgMinToMlPerHr(0.1, 70, 16)).toBeCloseTo(26.25, 2);
  });
});

describe("airway sizing", () => {
  it("computes pediatric uncuffed ETT size (Cole)", () => {
    expect(pediatricEttSizeMm(4, false)).toBe(5); // 4/4+4=5
  });
  it("computes pediatric cuffed ETT size", () => {
    expect(pediatricEttSizeMm(4, true)).toBe(4.5); // 4/4+3.5=4.5
  });
  it("computes pediatric ETT depth estimate", () => {
    expect(pediatricEttDepthCm(4)).toBe(14); // 4/2+12=14
  });
});

describe("scoring systems", () => {
  it("sums GCS", () => {
    expect(gcsTotal(4, 5, 6)).toBe(15);
    expect(gcsTotal(1, 1, 1)).toBe(3);
  });

  it("computes Apfel score and risk", () => {
    expect(apfelScore({ female: true, nonSmoker: true, historyPonvOrMotionSickness: false, postopOpioids: false })).toEqual({
      score: 2,
      approxRiskPercent: 39,
    });
  });

  it("computes RCRI", () => {
    expect(
      rcriScore({
        highRiskSurgery: true,
        ischemicHeartDisease: true,
        congestiveHeartFailure: false,
        cerebrovascularDisease: false,
        insulinDependentDiabetes: false,
        renalInsufficiency: false,
      })
    ).toEqual({ score: 2, approxRiskPercent: 6.6 });
  });

  it("computes STOP-BANG risk bands", () => {
    expect(
      stopBangScore({
        snoring: true,
        tiredness: true,
        observedApnea: true,
        bloodPressureHigh: false,
        bmiOver35: false,
        ageOver50: false,
        neckCircumferenceOver40cm: false,
        maleGender: false,
      }).risk
    ).toBe("Intermediate");
  });

  it("computes Child-Pugh class", () => {
    expect(
      childPughScore({
        bilirubinPoints: 2,
        albuminPoints: 2,
        inrPoints: 2,
        ascitesPoints: 1,
        encephalopathyPoints: 1,
      })
    ).toEqual({ score: 8, grade: "B" });
  });

  it("computes MELD score", () => {
    // bilirubin 2, INR 1.5, creatinine 1.5
    const score = meldScore(2, 1.5, 1.5);
    const expected = Math.round(3.78 * Math.log(2) + 11.2 * Math.log(1.5) + 9.57 * Math.log(1.5) + 6.43);
    expect(score).toBe(expected);
  });

  it("computes SOFA total from pre-scored sub-scores", () => {
    expect(
      sofaTotal({ respiration: 2, coagulation: 1, liver: 0, cardiovascular: 3, cns: 1, renal: 2 })
    ).toBe(9);
    expect(
      sofaTotal({ respiration: 0, coagulation: 0, liver: 0, cardiovascular: 0, cns: 0, renal: 0 })
    ).toBe(0);
    expect(
      sofaTotal({ respiration: 4, coagulation: 4, liver: 4, cardiovascular: 4, cns: 4, renal: 4 })
    ).toBe(24);
  });

  it("computes qSOFA score", () => {
    expect(
      qsofaScore({ respiratoryRateOver22: true, systolicBpUnder100: true, alteredMentation: false })
    ).toBe(2);
    expect(
      qsofaScore({ respiratoryRateOver22: false, systolicBpUnder100: false, alteredMentation: false })
    ).toBe(0);
  });
});

describe("ICU / ventilation", () => {
  it("computes predicted body weight matching Devine IBW", () => {
    // 177.8cm male: 50 + 2.3*(70-60) = 73
    expect(predictedBodyWeightKg(177.8, "male")).toBeCloseTo(73, 1);
  });

  it("computes lung-protective tidal volume at 6 mL/kg PBW", () => {
    expect(lungProtectiveTidalVolumeMl(70, 6)).toBe(420);
    expect(lungProtectiveTidalVolumeMl(70)).toBe(420); // default 6 mL/kg
  });

  it("computes P/F ratio and Berlin ARDS severity bands", () => {
    expect(pfRatio(150, 0.5)).toBe(300);
    expect(ardsSeverityBerlin(350)).toBe("Not ARDS by ratio");
    expect(ardsSeverityBerlin(250, 8)).toBe("Mild");
    expect(ardsSeverityBerlin(150, 8)).toBe("Moderate");
    expect(ardsSeverityBerlin(80, 8)).toBe("Severe");
    expect(ardsSeverityBerlin(250, 3)).toBe("Meets ratio, but PEEP <5 (Berlin criteria unmet)");
  });

  it("computes S/F ratio", () => {
    expect(sfRatio(96, 0.4)).toBe(240);
  });

  it("computes Oxygenation Index", () => {
    // (0.6 * 15 * 100) / 60 = 15
    expect(oxygenationIndex(0.6, 15, 60)).toBeCloseTo(15, 5);
  });

  it("computes driving pressure", () => {
    expect(drivingPressureCmH2O(24, 8)).toBe(16);
  });

  it("computes minute ventilation", () => {
    // 420 mL * 14/min = 5.88 L/min
    expect(minuteVentilationLPerMin(420, 14)).toBeCloseTo(5.88, 5);
  });

  it("computes CRRT effluent rate", () => {
    expect(crrtEffluentRateMlPerHr(70, 25)).toBe(1750);
    expect(crrtEffluentRateMlPerHr(70)).toBe(1750); // default 25 mL/kg/hr
  });

  it("computes norepinephrine-equivalent dose", () => {
    const total = norepinephrineEquivalentMcgKgMin({
      norepinephrineMcgKgMin: 0.1,
      epinephrineMcgKgMin: 0.05,
      dopamineMcgKgMin: 10,
      phenylephrineMcgKgMin: 1,
    });
    // 0.1 + 0.05 + 10/100 + 1/10 = 0.1 + 0.05 + 0.1 + 0.1 = 0.35
    expect(total).toBeCloseTo(0.35, 5);
  });
});

describe("regional anesthesia", () => {
  it("computes local anesthetic max dose per kg, respecting the absolute ceiling", () => {
    // 70kg * 2 mg/kg plain bupivacaine = 140mg, under the 150mg absolute ceiling
    expect(localAnestheticMaxDoseMg("bupivacaine", 70, false)).toBeCloseTo(140, 5);
    // 100kg * 2 mg/kg = 200mg, but absolute ceiling caps it at 150mg
    expect(localAnestheticMaxDoseMg("bupivacaine", 100, false)).toBe(150);
    // 70kg * 7 mg/kg lidocaine with epi = 490mg, under the 500mg ceiling
    expect(localAnestheticMaxDoseMg("lidocaine", 70, true)).toBeCloseTo(490, 5);
    // 100kg * 7 mg/kg lidocaine with epi = 700mg, capped at 500mg absolute ceiling
    expect(localAnestheticMaxDoseMg("lidocaine", 100, true)).toBe(500);
    // 70kg * 3 mg/kg ropivacaine = 210mg, under the 250mg with-epi ceiling
    expect(localAnestheticMaxDoseMg("ropivacaine", 70, true)).toBeCloseTo(210, 5);
  });

  it("computes planned dose from volume and concentration", () => {
    // 20 mL of 0.5% bupivacaine = 20 * 5 mg/mL = 100mg
    expect(localAnestheticDoseFromVolumeMg(20, 0.5)).toBe(100);
    // 30 mL of 2% lidocaine = 30 * 20 mg/mL = 600mg
    expect(localAnestheticDoseFromVolumeMg(30, 2)).toBe(600);
  });
});
