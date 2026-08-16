package com.example.anesthesiaassistant.domain

import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

object Calculators {

    // ---------- Anthropometric ----------

    /** BMI = weight(kg) / height(m)^2 */
    fun bmi(weightKg: Double, heightCm: Double): Double {
        if (heightCm <= 0) return 0.0
        val h = heightCm / 100.0
        return weightKg / (h * h)
    }

    /**
     * Ideal Body Weight — Devine formula (1974).
     * Male: 50 + 2.3 * (height_in_inches - 60)
     * Female: 45.5 + 2.3 * (height_in_inches - 60)
     */
    fun idealBodyWeight(heightCm: Double, isMale: Boolean): Double {
        if (heightCm <= 0) return 0.0
        val inches = heightCm / 2.54
        val base = if (isMale) 50.0 else 45.5
        return base + 2.3 * (inches - 60.0)
    }

    /**
     * Lean Body Weight — Boer formula (1984).
     * Male: 0.407*weight(kg) + 0.267*height(cm) - 19.2
     * Female: 0.252*weight(kg) + 0.473*height(cm) - 48.3
     */
    fun leanBodyWeight(weightKg: Double, heightCm: Double, isMale: Boolean): Double {
        return if (isMale) {
            0.407 * weightKg + 0.267 * heightCm - 19.2
        } else {
            0.252 * weightKg + 0.473 * heightCm - 48.3
        }
    }

    /** Adjusted Body Weight = IBW + 0.4 * (actual weight - IBW) */
    fun adjustedBodyWeight(actualWeightKg: Double, ibwKg: Double): Double {
        return ibwKg + 0.4 * (actualWeightKg - ibwKg)
    }

    // ---------- Fluids ----------

    /**
     * Maintenance fluid rate — Holliday-Segar "4-2-1" rule.
     * First 10kg: 4 mL/kg/hr; next 10kg: 2 mL/kg/hr; each kg over 20: 1 mL/kg/hr.
     */
    fun maintenanceFluidRateMlPerHr(weightKg: Double): Double {
        if (weightKg <= 0) return 0.0
        var rate = 0.0
        val first10 = min(weightKg, 10.0)
        rate += first10 * 4.0
        if (weightKg > 10.0) {
            val next10 = min(weightKg - 10.0, 10.0)
            rate += next10 * 2.0
        }
        if (weightKg > 20.0) {
            rate += (weightKg - 20.0) * 1.0
        }
        return rate
    }

    /** NPO fluid deficit = maintenance hourly rate × hours fasted */
    fun npoFluidDeficitMl(weightKg: Double, hoursNpo: Double): Double {
        return maintenanceFluidRateMlPerHr(weightKg) * hoursNpo
    }

    data class ParklandResult(
        val total24hMl: Double,
        val first8hMl: Double,
        val next16hMl: Double,
        val first8hRateMlPerHr: Double,
        val next16hRateMlPerHr: Double
    )

    /**
     * Parkland formula: 4 mL × weight(kg) × %TBSA burned
     */
    fun parklandFormula(weightKg: Double, tbsaPercent: Double): ParklandResult {
        val total = 4.0 * weightKg * tbsaPercent
        val first8 = total / 2.0
        val next16 = total / 2.0
        return ParklandResult(
            total24hMl = total,
            first8hMl = first8,
            next16hMl = next16,
            first8hRateMlPerHr = first8 / 8.0,
            next16hRateMlPerHr = next16 / 16.0
        )
    }

    // ---------- Hemodynamics & Labs ----------

    /** MAP = DBP + 1/3 (SBP - DBP) */
    fun meanArterialPressure(sbp: Double, dbp: Double): Double {
        return dbp + (sbp - dbp) / 3.0
    }

    /** Anion gap = Na - (Cl + HCO3) [or (Na+K) - (Cl+HCO3)] */
    fun anionGap(na: Double, cl: Double, hco3: Double, k: Double? = null): Double {
        val cation = if (k != null) na + k else na
        return cation - (cl + hco3)
    }

    /** Corrected sodium for hyperglycemia (Katz 1.6 factor or Hillier 2.4 factor) */
    fun correctedSodium(measuredNa: Double, glucoseMgDl: Double, factor: Double = 1.6): Double {
        return measuredNa + factor * ((glucoseMgDl - 100.0) / 100.0)
    }

