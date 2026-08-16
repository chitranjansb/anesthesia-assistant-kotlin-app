import type { SearchDoc } from "./types";
import { getAllDrugs, getAllProtocols, getAllCrisisAlgorithms, getAllChecklists, getAllRegionalBlocks } from "./data";
import { CALCULATOR_REGISTRY } from "./calculator-registry";

// Lay-term → clinical keyword synonyms. Lets residents search "shock",
// "vasopressor", "pregnancy", "renal failure", "children" instead of exact names.
const SYNONYMS: Record<string, string[]> = {
  shock: ["vasopressor", "hypotension", "fluid", "crisis"],
  vasopressor: ["epinephrine", "norepinephrine", "phenylephrine", "hypotension", "shock"],
  hypotension: ["vasopressor", "epinephrine", "shock", "fluid", "crisis"],
  hypertension: ["esmolol", "labetalol", "crisis"],
  bradycardia: ["atropine", "glycopyrrolate", "crisis", "emergency"],
  tachycardia: ["esmolol", "beta-blocker", "emergency"],
  pregnancy: ["obstetric", "lactation", "fetal", "category"],
  pregnant: ["obstetric", "lactation", "fetal", "pregnancy"],
  "renal failure": ["renal", "dialysis", "nephro", "adjustment", "ckd"],
  "renal insufficiency": ["renal", "dialysis", "ckd"],
  ckd: ["renal", "dialysis", "adjustment"],
  liver: ["hepatic", "cirrhosis", "adjustment"],
  "hepatic failure": ["hepatic", "cirrhosis", "adjustment"],
  children: ["pediatric", "paediatric", "infant", "neonatal", "child"],
  pediatric: ["children", "paediatric", "infant", "neonatal"],
  paediatric: ["children", "pediatric", "infant", "neonatal"],
  neonatal: ["newborn", "infant", "children"],
  infant: ["children", "pediatric", "neonatal"],
  elderly: ["geriatric", "age", "older"],
  geriatric: ["elderly", "age", "older"],
  obese: ["obesity", "weight", "bmi", "lbw"],
  obesity: ["obese", "weight", "bmi"],
  diabetes: ["insulin", "sugar", "glucose"],
  asthma: ["bronchospasm", "copd", "airway"],
  bronchospasm: ["asthma", "copd", "airway", "emergency"],
  allergy: ["anaphylaxis", "crisis", "emergency"],
  anaphylaxis: ["allergy", "crisis", "emergency", "epinephrine"],
  seizure: ["convulsion", "status epilepticus", "emergency", "midazolam"],
  vomiting: ["ponv", "antiemetic", "ondansetron", "dexamethasone"],
  ponv: ["vomiting", "antiemetic", "ondansetron", "dexamethasone"],
  nausea: ["ponv", "antiemetic", "ondansetron"],
  pain: ["analgesia", "opioid", "fentanyl", "remifentanil", "block"],
  analgesia: ["pain", "opioid", "fentanyl", "remifentanil"],
  paralysis: ["neuromuscular", "rocuronium", "succinylcholine", "vecuronium", "rsi"],
  rsi: ["rapid sequence", "paralysis", "rocuronium", "succinylcholine", "induction"],
  induction: ["rsi", "propofol", "ketamine", "etomidate", "thiopental"],
  sedation: ["dexmedetomidine", "midazolam", "propofol", "rass", "icu"],
  local: ["regional", "lidocaine", "bupivacaine", "ropivacaine", "last"],
  regional: ["local", "block", "lidocaine", "bupivacaine", "ropivacaine"],
  last: ["local", "lipid", "lidocaine", "toxicity", "crisis"],
  airway: ["intubation", "lma", "ett", "difficult", "crico", "lemon", "mallampati"],
  intubation: ["airway", "rsi", "rocuronium", "succinylcholine", "ett"],
  difficult: ["airway", "lemon", "mallampati", "rods", "moans", "crico"],
  hyperthermia: ["malignant", "dantrolene", "mh", "crisis"],
  malignant: ["hyperthermia", "dantrolene", "mh", "crisis"],
  mh: ["malignant", "hyperthermia", "dantrolene", "crisis"],
  bleeding: ["blood", "transfusion", "loss", "hemorrhage"],
  transfusion: ["blood", "loss", "hemorrhage", "bleeding"],
  emergency: ["crisis", "resuscitation", "acls", "code"],
  crisis: ["emergency", "resuscitation", "acls", "algorithm"],
  fluid: ["maintenance", "deficit", "bolus", "crystalloid"],
  weight: ["ibw", "lbw", "bmi", "dose"],
  dose: ["weight", "mg/kg", "infusion", "calculator"],
  sepsis: ["septic", "shock", "sofa", "qsofa", "lactate", "vasopressor", "icu"],
  septic: ["sepsis", "shock", "sofa", "icu"],
  ventilator: ["vent", "icu", "ards", "pressure", "tidal volume", "peep"],
  ards: ["ventilator", "lung-protective", "tidal volume", "pf ratio", "icu"],
  icu: ["ventilator", "sepsis", "crrt", "sedation", "rass"],
  dialysis: ["renal", "crrt", "rrt", "ckd"],
  crrt: ["dialysis", "renal", "rrt", "icu"],
  block: ["regional", "nerve block", "plexus", "neuraxial"],
  neuraxial: ["spinal", "epidural", "block"],
  spinal: ["neuraxial", "subarachnoid", "block"],
  epidural: ["neuraxial", "labour", "labor", "block"],
};

