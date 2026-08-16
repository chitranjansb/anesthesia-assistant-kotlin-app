import json, sys

PATH = "src/data/drugs.json"
drugs = json.load(open(PATH, encoding="utf-8"))

# Fields to add per drug id, grounded in Miller's Anesthesia 10th ed.
# (classColor, rsi, pediatricRsi, infusionPrep, fluidCompatibility, pregnancyCategory)
# pregnancyCategory: safe | caution | avoid | unknown  (nuance kept in free-text pregnancy/lactation)
ADD = {
  "propofol": dict(
    classColor="indigo",
    rsi={"label":"RSI induction","value":"2–2.5 mg/kg IV (reduce with premedication/age)","notes":"Commonly paired with rocuronium 1.2 mg/kg for RSI."},
    infusionPrep="TIVA: 200 mg in 20 mL (or 500 mg in 50 mL NS) → 10 mg/mL; run 50–150 mcg/kg/min.",
    fluidCompatibility="Lipid emulsion — give via dedicated line; do not mix with other agents in the same syringe.",
    pregnancyCategory="caution",
  ),
  "ketamine": dict(
    classColor="violet",
    rsi={"label":"RSI induction (hemodynamically unstable)","value":"2 mg/kg IV (or 4–6 mg/kg IM)","notes":"Preferred when hypotension/shock is a concern."},
    infusionPrep="Analgesia/sedation: 100–500 mg in 100 mL NS → 1–5 mg/mL; run 0.1–0.5 mg/kg/h.",
    fluidCompatibility="Compatible with NS/RL; stable in infusion.",
    pregnancyCategory="caution",
  ),
  "etomidate": dict(
    classColor="teal",
    rsi={"label":"RSI induction (hemodynamically unstable)","value":"0.3 mg/kg IV","notes":"Preferred when haemodynamic stability is critical (e.g. sepsis, cardiac)."},
    infusionPrep="Sedation: 20 mg in 20 mL NS → 1 mg/mL; titrate to effect.",
    fluidCompatibility="Compatible with NS/RL.",
    pregnancyCategory="caution",
  ),
  "midazolam": dict(
    classColor="sky",
    rsi=None,
    infusionPrep="Sedation/infusion: 5 mg in 50 mL NS → 100 mcg/mL; titrate 0.5–2 mg/h.",
    fluidCompatibility="Compatible with NS/RL; compatible with opioids/fentanyl in same line.",
    pregnancyCategory="caution",
  ),
  "dexmedetomidine": dict(
    classColor="cyan",
    rsi=None,
    infusionPrep="Sedation: 200 mcg in 50 mL NS → 4 mcg/mL; load 1 mcg/kg over 10 min, then 0.2–0.7 mcg/kg/h.",
    fluidCompatibility="Compatible with NS/RL; do not mix with blood products.",
    pregnancyCategory="caution",
  ),
  "fentanyl": dict(
    classColor="rose",
    rsi={"label":"RSI adjunct","value":"1–2 mcg/kg IV with induction","notes":"For intubating conditions / blunting response."},
    infusionPrep="Infusion: 500 mcg in 100 mL NS → 5 mcg/mL (or 250 mcg in 50 mL → 5 mcg/mL); run 0.5–3 mcg/kg/h.",
    fluidCompatibility="Compatible with NS/RL; mixes with midazolam/propofol lines.",
    pregnancyCategory="caution",
  ),
  "remifentanil": dict(
    classColor="rose",
    rsi={"label":"RSI induction","value":"1–2 mcg/kg IV (4 mcg/kg for rapid intubating conditions)","notes":"Bolus causes transient apnoea/rigidity."},
    infusionPrep="Infusion: 2 mg in 50 mL NS → 40 mcg/mL; run 0.05–0.3 mcg/kg/min. Effect ends minutes after stop.",
    fluidCompatibility="Compatible with NS/RL; mix ONLY with water for injection or specific diluents per label.",
    pregnancyCategory="caution",
  ),
  "succinylcholine": dict(
    classColor="orange",
    rsi={"label":"RSI paralytic","value":"1.5 mg/kg IV (ED95 ~1 mg/kg)","notes":"Intubating conditions in ~60 s; avoid in uncontrolled hyperkalaemia / MH risk."},
    pediatricRsi={"label":"RSI (no IV access)","value":"4 mg/kg IM","notes":"Slower onset than IV; use when IV access delayed."},
    infusionPrep=None,
    fluidCompatibility="Reconstitute with water for injection; do not refrigerate reconstituted solution.",
    pregnancyCategory="caution",
  ),
  "rocuronium": dict(
    classColor="amber",
    rsi={"label":"RSI paralytic","value":"1.2 mg/kg IV (0.6–1.0 mg/kg for non-emergency)","notes":"Intubating conditions in ~60 s; reverse deep block with sugammadex 16 mg/kg."},
    infusionPrep="Maintenance infusion: 50 mg in 50 mL NS → 1 mg/mL; run 0.075–0.6 mg/kg/h.",
    fluidCompatibility="Compatible with NS/RL; compatible with common perioperative drugs.",
    pregnancyCategory="caution",
  ),
  "vecuronium": dict(
    classColor="amber",
    rsi={"label":"RSI paralytic (high-dose)","value":"0.28 mg/kg IV (4×ED95)","notes":"Slower onset than rocuronium/sux; reverse with neostigmine or sugammadex."},
    infusionPrep="Maintenance infusion: 10 mg in 100 mL NS → 0.1 mg/mL; run 1–2 mcg/kg/min.",
    fluidCompatibility="Compatible with NS/RL.",
    pregnancyCategory="caution",
  ),
  "sugammadex": dict(
    classColor="emerald",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Reconstitute/dilute per label; do not mix with other drugs in same line.",
    pregnancyCategory="caution",
  ),
  "neostigmine": dict(
    classColor="fuchsia",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Compatible with NS; always co-give glycopyrrolate/atropine in same line.",
    pregnancyCategory="caution",
  ),
  "glycopyrrolate": dict(
    classColor="fuchsia",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Compatible with NS; mix with neostigmine for reversal.",
    pregnancyCategory="caution",
  ),
  "lidocaine": dict(
    classColor="lime",
    rsi=None,
    infusionPrep="Infusion: 100 mg in 100 mL NS → 1 mg/mL; run 1–4 mg/kg/h (max ~ max dose).",
    fluidCompatibility="Compatible with NS/RL.",
    pregnancyCategory="caution",
  ),
  "epinephrine": dict(
    classColor="rose",
    rsi=None,
    infusionPrep="Push-dose: 1 mg in 100 mL NS → 10 mcg/mL; give 5–20 mcg IV boluses. Infusion: 1 mg in 250 mL NS → 4 mcg/mL (titrate).",
    fluidCompatibility="Compatible with NS; absorbed by some plastics — use dedicated line for infusions.",
    pregnancyCategory="safe",
  ),
  "atropine": dict(
    classColor="fuchsia",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Compatible with NS; mix with neostigmine for reversal.",
    pregnancyCategory="caution",
  ),
  "ondansetron": dict(
    classColor="emerald",
    rsi=None,
    infusionPrep="Infusion (if used): 4 mg in 50 mL NS → 80 mcg/mL; run over 15–30 min.",
    fluidCompatibility="Compatible with NS/RL.",
    pregnancyCategory="safe",
  ),
  "sevoflurane": dict(
    classColor="indigo",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Volatile agent — vapourised, not an IV infusion.",
    pregnancyCategory="caution",
  ),
  "isoflurane": dict(
    classColor="indigo",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Volatile agent — vapourised, not an IV infusion.",
    pregnancyCategory="caution",
  ),
  "desflurane": dict(
    classColor="indigo",
    rsi=None,
    infusionPrep=None,
    fluidCompatibility="Volatile agent — vapourised, not an IV infusion (requires Tec 6/DED vaporiser).",
    pregnancyCategory="caution",
  ),
}

n = 0
for d in drugs:
    a = ADD.get(d["id"])
    if not a:
        continue
    for k, v in a.items():
        if v is not None:
            d[k] = v
    n += 1

json.dump(drugs, open(PATH, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print(f"Backfilled {n} drugs with new OT-first fields. needs-review status preserved.")