    /** Corrected calcium = measured Ca + 0.8 * (4 - Albumin) */
    fun correctedCalcium(measuredCa: Double, albuminGDl: Double): Double {
        return measuredCa + 0.8 * (4.0 - albuminGDl)
    }

    data class AaGradientResult(
        val pAO2: Double,
        val gradient: Double
    )

    /** Alveolar gas equation */
    fun aaGradient(
        fiO2: Double,
        paCO2: Double,
        paO2: Double,
        patmMmHg: Double = 760.0,
        pH2OMmHg: Double = 47.0,
        rq: Double = 0.8
    ): AaGradientResult {
        val pAO2 = fiO2 * (patmMmHg - pH2OMmHg) - (paCO2 / rq)
        return AaGradientResult(pAO2 = pAO2, gradient = pAO2 - paO2)
    }

    // ---------- Blood Volume & Allowable Blood Loss ----------

    fun estimatedBloodVolumeMl(weightKg: Double, populationMultiplierMlPerKg: Double): Double {
        return weightKg * populationMultiplierMlPerKg
    }

    fun allowableBloodLossMl(ebvMl: Double, hctInitial: Double, hctTarget: Double): Double {
        if (hctInitial <= 0) return 0.0
        return ebvMl * ((hctInitial - hctTarget) / hctInitial)
    }

    // ---------- Infusion Math ----------

    fun mcgKgMinToMlPerHr(doseMcgKgMin: Double, weightKg: Double, concentrationMcgPerMl: Double): Double {
        if (concentrationMcgPerMl <= 0) return 0.0
        return (doseMcgKgMin * weightKg * 60.0) / concentrationMcgPerMl
    }

    fun mgKgHrToMlPerHr(doseMgKgHr: Double, weightKg: Double, concentrationMgPerMl: Double): Double {
        if (concentrationMgPerMl <= 0) return 0.0
        return (doseMgKgHr * weightKg) / concentrationMgPerMl
    }

    fun weightBasedDoseMg(doseMgPerKg: Double, weightKg: Double): Double {
        return doseMgPerKg * weightKg
    }

    // ---------- Airway Sizing ----------

    /** Cole's formula: uncuffed = age/4 + 4, cuffed = age/4 + 3.5 */
    fun pediatricEttSizeMm(ageYears: Double, cuffed: Boolean): Double {
        return if (cuffed) ageYears / 4.0 + 3.5 else ageYears / 4.0 + 4.0
    }

    /** Depth at lips = age/2 + 12 */
    fun pediatricEttDepthCm(ageYears: Double): Double {
        return ageYears / 2.0 + 12.0
    }

    // ---------- Scoring Systems ----------

    fun gcsTotal(eye: Int, verbal: Int, motor: Int): Int = eye + verbal + motor

    data class ApfelResult(val score: Int, val riskPercent: Int)
    fun apfelScore(female: Boolean, nonSmoker: Boolean, historyPonv: Boolean, postopOpioids: Boolean): ApfelResult {
        var score = 0
        if (female) score++
        if (nonSmoker) score++
        if (historyPonv) score++
        if (postopOpioids) score++
        val riskTable = intArrayOf(10, 21, 39, 61, 78)
        return ApfelResult(score, riskTable.getOrElse(score) { 78 })
    }

    data class RcriResult(val score: Int, val riskPercent: Double)
    fun rcriScore(factors: List<Boolean>): RcriResult {
        val score = factors.count { it }
        val risk = when (score) {
            0 -> 0.4
            1 -> 0.9
            2 -> 6.6
            else -> 11.0
        }
        return RcriResult(score, risk)
    }

    data class StopBangResult(val score: Int, val risk: String)
    fun stopBangScore(answers: List<Boolean>): StopBangResult {
        val score = answers.count { it }
        val risk = when {
            score <= 2 -> "Low risk"
            score <= 4 -> "Intermediate risk"
            else -> "High risk"
        }
        return StopBangResult(score, risk)
    }

    data class ChildPughResult(val score: Int, val grade: String)
    fun childPughScore(scores: List<Int>): ChildPughResult {
        val total = scores.sum()
        val grade = when {
            total <= 6 -> "Class A (Well-compensated disease)"
            total <= 9 -> "Class B (Significant functional compromise)"
            else -> "Class C (Decompensated disease)"
        }
        return ChildPughResult(total, grade)
    }

