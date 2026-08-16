# Anesthesia Resident Assistant

An offline-first Progressive Web App (PWA) for anaesthesia residents: a drug handbook,
clinical calculators, an ICU module (ventilation, sepsis, RRT, sedation scoring), a
regional anesthesia block library, crisis-management algorithms, and a protocol/checklist
library — built to work with no signal in the OT complex and to install like a native app.

> **For educational and clinical reference only. Clinical decisions remain the
> responsibility of the treating physician.** See [DATA_VERIFICATION.md](./DATA_VERIFICATION.md)
> before this app touches a real patient.

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Radix UI primitives
(hand-wired, shadcn-style) · Framer-Motion-ready · IndexedDB via `idb` · custom Service
Worker · installable manifest · next-themes (dark/light/system).

No backend, no database server, no auth — this is a fully static, client-side app.
All user data (notes, favorites, imported guideline bundles) lives in the browser's
IndexedDB and never leaves the device.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm test          # run the calculator formula test suite (vitest)
```

Requires Node 18+.

## Project structure

```
src/
  app/                  # Next.js App Router pages (one folder per module)
  components/
    ui/                 # Low-level primitives (button, card, dialog, tabs, …)
    layout/             # App shell, theme provider, search dialog, PWA install/register
    shared/              # Cross-module pieces: disclaimer, verification badge,
                          # source citation, protocol/checklist renderers, vitals-trace motif
    drugs/, crisis/, calculators/   # Module-specific components
  data/                 # Bundled seed JSON — drugs.json, protocols.json,
                          # crisis-algorithms.json, checklists.json, regional-blocks.json
  lib/
    types.ts             # The data schema — read this first
    calculators.ts        # Every formula, each with its formula/source in a comment
    db.ts                 # IndexedDB wrapper (favorites, notes, imported guideline data)
    data.ts                # Merges bundled JSON with imported IndexedDB overrides
    search.ts              # Global search index (⌘K / Ctrl+K from anywhere)
  tests/                 # Vitest unit tests for the calculator formulas
public/
  manifest.json, sw.js, offline.html, icons/
