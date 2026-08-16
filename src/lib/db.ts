import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  FavoriteRecord,
  NoteRecord,
  CalculatorHistoryRecord,
  Drug,
  Protocol,
  CrisisAlgorithm,
  Checklist,
  RegionalBlock,
  CaseRecord,
  SearchableKind,
} from "./types";

const DB_NAME = "ara-db"; // Anesthesia Resident Assistant
const DB_VERSION = 3;

interface AraDB extends DBSchema {
  favorites: { key: string; value: FavoriteRecord };
  notes: { key: string; value: NoteRecord };
  calculatorHistory: { key: string; value: CalculatorHistoryRecord; indexes: { "by-calculator": string } };
  // Admin-imported guideline data lives here and takes precedence over the
  // bundled JSON seed files in src/data — this is how new ISA/AHA source
  // documents get added "without changing code", per the app's design goal.
  importedDrugs: { key: string; value: Drug };
  importedProtocols: { key: string; value: Protocol };
  importedCrisisAlgorithms: { key: string; value: CrisisAlgorithm };
  importedChecklists: { key: string; value: Checklist };
  importedRegionalBlocks: { key: string; value: RegionalBlock };
  // Patient Case Mode plans.
  cases: { key: string; value: CaseRecord; indexes: { "by-created": number } };
  // Recently viewed drugs / calculators for the OT dashboard.
  recent: { key: string; value: { id: string; kind: SearchableKind; refId: string; createdAt: number }; indexes: { "by-time": number } };
}

let dbPromise: Promise<IDBPDatabase<AraDB>> | null = null;

export function getDb() {
  if (typeof window === "undefined") {
    throw new Error("getDb() can only be called in the browser");
  }
  if (!dbPromise) {
    dbPromise = openDB<AraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("favorites")) {
          db.createObjectStore("favorites", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("notes")) {
          db.createObjectStore("notes", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("calculatorHistory")) {
          const store = db.createObjectStore("calculatorHistory", { keyPath: "id" });
          store.createIndex("by-calculator", "calculatorId");
        }
        if (!db.objectStoreNames.contains("importedDrugs")) {
          db.createObjectStore("importedDrugs", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("importedProtocols")) {
          db.createObjectStore("importedProtocols", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("importedCrisisAlgorithms")) {
          db.createObjectStore("importedCrisisAlgorithms", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("importedChecklists")) {
          db.createObjectStore("importedChecklists", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("importedRegionalBlocks")) {
          db.createObjectStore("importedRegionalBlocks", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cases")) {
          const store = db.createObjectStore("cases", { keyPath: "id" });
          store.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("recent")) {
          const store = db.createObjectStore("recent", { keyPath: "id" });
          store.createIndex("by-time", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

// -------- Favorites --------
export async function toggleFavorite(rec: FavoriteRecord) {
  const db = await getDb();
  const existing = await db.get("favorites", rec.id);
  if (existing) {
    await db.delete("favorites", rec.id);
    return false;
  }
  await db.put("favorites", rec);
  return true;
}

export async function getFavorites() {
  const db = await getDb();
  return db.getAll("favorites");
}

export async function isFavorite(id: string) {
  const db = await getDb();
  return (await db.get("favorites", id)) !== undefined;
}

// -------- Notes --------
export async function saveNote(note: NoteRecord) {
  const db = await getDb();
  await db.put("notes", note);
}

export async function deleteNote(id: string) {
  const db = await getDb();
  await db.delete("notes", id);
}

export async function getNotes() {
  const db = await getDb();
  const all = await db.getAll("notes");
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

// -------- Calculator history --------
export async function saveCalculatorRun(rec: CalculatorHistoryRecord) {
  const db = await getDb();
  await db.put("calculatorHistory", rec);
}

export async function getCalculatorHistory(calculatorId: string) {
  const db = await getDb();
  const all = await db.getAllFromIndex("calculatorHistory", "by-calculator", calculatorId);
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
}

// -------- Guideline data import (admin, no-code-change updates) --------
export async function importGuidelineBundle(bundle: {
  drugs?: Drug[];
  protocols?: Protocol[];
  crisisAlgorithms?: CrisisAlgorithm[];
  checklists?: Checklist[];
  regionalBlocks?: RegionalBlock[];
}) {
  const db = await getDb();
  const tx = db.transaction(
    ["importedDrugs", "importedProtocols", "importedCrisisAlgorithms", "importedChecklists", "importedRegionalBlocks"],
    "readwrite"
  );
  for (const d of bundle.drugs ?? []) await tx.objectStore("importedDrugs").put(d);
  for (const p of bundle.protocols ?? []) await tx.objectStore("importedProtocols").put(p);
  for (const c of bundle.crisisAlgorithms ?? []) await tx.objectStore("importedCrisisAlgorithms").put(c);
  for (const c of bundle.checklists ?? []) await tx.objectStore("importedChecklists").put(c);
  for (const r of bundle.regionalBlocks ?? []) await tx.objectStore("importedRegionalBlocks").put(r);
  await tx.done;
}

export async function getImportedDrugs() {
  const db = await getDb();
  return db.getAll("importedDrugs");
}
export async function getImportedProtocols() {
  const db = await getDb();
  return db.getAll("importedProtocols");
}
export async function getImportedCrisisAlgorithms() {
  const db = await getDb();
  return db.getAll("importedCrisisAlgorithms");
}
export async function getImportedChecklists() {
  const db = await getDb();
  return db.getAll("importedChecklists");
}
export async function getImportedRegionalBlocks() {
  const db = await getDb();
  return db.getAll("importedRegionalBlocks");
}

// -------- Patient Case Mode --------

export async function saveCase(rec: CaseRecord) {
  const db = await getDb();
  await db.put("cases", rec);
}

export async function getCases(): Promise<CaseRecord[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("cases", "by-created");
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
}

export async function deleteCase(id: string) {
  const db = await getDb();
  await db.delete("cases", id);
}

// -------- Recent items (OT dashboard) --------

export async function addRecent(kind: SearchableKind, refId: string) {
  const db = await getDb();
  const id = `${kind}:${refId}`;
  await db.put("recent", { id, kind, refId, createdAt: Date.now() });
}

export async function getRecent(): Promise<Array<{ kind: SearchableKind; refId: string }>> {
  const db = await getDb();
  const all = await db.getAllFromIndex("recent", "by-time");
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);
}
