import drugsSeed from "@/data/drugs.json";
import protocolsSeed from "@/data/protocols.json";
import crisisSeed from "@/data/crisis-algorithms.json";
import checklistsSeed from "@/data/checklists.json";
import regionalBlocksSeed from "@/data/regional-blocks.json";
import type { Drug, Protocol, CrisisAlgorithm, Checklist, RegionalBlock } from "./types";
import {
  getImportedDrugs,
  getImportedProtocols,
  getImportedCrisisAlgorithms,
  getImportedChecklists,
  getImportedRegionalBlocks,
} from "./db";

function mergeById<T extends { id: string }>(seed: T[], imported: T[]): T[] {
  const map = new Map(seed.map((d) => [d.id, d]));
  for (const item of imported) map.set(item.id, item); // imported wins on id collision
  return Array.from(map.values());
}

export async function getAllDrugs(): Promise<Drug[]> {
  const seed = drugsSeed as Drug[];
  if (typeof window === "undefined") return seed;
  try {
    return mergeById(seed, await getImportedDrugs());
  } catch {
    return seed;
  }
}

export async function getAllProtocols(): Promise<Protocol[]> {
  const seed = protocolsSeed as Protocol[];
  if (typeof window === "undefined") return seed;
  try {
    return mergeById(seed, await getImportedProtocols());
  } catch {
    return seed;
  }
}

export async function getAllCrisisAlgorithms(): Promise<CrisisAlgorithm[]> {
  const seed = crisisSeed as CrisisAlgorithm[];
  if (typeof window === "undefined") return seed;
  try {
    return mergeById(seed, await getImportedCrisisAlgorithms());
  } catch {
    return seed;
  }
}

export async function getAllChecklists(): Promise<Checklist[]> {
  const seed = checklistsSeed as Checklist[];
  if (typeof window === "undefined") return seed;
  try {
    return mergeById(seed, await getImportedChecklists());
  } catch {
    return seed;
  }
}

export async function getAllRegionalBlocks(): Promise<RegionalBlock[]> {
  const seed = regionalBlocksSeed as RegionalBlock[];
  if (typeof window === "undefined") return seed;
  try {
    return mergeById(seed, await getImportedRegionalBlocks());
  } catch {
    return seed;
  }
}