```

## The data-provenance model (read this before adding content)

Every clinical fact — every drug, protocol, crisis step, and checklist — carries:

- a `source: SourceRef` (organization, title, year, version, evidence level), and
- a `verificationStatus`: `"verified" | "needs-review" | "unverified-ai-seed"`.

The bundled seed data in `src/data/*.json` is intentionally small and is marked
`unverified-ai-seed` (or `needs-review` for the WHO Surgical Safety Checklist, which is
paraphrased from a real public document). **None of it should be treated as a validated
clinical source.** It exists to make the UI, search, and data pipeline demonstrably work
end-to-end — the real content is meant to come from your ISA/AHA/institutional PDFs,
reviewed by a clinician, and imported as described below.

## Growing the dataset without touching code

Settings → **Guideline data import** accepts a JSON file shaped like:

```json
{
  "drugs": [ /* Drug[] — see src/lib/types.ts */ ],
  "protocols": [ /* Protocol[] */ ],
  "crisisAlgorithms": [ /* CrisisAlgorithm[] */ ],
  "checklists": [ /* Checklist[] */ ],
  "regionalBlocks": [ /* RegionalBlock[] */ ]
}
```

Imported records are stored in IndexedDB and override the bundled seed entries by `id`.
This is the "admin interface for updating guideline datasets without changing code"
called for in the original brief — appropriate for an offline-first app with no backend.
A future iteration could add a small companion CLI/script that validates a batch of
guideline PDFs against `types.ts` before someone uploads them here.

## What's fully implemented vs. intentionally left as a stub

**Fully implemented, deterministic, and unit-tested** (`src/tests/calculators.test.ts`):
BMI/IBW/LBW/ABW, weight-based dosing math, mcg/kg/min ↔ mL/hr conversion, 4-2-1
maintenance fluids, Parkland formula, MAP, anion gap, corrected sodium/calcium, A-a
gradient, estimated blood volume/allowable blood loss, pediatric ETT sizing (Cole's
formula) and depth estimates, LMA sizing chart, GCS, Apfel, RCRI (Lee index),
STOP-BANG, Child-Pugh, MELD, NEWS2, **SOFA** (6 organ systems, pre-scored sub-scores —
same "select the band" approach as Child-Pugh, since the cardiovascular sub-score
depends on vasopressor-dose bands best chosen explicitly rather than re-derived),
**qSOFA**, ASA-PS reference.

**ICU & Ventilation module** (`/icu`, plus a matching "ICU & Vent" tab in Calculators):
lung-protective tidal volume (ARDSnet, on predicted body weight), PaO2/FiO2 ratio with
Berlin-definition ARDS severity banding, SpO2/FiO2 non-invasive surrogate, Oxygenation
Index, driving pressure, minute ventilation, CRRT effluent dose, and a norepinephrine-
equivalent vasopressor-burden index (explicitly flagged as a rough comparative tool —
conversion factors, especially for vasopressin, vary between published sources). The
`/icu` page also bundles a septic-shock resuscitation crisis algorithm, a DOPES-style
ventilator-high-pressure troubleshooting algorithm, the Sepsis Hour-1 bundle checklist,
lung-protective/weaning/VAP-prevention/CRRT-initiation/sedation protocol summaries, a
daily-rounds (FASTHUG-MAIDENS) checklist, and RASS + ventilator-mode quick-reference
tables — all seeded `unverified-ai-seed`/`needs-review` like the rest of the dataset.

**Regional Anesthesia module** (`/regional`, plus a "Regional" tab in Calculators):
12 blocks across upper limb (interscalene, supraclavicular, infraclavicular, axillary),
lower limb (femoral, adductor canal, popliteal sciatic), trunk/abdominal wall (TAP,
erector spinae plane, rectus sheath), and neuraxial (spinal, epidural) — each with
indications, positioning, landmark technique, a plain-language ultrasound/sonoanatomy
description, needle approach, taught LA volume range, onset, complications,
contraindications, and pearls. A local anesthetic maximum-dose calculator (lidocaine/
bupivacaine/ropivacaine, plain vs. with epinephrine, checked against a planned volume +
concentration) sits at the top of the page next to a direct link to the existing LAST
(Local Anaesthetic Systemic Toxicity) crisis algorithm. **Sonoanatomy images/video are
explicitly not included** — see Known Limitations.

**Deliberately not implemented** rather than guessed:
- **POSSUM** — its full physiological/operative severity point tables have enough
  edge-case-dependent scoring rules that reproducing them from memory risked silent
  scoring errors. The registry entry exists (`src/lib/calculator-registry.ts`) with
  `implemented: false` so it's visible as a known gap rather than hidden. (SOFA, its
  former stub-mate, is now implemented — see above.)
- **The full "every commonly used anaesthesia drug" handbook.** The seed set covers
  ~20 core drugs as a working example of the schema. Expanding this responsibly means
  transcribing real ISA/product-insert data with a clinician reviewer, not generating
  more entries from a language model — see the import pathway above.
- **Full ISA/AHA-sourced crisis algorithms and protocols.** The bundled ones (including
  the new ICU set) follow widely-taught structure (e.g. ACLS-style arrest sequencing,
  MHAUS-style MH response, Surviving Sepsis Campaign-style Hour-1 bundle, DOPES vent
  troubleshooting) but are flagged `unverified-ai-seed` and need to be checked against
  your actual adopted guideline documents, particularly around drug reconstitution/
  dosing specifics (e.g. dantrolene) that vary by product and cart.

## PWA / offline behavior

- `public/manifest.json` + generated icons make the app installable on Android/desktop
  Chrome (the in-app "Install app" button in the sidebar/Settings uses the
  `beforeinstallprompt` event; iOS Safari requires the manual "Add to Home Screen" flow).
- `public/sw.js` is a hand-written service worker: precaches the app shell, does
  network-first for navigations (falling back to cache, then `offline.html`), and
  stale-while-revalidate for everything else. No `next-pwa` dependency — one fewer
  moving part to break.
- Dark/light/system theme via `next-themes`, persisted locally.

## Testing

`src/tests/calculators.test.ts` checks every formula in `lib/calculators.ts` against a
hand-computed expected value (e.g. Parkland formula, MELD, Apfel risk bands). Run with
`npm test`. If you add a new calculator, add a test with a worked example before wiring
it into the UI — that's what catches a transposed coefficient before a resident sees it.

## Known limitations of this build

- No authentication/multi-user sync — by design, for an offline-first single-device tool.
- The **ICU module** (ventilator settings/calculators, sepsis bundle + crisis algorithm,
  RRT dosing, sedation/delirium reference) is now built at `/icu` — see above. It is
  seed content like the rest of the app (`unverified-ai-seed`/`needs-review`) and still
  needs clinician review against your institution's adopted sources before real use.
- The **Regional anesthesia block library** is now built at `/regional` — see above. It
  is text-description-only: **no images or video**. Sonoanatomy is genuinely hard to
  convey safely in text (a wrong verbal description of "where the nerve sits relative to
  the artery" is arguably more dangerous than no description at all if someone tries to
  use it as a substitute for real ultrasound training), so treat the `ultrasoundApproach`
  field as orientation/revision material for someone who has already been taught the
  scan, not as a how-to-find-it guide. Adding real sonoanatomy images/video is the
  natural next extension — the `RegionalBlock` type has room for an `imageUrl`/media
  field if you want to add it, ideally sourced from a licensed atlas or your own
  captured/anonymized clips rather than generated.
- **POSSUM** remains an intentional stub (see above) pending a verified source import.
- The full "every commonly used anaesthesia drug" handbook (currently ~20 core drugs)
  and full ISA/AHA-sourced (rather than seeded) protocols/crisis algorithms are still
  the biggest remaining gaps for real clinical use — see the import pathway above.
