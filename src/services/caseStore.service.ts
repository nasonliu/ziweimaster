import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ChatMessage } from "./deepseek.service.js";

export type StoredCase = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  birthInput: unknown;
  uiState?: unknown;
  analysisData?: unknown;
  chatMessages: ChatMessage[];
};

export type StoredCaseSummary = Pick<StoredCase, "id" | "title" | "createdAt" | "updatedAt">;

export type SaveCaseInput = {
  id?: string;
  title?: string;
  birthInput: unknown;
  uiState?: unknown;
  analysisData?: unknown;
  chatMessages?: ChatMessage[];
};

function storePath() {
  return process.env.ZIWEI_CASE_STORE ?? path.join(process.cwd(), "data", "cases.json");
}

async function readCases(): Promise<StoredCase[]> {
  try {
    const text = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(text) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredCase[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeCases(cases: StoredCase[]) {
  const target = storePath();
  await mkdir(path.dirname(target), { recursive: true });
  const temp = `${target}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(cases, null, 2)}\n`, "utf8");
  await rename(temp, target);
}

function titleFromInput(input: SaveCaseInput) {
  if (input.title?.trim()) return input.title.trim().slice(0, 80);
  const record = input.birthInput && typeof input.birthInput === "object" ? (input.birthInput as Record<string, unknown>) : {};
  const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : "未命名命例";
  const birthDateTime = typeof record.birthDateTime === "string" ? record.birthDateTime.slice(0, 10) : "";
  return birthDateTime ? `${name} ${birthDateTime}` : name;
}

export async function listStoredCases(): Promise<StoredCaseSummary[]> {
  const cases = await readCases();
  return cases
    .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getStoredCase(id: string): Promise<StoredCase | undefined> {
  const cases = await readCases();
  return cases.find((item) => item.id === id);
}

export async function saveStoredCase(input: SaveCaseInput): Promise<StoredCase> {
  const cases = await readCases();
  const now = new Date().toISOString();
  const existingIndex = input.id ? cases.findIndex((item) => item.id === input.id) : -1;
  const existing = existingIndex >= 0 ? cases[existingIndex] : undefined;
  const next: StoredCase = {
    id: existing?.id ?? randomUUID(),
    title: titleFromInput(input),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    birthInput: input.birthInput,
    uiState: input.uiState,
    analysisData: input.analysisData,
    chatMessages: input.chatMessages ?? existing?.chatMessages ?? []
  };

  if (existingIndex >= 0) {
    cases[existingIndex] = next;
  } else {
    cases.push(next);
  }
  await writeCases(cases);
  return next;
}

export async function deleteStoredCase(id: string): Promise<boolean> {
  const cases = await readCases();
  const next = cases.filter((item) => item.id !== id);
  if (next.length === cases.length) return false;
  await writeCases(next);
  return true;
}
