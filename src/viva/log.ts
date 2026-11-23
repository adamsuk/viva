// Version-aware parser for the personal log written by the viva skill.
// Schemas live in log-schemas.ts so the skill can fetch them from the platform.

import {
  AI_USE_VALUES,
  LOG_SCHEMAS,
  schemaFor,
  type AiUse,
  type LogSchema,
} from "./log-schemas.ts";

export interface VivaEntry {
  timestamp: string;
  skillVersion: string;
  repo: string;
  branchOrPr: string;
  commitOrRef: string;
  topic: string;
  confidence: number | string;
  grade: string;
  scope: string;
  live: string;
  /** How the change was made (schema 0.4+). `unknown` for older lines or unreadable values. */
  aiUse: AiUse;
  raw: string;
  schemaVersion: string;
}

export type GradeKind = "understood" | "partial" | "missed" | "disputed" | "other";

export interface TopicSummary {
  topic: string;
  entries: VivaEntry[];
  last: VivaEntry;
  highConfidenceMiss: boolean;
  thin: boolean;
  nextSteps: string[];
}

export interface ParsedLog {
  entries: VivaEntry[];
  /** Lines that could not be read as a check (too few fields). */
  skipped: number;
  /** Lines whose version matched no schema; read with the oldest schema. */
  unknownVersion: number;
}

export function parseVivaLog(text: string): VivaEntry[] {
  return parseVivaLogDetailed(text).entries;
}

export function parseVivaLogDetailed(text: string): ParsedLog {
  let skipped = 0;
  let unknownVersion = 0;
  const entries: VivaEntry[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const rough = line.split(" | ").map((p) => p.trim());
    const known = rough.length >= 2 ? schemaFor(rough[1]) : undefined;
    const entry = rough.length >= 2 ? parseWithSchema(line, known ?? LOG_SCHEMAS[0]) : null;
    if (!entry) {
      skipped++;
      continue;
    }
    if (!known) unknownVersion++;
    entries.push(entry);
  }
  entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { entries, skipped, unknownVersion };
}

function parseWithSchema(line: string, schema: LogSchema): VivaEntry | null {
  const parts = line.split(schema.delimiter).map((p) => p.trim());
  if (parts.length < schema.fields.length) return null;
  const get = (name: string) => parts[schema.fields.findIndex((f) => f.name === name)] ?? "";
  const confidenceRaw = get("confidence");
  const confidence = Number(confidenceRaw);
  return {
    timestamp: get("timestamp"),
    skillVersion: get("skillVersion"),
    repo: get("repo"),
    branchOrPr: get("branchOrPr"),
    commitOrRef: get("commitOrRef"),
    topic: get("topic"),
    confidence: Number.isFinite(confidence) ? confidence : confidenceRaw,
    grade: get("grade"),
    scope: get("scope"),
    live: get("live"),
    aiUse: readAiUse(get("aiUse")),
    raw: line,
    schemaVersion: schema.version,
  };
}

function readAiUse(value: string): AiUse {
  const v = value.trim().toLowerCase();
  return (AI_USE_VALUES as readonly string[]).includes(v) ? (v as AiUse) : "unknown";
}

export interface AiUseRow {
  aiUse: AiUse;
  understood: number;
  partial: number;
  missed: number;
  total: number;
}

/** Grades by how the change was made, in a fixed order, for the kinds that have checks. */
export function byAiUse(entries: VivaEntry[]): AiUseRow[] {
  return AI_USE_VALUES.map((aiUse) => {
    const row: AiUseRow = { aiUse, understood: 0, partial: 0, missed: 0, total: 0 };
    for (const e of entries) {
      const kind = gradeKind(e.grade);
      if (e.aiUse !== aiUse) continue;
      if (kind !== "understood" && kind !== "partial" && kind !== "missed") continue;
      row[kind]++;
      row.total++;
    }
    return row;
  }).filter((r) => r.total > 0);
}

