// Parser for the personal log written by the viva skill.
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

export function parseVivaLog(text: string): VivaEntry[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map(parseLine)
    .filter((e): e is VivaEntry => e !== null);
}

function parseLine(line: string): VivaEntry | null {
  const parts = line.split(" | ").map((p) => p.trim());
  if (parts.length < 10) return null;
  const [timestamp, skillVersion, repo, branchOrPr, commitOrRef, topic, confidenceRaw, grade, scope, live] = parts;
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

export function groupByTopic(entries: VivaEntry[]): Map<string, VivaEntry[]> {
  const map = new Map<string, VivaEntry[]>();
  for (const e of entries) {
    const list = map.get(e.topic) ?? [];
    list.push(e);
    map.set(e.topic, list);
  }
  return map;
}
