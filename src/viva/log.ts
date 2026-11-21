// Parser and light analysis for the personal log written by the viva skill.
// Format (one line):
// YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live

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
  raw: string;
}

export type GradeKind = "understood" | "partial" | "missed" | "other";

export interface TopicSummary {
  topic: string;
  entries: VivaEntry[];
  last: VivaEntry;
  highConfidenceMiss: boolean;
  thin: boolean;
  nextSteps: string[];
}

export function parseVivaLog(text: string): VivaEntry[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map(parseLine)
    .filter((e): e is VivaEntry => e !== null)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function parseLine(line: string): VivaEntry | null {
  const parts = line.split(" | ").map((p) => p.trim());
  if (parts.length < 10) return null;
  const [timestamp, skillVersion, repo, branchOrPr, commitOrRef, topic, confidenceRaw, grade, scope, live] =
    parts;
  const confidence = Number(confidenceRaw);
  return {
    timestamp,
    skillVersion,
    repo,
    branchOrPr,
    commitOrRef,
    topic,
    confidence: Number.isFinite(confidence) ? confidence : confidenceRaw,
    grade,
    scope,
    live,
    raw: line,
  };
}

export function gradeKind(grade: string): GradeKind {
  const g = grade.trim().toLowerCase();
  if (g === "understood" || g === "ok" || g === "pass") return "understood";
  if (/\b(?:not|never|no longer|\w+n['’]t)[\s-]+(?:\w+[\s-]+)*understood\b/.test(g)) return "missed";
  if (g.includes("partial") || g.includes("some")) return "partial";
  if (g.includes("miss") || g.includes("wrong") || g.includes("fail")) return "missed";
  return "other";
}

export function isHighConfidence(c: number | string): boolean {
  if (typeof c === "number") return c >= 4;
  const s = String(c).toLowerCase();
  return s === "high" || s === "sure" || s === "5" || s === "4";
}

export function groupByTopic(entries: VivaEntry[]): Map<string, VivaEntry[]> {
  const map = new Map<string, VivaEntry[]>();
  for (const e of entries) {
    const list = map.get(e.topic) ?? [];
    list.push(e);
    map.set(e.topic, list);
  }
  return map;
}

export function summariseTopics(entries: VivaEntry[]): TopicSummary[] {
  return Array.from(groupByTopic(entries).entries())
    .map(([topic, list]) => {
      const last = list[list.length - 1];
      const highConfidenceMiss = list.some(
        (e) => isHighConfidence(e.confidence) && gradeKind(e.grade) === "missed",
      );
      const recent = list.slice(-3);
      const thin =
        highConfidenceMiss ||
        recent.filter((e) => gradeKind(e.grade) !== "understood").length >= 2;
      return {
        topic,
        entries: list,
        last,
        highConfidenceMiss,
        thin,
        nextSteps: nextStepsFor(topic, thin, highConfidenceMiss),
      };
    })
    .sort((a, b) => Number(b.thin) - Number(a.thin) || b.last.timestamp.localeCompare(a.last.timestamp));
}

function nextStepsFor(topic: string, thin: boolean, highConfidenceMiss: boolean): string[] {
  if (!thin) return ["Keep the habit: one more viva on the next change in this area."];
  const steps = [
    `Next change in “${topic}” by hand, or generate then make sure you could rewrite it.`,
    "Ask the agent why, not only to produce.",
  ];
  if (highConfidenceMiss) {
    steps.unshift("Confident and wrong — the strongest signal. Slow down and re-explain before the next edit.");
  }
  steps.push("Pair or do a short walkthrough with someone solid in the area.");
  return steps;
}

export const SAMPLE_LOG = `# Sample viva skill log (for trying the map)
2026-11-18 14:22 | 0.3.1 | adamsuk/example | pr-12 | abc1234 | webhook retry | 4 | understood | session | live
2026-11-19 09:10 | 0.3.1 | adamsuk/example | pr-18 | def5678 | idempotency key | 5 | missed | checkout | live
2026-11-19 16:40 | 0.3.1 | adamsuk/example | pr-18 | def5678 | idempotency key | 3 | partial | session | live
2026-11-20 11:05 | 0.3.1 | adamsuk/example | main | ghi9012 | skill logging path | 2 | understood | last-commit | live
`;