export function gradeKind(grade: string): GradeKind {
  const g = grade.trim().toLowerCase();
  if (g === "understood" || g === "ok" || g === "pass") return "understood";
  // A question the user disputed and the agent agreed was faulty says nothing about them.
  if (g === "disputed") return "disputed";
  if (/\b(?:not|never|no longer|\w+n['’]t)[\s-]+(?:\w+[\s-]+)*understood\b/.test(g))
    return "missed";
  if (g.includes("partial") || g.includes("some")) return "partial";
  if (g.includes("miss") || g.includes("wrong") || g.includes("fail")) return "missed";
  return "other";
}

export function isHighConfidence(c: number | string): boolean {
  if (typeof c === "number") return c >= 4;
  const s = String(c).toLowerCase();
  return s === "high" || s === "sure" || s === "5" || s === "4";
}

/** Case- and spacing-insensitive key, so "Webhook retry" and " webhook  retry" are one topic. */
export function topicKey(topic: string): string {
  return topic.trim().replace(/\s+/g, " ").toLowerCase();
}

export type ConfidenceBucket = "low" | "mid" | "high";

/** 1-2 low, 3 mid, 4-5 high; the words low/medium/high (and sure) map the same way. */
export function confidenceBucket(c: number | string): ConfidenceBucket | null {
  const n = typeof c === "number" ? c : Number(String(c).trim());
  if (Number.isFinite(n) && String(c).trim() !== "") {
    if (n >= 1 && n <= 2) return "low";
    if (n === 3) return "mid";
    if (n >= 4 && n <= 5) return "high";
    return null;
  }
  const s = String(c).trim().toLowerCase();
  if (s === "low") return "low";
  if (s === "medium" || s === "mid") return "mid";
  if (s === "high" || s === "sure") return "high";
  return null;
}

export interface CalibrationRow {
  bucket: ConfidenceBucket;
  understood: number;
  partial: number;
  missed: number;
  total: number;
}

/**
 * Confidence against grade. Disputed and unreadable grades, and unreadable confidences, are left
 * out: they say nothing about whether confidence tracked understanding.
 */
export function calibration(entries: VivaEntry[]): CalibrationRow[] {
  const rows: CalibrationRow[] = (["high", "mid", "low"] as const).map((bucket) => ({
    bucket,
    understood: 0,
    partial: 0,
    missed: 0,
    total: 0,
  }));
  for (const e of entries) {
    const bucket = confidenceBucket(e.confidence);
    const kind = gradeKind(e.grade);
    if (!bucket || (kind !== "understood" && kind !== "partial" && kind !== "missed")) continue;
    const row = rows.find((r) => r.bucket === bucket)!;
    row[kind]++;
    row.total++;
  }
  return rows;
}

/** One plain sentence about the sure answers, or null when there are none. */
export function calibrationSentence(rows: CalibrationRow[]): string | null {
  const high = rows.find((r) => r.bucket === "high");
  if (!high || high.total === 0) return null;
  const times = high.total === 1 ? "time" : "times";
  const base = `When you were sure, you understood ${high.understood} of ${high.total} ${times}.`;
  return high.missed > 0
    ? `${base} ${high.missed} confident miss${high.missed === 1 ? " is" : "es are"} the strongest signal to slow down.`
    : base;
}

export function groupByTopic(entries: VivaEntry[]): Map<string, VivaEntry[]> {
  const map = new Map<string, VivaEntry[]>();
  for (const e of entries) {
    const key = topicKey(e.topic);
    const list = map.get(key) ?? [];
    list.push(e);
    map.set(key, list);
  }
  return map;
}

export function summariseTopics(entries: VivaEntry[]): TopicSummary[] {
  return Array.from(groupByTopic(entries).entries())
    .map(([, list]) => {
      const last = list[list.length - 1];
      // Disputed checks are about the question, not the person: leave them out of the signals.
      const counted = list.filter((e) => gradeKind(e.grade) !== "disputed");
      const topic = last.topic.trim().replace(/\s+/g, " ");
      const highConfidenceMiss = counted.some(
        (e) => isHighConfidence(e.confidence) && gradeKind(e.grade) === "missed",
      );
      const recent = counted.slice(-3);
      const thin =
        highConfidenceMiss || recent.filter((e) => gradeKind(e.grade) !== "understood").length >= 2;
      return {
        topic,
        entries: list,
        last,
        highConfidenceMiss,
        thin,
        nextSteps: nextStepsFor(topic, thin, highConfidenceMiss),
      };
    })
    .sort(
      (a, b) => Number(b.thin) - Number(a.thin) || b.last.timestamp.localeCompare(a.last.timestamp),
    );
}

function nextStepsFor(topic: string, thin: boolean, highConfidenceMiss: boolean): string[] {
  if (!thin) return ["Keep the habit: one more viva on the next change in this area."];
  const steps = [
    `Next change in “${topic}” by hand, or generate then make sure you could rewrite it.`,
    "Ask the agent why, not only to produce.",
  ];
  if (highConfidenceMiss) {
    steps.unshift(
      "Confident and wrong — the strongest signal. Slow down and re-explain before the next edit.",
    );
  }
  steps.push("Pair or do a short walkthrough with someone solid in the area.");
  return steps;
}

/** localStorage key for the personal map's lines. They never leave this browser. */
export const LOG_STORAGE_KEY = "viva:personal-map:log";

/**
 * Merge new log text into what is already kept. Blank and comment lines are dropped, identical
 * lines (after trimming) are kept once, and the existing order comes first. Unparseable lines are
 * kept so a newer skill's lines survive until the platform learns their schema.
 */
export function mergeLogs(existing: string, incoming: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of `${existing}\n${incoming}`.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out.length ? `${out.join("\n")}\n` : "";
}

export const SAMPLE_LOG = `# Sample viva skill log (for trying the map)
2026-11-18 14:22 | 0.3.1 | adamsuk/example | pr-12 | abc1234 | webhook retry | 4 | understood | session | live
2026-11-19 09:10 | 0.3.1 | adamsuk/example | pr-18 | def5678 | idempotency key | 5 | missed | checkout | live
2026-11-19 16:40 | 0.3.1 | adamsuk/example | pr-18 | def5678 | idempotency key | 3 | partial | session | live
2026-11-20 11:05 | 0.3.1 | adamsuk/example | main | ghi9012 | skill logging path | 2 | understood | last-commit | live
`;
