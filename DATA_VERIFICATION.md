# Data Verification — read before clinical use

This app ships with a small set of **seed data** so every module has something real to
render and search. That seed data was drafted using general medical/pharmacology
knowledge, the same way a textbook summary would be — **it was not checked against the
current ISA guideline documents, product inserts, or your institution's protocols.**

## What this means concretely

- Every drug, protocol, crisis-algorithm, and checklist record has a `verificationStatus`
  field, shown as a badge in the UI:
  - 🟥 **Unverified seed data — do not use clinically** (`unverified-ai-seed`): most of
    the bundled content. Treat exactly like an unreviewed first draft.
  - 🟨 **Imported — needs review** (`needs-review`): used for the WHO Surgical Safety
    Checklist item, which is paraphrased from a real, named, publicly published
    document but hasn't been checked by a clinician against the current version.
  - 🟩 **Clinician-verified** (`verified`): reserved for records someone with clinical
    authority has actually checked against a primary source. **No seed record currently
    has this status.**

- Numbers that look precise (e.g. "1.5 mg/kg IV") are the same numbers you'd find in a
  standard anaesthesia textbook summary — not numbers pulled from a specific ISA
  document, a specific product insert, or your hospital's crash cart card. Product
  concentrations, reconstitution volumes, and pediatric dosing in particular vary by
  manufacturer and institution and must be confirmed locally.

## Before this app is used near a real patient

1. Have a consultant/faculty member (or your pharmacy/P&T committee) review every
   record you intend to rely on, against the actual source document.
2. Update that record's `verificationStatus` to `"verified"` and fill in the `source`
   fields with the real document title, year, version, and evidence level.
3. Prefer importing real guideline content over hand-editing the seed JSON — see the
   "Guideline data import" section in `README.md` — so the provenance trail (who
   reviewed it, from which document) stays intact.
4. Treat the Crisis Management algorithms with particular care: they are structured
   after widely-taught sequences (ACLS-style arrest algorithm, MHAUS-style MH response,
   ASRA-style LAST management) but specific numbers — dantrolene reconstitution and
   total dose, lipid emulsion bolus/infusion rates, defibrillation energies — must be
   confirmed against your actual cart cards and product inserts before they're trusted
   in an emergency.

This isn't a formality. A wrong number in a drug-reference app is a different kind of
mistake than a wrong number in a search engine result — it can look authoritative right
when someone has the least time to double-check it.