    fun meldScore(bilirubin: Double, inr: Double, creatinine: Double): Int {
        val b = max(bilirubin, 1.0)
        val i = max(inr, 1.0)
        val c = max(min(creatinine, 4.0), 1.0)
        val raw = 3.78 * ln(b) + 11.2 * ln(i) + 9.57 * ln(c) + 6.43
        return raw.roundToInt()
    }

    fun qsofaScore(rrOver22: Boolean, sbpUnder100: Boolean, alteredMentation: Boolean): Int {
        var count = 0
        if (rrOver22) count++
        if (sbpUnder100) count++
        if (alteredMentation) count++
        return count
    }

    // ---------- ICU & Vent ----------

    fun lungProtectiveTidalVolumeMl(pbwKg: Double, mlPerKg: Double = 6.0): Double {
        return pbwKg * mlPerKg
    }

    fun pfRatio(paO2: Double, fiO2Fraction: Double): Double {
        if (fiO2Fraction <= 0) return 0.0
        return paO2 / fiO2Fraction
    }

    fun ardsSeverityBerlin(ratio: Double, peepCmH2O: Double?): String {
        if (peepCmH2O != null && peepCmH2O < 5 && ratio <= 300) {
            return "Meets ratio, but PEEP <5 (Berlin criteria unmet)"
        }
        return when {
            ratio > 300 -> "Not ARDS by ratio"
            ratio > 200 -> "Mild ARDS (201–300 mmHg)"
            ratio > 100 -> "Moderate ARDS (101–200 mmHg)"
            else -> "Severe ARDS (≤100 mmHg)"
        }
    }

    fun sfRatio(spo2Percent: Double, fiO2Fraction: Double): Double {
        if (fiO2Fraction <= 0) return 0.0
        return spo2Percent / fiO2Fraction
    }

    fun oxygenationIndex(fiO2Fraction: Double, meanAirwayPressureCmH2O: Double, paO2: Double): Double {
        if (paO2 <= 0) return 0.0
        return (fiO2Fraction * meanAirwayPressureCmH2O * 100.0) / paO2
    }

    fun drivingPressure(plateauPressure: Double, peep: Double): Double {
        return plateauPressure - peep
    }

    fun minuteVentilationLPerMin(tidalVolumeMl: Double, rr: Double): Double {
        return (tidalVolumeMl * rr) / 1000.0
    }

    fun crrtEffluentRateMlPerHr(weightKg: Double, doseMlPerKgPerHr: Double = 25.0): Double {
        return weightKg * doseMlPerKgPerHr
    }

    fun norepinephrineEquivalent(
        norepi: Double = 0.0,
        epi: Double = 0.0,
        dopamine: Double = 0.0,
        phenylephrine: Double = 0.0
    ): Double {
        return norepi + epi + (dopamine / 100.0) + (phenylephrine / 10.0)
    }

    // ---------- Regional LA Max Doses ----------

    enum class LocalAnesthetic(
        val displayName: String,
        val plainMgPerKg: Double,
        val withEpiMgPerKg: Double,
        val plainAbsoluteMaxMg: Double,
        val withEpiAbsoluteMaxMg: Double
    ) {
        LIDOCAINE("Lidocaine (Lignocaine)", 4.5, 7.0, 300.0, 500.0),
        BUPIVACAINE("Bupivacaine", 2.0, 2.5, 150.0, 175.0),
        ROPIVACAINE("Ropivacaine", 3.0, 3.0, 200.0, 250.0)
    }

    fun localAnestheticMaxDoseMg(drug: LocalAnesthetic, weightKg: Double, withEpi: Boolean): Double {
        val perKgMax = weightKg * (if (withEpi) drug.withEpiMgPerKg else drug.plainMgPerKg)
        val absoluteMax = if (withEpi) drug.withEpiAbsoluteMaxMg else drug.plainAbsoluteMaxMg
        return min(perKgMax, absoluteMax)
    }

    fun localAnestheticDoseFromVolumeMg(volumeMl: Double, percentConcentration: Double): Double {
        val mgPerMl = percentConcentration * 10.0
        return volumeMl * mgPerMl
    }
}