export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const [drugs, protocols, crisis, checklists, regionalBlocks] = await Promise.all([
    getAllDrugs(),
    getAllProtocols(),
    getAllCrisisAlgorithms(),
    getAllChecklists(),
    getAllRegionalBlocks(),
  ]);

  const docs: SearchDoc[] = [];

  for (const d of drugs) {
    const keywords = Array.from(
      new Set([
        d.genericName,
        d.drugClass,
        ...d.brandExamplesIndia,
        ...d.tags,
        d.pregnancyCategory ?? "",
        ...(d.mechanism.match(/[a-z\-]+/gi) ?? []).slice(0, 6),
      ])
    ).filter(Boolean);
    docs.push({
      kind: "drug",
      id: d.id,
      title: d.genericName,
      subtitle: d.drugClass,
      keywords,
      href: `/drugs#${d.id}`,
    });
  }

  for (const p of protocols) {
    const keywords = Array.from(new Set([p.title, p.category, p.summary, ...p.sections.map((s) => s.heading)]))
      .filter(Boolean);
    docs.push({
      kind: "protocol",
      id: p.id,
      title: p.title,
      subtitle: p.category,
      keywords,
      href: `/checklists#${p.id}`,
    });
  }

  for (const c of crisis) {
    const keywords = Array.from(new Set([c.title, c.category, c.triggerCriteria, ...c.title.toLowerCase().split(" ")]))
      .filter(Boolean);
    docs.push({
      kind: "crisis",
      id: c.id,
      title: c.title,
      subtitle: c.category,
      keywords,
      href: `/crisis#${c.id}`,
    });
  }

  for (const ch of checklists) {
    const keywords = [ch.title, ch.phase].filter(Boolean);
    docs.push({
      kind: "checklist",
      id: ch.id,
      title: ch.title,
      subtitle: ch.phase,
      keywords,
      href: `/checklists#${ch.id}`,
    });
  }

  for (const rb of regionalBlocks) {
    const keywords = Array.from(
      new Set([rb.name, rb.category, rb.targetNervesOrPlane, ...rb.commonIndications])
    ).filter(Boolean);
    docs.push({
      kind: "regional-block",
      id: rb.id,
      title: rb.name,
      subtitle: rb.category,
      keywords,
      href: `/regional#${rb.id}`,
    });
  }

  for (const calc of CALCULATOR_REGISTRY) {
    docs.push({
      kind: "calculator",
      id: calc.id,
      title: calc.title,
      subtitle: calc.category,
      keywords: [calc.title, calc.category, calc.description],
      href: `/calculators#${calc.id}`,
    });
  }

  docs.push(
    { kind: "airway", id: "mallampati", title: "Mallampati classification", subtitle: "Airway assessment", keywords: ["mallampati", "airway", "difficult", "assessment"], href: "/airway#mallampati" },
    { kind: "airway", id: "lemon", title: "LEMON assessment", subtitle: "Difficult airway prediction", keywords: ["lemon", "difficult", "airway", "prediction"], href: "/airway#lemon" },
    { kind: "airway", id: "rass", title: "RASS scale", subtitle: "Sedation assessment", keywords: ["rass", "sedation", "agitation", "icu", "richmond"], href: "/icu#rass" },
    { kind: "airway", id: "vent-modes", title: "Ventilator modes reference", subtitle: "ICU / ventilation", keywords: ["ventilator", "modes", "vcv", "pcv", "prvc", "simv", "psv", "cpap", "icu"], href: "/icu#vent-modes" }
  );

  return docs;
}

function expandQuery(q: string): string[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = new Set<string>();
  for (const t of terms) {
    expanded.add(t);
    if (SYNONYMS[t]) SYNONYMS[t].forEach((s) => expanded.add(s));
  }
  return Array.from(expanded);
}

export function filterDocs(docs: SearchDoc[], query: string): SearchDoc[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const expanded = expandQuery(q);
  const scored = docs
    .map((d) => {
      const hay = (d.title + " " + (d.subtitle ?? "") + " " + d.keywords.join(" ")).toLowerCase();
      let score = 0;
      for (const term of expanded) {
        if (d.title.toLowerCase().includes(term)) score += 3;
        else if (hay.includes(term)) score += 1;
      }
      return { doc: d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 20).map((x) => x.doc);
}
