package com.example.anesthesiaassistant.domain

import com.example.anesthesiaassistant.data.model.CaseInput
import com.example.anesthesiaassistant.data.model.CasePlanRow

object CaseEngine {
    fun generateCasePlan(input: CaseInput): List<CasePlanRow> {
        val ageYears = input.ageYears
        val weightKg = input.weightKg
        val asa = input.asa
        val surgery = input.surgery
        val comorbidities = input.comorbidities

        val co = comorbidities.map { it.lowercase() }.toSet()
        val isPregnant = co.contains("pregnancy") || co.contains("obstetric")
        val isRenal = co.contains("renal-failure") || co.contains("ckd") || co.contains("renal insufficiency")
        val isHepatic = co.contains("liver") || co.contains("cirrhosis") || co.contains("hepatic-failure")
        val isCopd = co.contains("copd") || co.contains("asthma") || co.contains("bronchospasm")
        val isElderly = ageYears >= 65
        val isPediatric = ageYears in 0.1..15.9
        val highRisk = asa == "III" || asa == "IV" || asa == "V" || asa.startsWith("E")
        val major = Regex("lap|lapar|thorac|vascular|neuro|ortho|spine|abdo|intracranial|cardiac", RegexOption.IGNORE_CASE).containsMatchIn(surgery)

        val rows = mutableListOf<CasePlanRow>()

        // 1. Induction
        val inductionDrug = if (highRisk || isPregnant) "etomidate" else "propofol"
        val inductionDose = when {
            isElderly -> "induction dose reduced ~20–50%"
            isPediatric -> "weight-based induction dose"
            else -> "standard induction dose"
        }
        val highRiskNote = if (highRisk) " (preferred when haemodynamic stability is critical)" else ""
        rows.add(
            CasePlanRow(
                section = "Induction",
                text = "$inductionDrug for induction$highRiskNote; $inductionDose. Pair with rocuronium for paralysis (reverse deep block with sugammadex).",
                rationale = "Common balanced-TIVA pattern; etomidate preferred in shock/high-risk for cardiovascular stability.",
                drugIds = listOf(inductionDrug, "rocuronium", "sugammadex")
            )
        )

        // 2. Airway
        val airwayText = if (highRisk || co.contains("obesity") || co.contains("neck")) {
            "Anticipate possible difficult airway: have supraglottic airway (LMA) and cricothyrotomy kit ready; consider awake technique if predictors present."
        } else {
            "Standard rapid sequence induction with direct/video laryngoscopy; have supraglottic airway as rescue."
        }
        rows.add(
            CasePlanRow(
                section = "Airway",
                text = airwayText,
                rationale = "Difficult-airway planning reduces failed-airway harm; confirm predictors (LEMON/Mallampati) pre-induction.",
                drugIds = listOf("rocuronium", "succinylcholine")
            )
        )

        // 3. Monitoring
        val monitorText = if (highRisk || major) {
            "ASA standard monitors + invasive arterial line and invasive BP for major/unstable cases; consider CVP/urine output."
        } else {
            "ASA standard monitors (ECG, SpO2, NIBP, ETCO2, temperature)."
        }
        rows.add(
            CasePlanRow(
                section = "Monitoring",
                text = monitorText,
                rationale = "Escalate monitoring with physiologic reserve and surgical magnitude."
            )
        )

        // 4. Analgesia
        val analgesia = mutableListOf("Multi-modal: paracetamol + intra-op opioid (fentanyl/remifentanil)")
        if (!isRenal) analgesia.add("consider NSAID if no contraindication")
        if (major) analgesia.add("consider regional/nerve block for major surgery")
        rows.add(
            CasePlanRow(
                section = "Analgesia",
                text = analgesia.joinToString("; ") + ".",
                rationale = "Multi-modal analgesia reduces opioid requirement and PONV.",
                drugIds = listOf("fentanyl", "remifentanil")
            )
        )

        // 5. Antiemetic (PONV)
        rows.add(
            CasePlanRow(
                section = "Antiemetic",
                text = "Multimodal PONV prophylaxis: ondansetron 4 mg IV near end of surgery + dexamethasone 0.1–0.2 mg/kg IV at induction (avoid if diabetic/risk factors).",
                rationale = "Combination prophylaxis outperforms single-agent; scale with Apfel risk factors. [Miller's Ch. 76]",
                drugIds = listOf("ondansetron")
            )
        )

        // 6. Antibiotic
        rows.add(
            CasePlanRow(
                section = "Antibiotic",
                text = "Surgical antibiotic prophylaxis within 60 min before incision (cefazolin 2 g IV if no allergy); redose per institutional guidance for long cases.",
                rationale = "Timely prophylaxis reduces SSIs; confirm allergy and local protocol."
            )
        )

        // 7. Comorbidity-specific flags
        if (isRenal) {
            rows.add(
                CasePlanRow(
                    section = "Renal adjustment",
                    text = "Dose-adjust renally-cleared drugs; avoid nephrotoxins; check K+ and last dialysis. Prefer drugs with non-renal clearance where possible.",
                    rationale = "Renal impairment changes volume of distribution and elimination.",
                    drugIds = listOf("rocuronium", "vecuronium", "neostigmine")
                )
            )
        }
        if (isHepatic) {
            rows.add(
                CasePlanRow(
                    section = "Hepatic adjustment",
                    text = "Prefer agents with extra-hepatic/plasma metabolism; reduce doses of hepatically cleared drugs; correct coagulopathy pre-op.",
                    rationale = "Reduced synthetic and metabolic reserve.",
                    drugIds = listOf("remifentanil", "vecuronium")
                )
            )
        }
        if (isCopd) {
            rows.add(
                CasePlanRow(
                    section = "Respiratory precaution",
                    text = "Optimise bronchodilators; have bronchospasm rescue (β-agonist + epinephrine) ready; avoid histamine-releasing drugs where possible.",
                    rationale = "Reactive airway increases bronchospasm risk peri-induction.",
                    drugIds = listOf("epinephrine")
                )
            )
        }
        if (isPregnant) {
            rows.add(
                CasePlanRow(
                    section = "Obstetric note",
                    text = "Left uterine displacement after 20 wk; increased gastric aspirate risk — rapid sequence with cricoid pressure; avoid teratogens.",
                    rationale = "Aortocaval compression and reduced LES tone in pregnancy."
                )
            )
        }
        if (isElderly) {
            rows.add(
                CasePlanRow(
                    section = "Geriatric note",
                    text = "Reduce induction and opioid doses; attention to frailty, cognition, and post-op delirium risk.",
                    rationale = "Age reduces MAC and drug tolerance; narrow therapeutic index."
                )
            )
        }

        return rows
    }
}
