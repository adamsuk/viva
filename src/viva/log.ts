// Version-aware parser for the personal log written by the viva skill.
// Schemas live in log-schemas.ts so the skill can fetch them from the platform.

import {
  AI_USE_VALUES,
  BOT_CLAIM_VALUES,
  LOG_SCHEMAS,
  schemaFor,
  type AiUse,
  type BotClaim,
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
  /** Whether a checked bot comment's claim held (schema 0.5+). `n/a` for other checks and older lines. */
  botClaim: BotClaim;
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
  /** The latest counted check was partial or missed, a week or more ago: time to try again. */
  recheck: boolean;
  nextSteps: string[];
  /** The same steps, each with the guide recommendation behind it. */
  steps: NextStep[];
}

export interface ParsedLog {
  entries: VivaEntry[];
  /** Lines that could not be read as a check (too few fields). */
  skipped: number;
  /** Lines whose version matched no schema; read with the oldest schema. */
  unknownVersion: number;
  /** Checks whose earlier line was replaced by a later correction (for example a dispute). */
  superseded: number;
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
  // The skill never rewrites a line. When a dispute stands, or a bot verdict is re-checked, it
  // appends the same check again with the new grade; the later line wins.
  const latest = new Map<string, VivaEntry>();
  const versions = new Map<string, Set<string>>();
  for (const e of entries) {
    const key = checkKey(e);
    latest.set(key, e);
    versions.set(key, (versions.get(key) ?? new Set()).add(e.raw));
  }
  // Checks with more than one distinct line were corrected; an exact repeat is not a correction.
  const superseded = Array.from(versions.values()).filter((v) => v.size > 1).length;
  const kept = Array.from(latest.values());
  kept.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return { entries: kept, skipped, unknownVersion, superseded };
}

/** One check: when, where, on what, and in which scope. A later line with the same key is a correction. */
function checkKey(e: VivaEntry): string {
  return [e.timestamp, e.repo, e.branchOrPr, e.commitOrRef, topicKey(e.topic), e.scope]
    .map((f) => f.trim())
    .join("\u0000");
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
    // Only a review-comment check has a bot claim; anything else in that field reads as n/a.
    botClaim:
      get("scope").toLowerCase() === "review-comment" ? readBotClaim(get("botClaim")) : "n/a",
    raw: line,
    schemaVersion: schema.version,
  };
}

function readAiUse(value: string): AiUse {
  const v = value.trim().toLowerCase();
  return (AI_USE_VALUES as readonly string[]).includes(v) ? (v as AiUse) : "unknown";
}

function readBotClaim(value: string): BotClaim {
  const v = value.trim().toLowerCase();
  return (BOT_CLAIM_VALUES as readonly string[]).includes(v) ? (v as BotClaim) : "n/a";
}

export interface BotClaimCounts {
  held: number;
  partly: number;
  wrong: number;
  total: number;
}

/** How the bot comments you checked fared: review-comment checks that record a verdict. */
export function botClaims(entries: VivaEntry[]): BotClaimCounts {
  const counts: BotClaimCounts = { held: 0, partly: 0, wrong: 0, total: 0 };
  for (const e of entries) {
    if (e.scope.trim().toLowerCase() !== "review-comment" || e.botClaim === "n/a") continue;
    if (gradeKind(e.grade) === "disputed") continue;
    counts[e.botClaim]++;
    counts.total++;
  }
  return counts;
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

function range(dates: string[]): string {
  if (!dates.length) return "";
  const [first, last] = [dates[0], dates[dates.length - 1]];
  return first === last ? `, ${first}` : `, ${first} to ${last}`;
}

/**
 * A short markdown summary of the counted checks, for pasting into an experiment log. Counts only:
 * no repository, branch, commit or topic names, so it is safe to share.
 */
export function summaryMarkdown(entries: VivaEntry[]): string {
  const counted = entries.filter((e) => {
    const k = gradeKind(e.grade);
    return k === "understood" || k === "partial" || k === "missed";
  });
  if (!counted.length) return "No counted checks yet.";
  // Only well-formed dates reach the summary: the timestamp field is free text in a hand-edited log.
  const dates = counted
    .map((e) => /^\d{4}-\d{2}-\d{2}/.exec(e.timestamp.trim())?.[0])
    .filter((d): d is string => d !== undefined && weekOf(d) !== null)
    .sort();
  const n = (k: GradeKind) => counted.filter((e) => gradeKind(e.grade) === k).length;
  const disputed = entries.filter((e) => gradeKind(e.grade) === "disputed").length;
  const topics = new Set(counted.map((e) => topicKey(e.topic))).size;
  const lines = [
    `Viva summary${range(dates)}: ${counted.length} check${counted.length === 1 ? "" : "s"} across ${topics} topic${topics === 1 ? "" : "s"}.`,
    `Understood ${n("understood")}, partial ${n("partial")}, missed ${n("missed")}${disputed ? `; ${disputed} disputed, left out` : ""}.`,
  ];
  const bands = calibration(counted).filter((r) => r.total > 0);
  if (bands.length) {
    lines.push(
      "",
      "| Confidence | Understood | Partial | Missed |",
      "|---|---|---|---|",
      ...bands.map((r) => `| ${r.bucket} | ${r.understood} | ${r.partial} | ${r.missed} |`),
    );
  }
  const aiRows = byAiUse(counted);
  if (aiRows.some((r) => r.aiUse !== "unknown")) {
    lines.push(
      "",
      "| How the change was made | Understood | Partial | Missed |",
      "|---|---|---|---|",
      ...aiRows.map((r) => `| ${r.aiUse} | ${r.understood} | ${r.partial} | ${r.missed} |`),
    );
  }
  return lines.join("\n");
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

export const RECHECK_AFTER_DAYS = 7;

function checkTime(timestamp: string): number {
  return Date.parse(`${timestamp.trim().replace(" ", "T")}:00`);
}

/**
 * True when the latest non-disputed check on a topic was partial or missed and is at least
 * RECHECK_AFTER_DAYS old at `now`. Practice tests improve later recall, so a missed area is worth
 * a second try rather than being flagged once and left.
 */
export function needsRecheck(counted: VivaEntry[], now: Date): boolean {
  const latest = counted[counted.length - 1];
  if (!latest) return false;
  const kind = gradeKind(latest.grade);
  if (kind !== "partial" && kind !== "missed") return false;
  const at = checkTime(latest.timestamp);
  if (!Number.isFinite(at)) return false;
  return now.getTime() - at >= RECHECK_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export interface WeekRow {
  /** Monday of the week, YYYY-MM-DD. */
  week: string;
  checks: number;
  understood: number;
}

/** Monday (YYYY-MM-DD) of the week a log timestamp falls in, or null if its date is unreadable. */
export function weekOf(timestamp: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(timestamp.trim());
  if (!m) return null;
  const day = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (day.getUTCMonth() !== Number(m[2]) - 1) return null;
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}

function counted(entries: VivaEntry[]): VivaEntry[] {
  return entries.filter((e) => {
    const k = gradeKind(e.grade);
    return k === "understood" || k === "partial" || k === "missed";
  });
}

/** Checks and understood per week, oldest first, for the latest `limit` weeks that have checks. */
export function byWeek(entries: VivaEntry[], limit = 8): WeekRow[] {
  const rows = new Map<string, WeekRow>();
  for (const e of counted(entries)) {
    const week = weekOf(e.timestamp);
    if (!week) continue;
    const row = rows.get(week) ?? { week, checks: 0, understood: 0 };
    row.checks++;
    if (gradeKind(e.grade) === "understood") row.understood++;
    rows.set(week, row);
  }
  return Array.from(rows.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-limit);
}

export const DRIFT_MIN_CHECKS = 10;
export const DRIFT_RECENT = 5;
const DRIFT_POINTS = 20;

const pct = (rate: number) => Math.round(100 * rate);

/**
 * One note when the latest DRIFT_RECENT counted checks moved the wrong way against the earlier
 * ones: understood rate down, or delegated/agent share up, by DRIFT_POINTS or more (compared
 * unrounded; only the message rounds). Null otherwise, and below DRIFT_MIN_CHECKS. Lines with an
 * impossible date (2026-02-30) are left out, as in byWeek. Five checks is a small sample, so the
 * note is a nudge.
 */
export function driftNote(entries: VivaEntry[]): string | null {
  const dated = counted(entries)
    .map((e, i) => ({ e, i, at: checkTime(e.timestamp) }))
    .filter((x) => Number.isFinite(x.at) && weekOf(x.e.timestamp) !== null)
    .sort((a, b) => a.at - b.at || a.i - b.i)
    .map((x) => x.e);
  if (dated.length < DRIFT_MIN_CHECKS) return null;
  const recent = dated.slice(-DRIFT_RECENT);
  const earlier = dated.slice(0, -DRIFT_RECENT);
  const count = (l: VivaEntry[], f: (e: VivaEntry) => boolean) => l.filter(f).length;
  // Compare rates by cross-multiplying whole counts, so an exact 20-point change (3/5 to 2/5)
  // is not lost to floating-point error.
  // True when hi/hiOf - lo/loOf >= DRIFT_POINTS%.
  const aheadBy = (hi: number, hiOf: number, lo: number, loOf: number) =>
    100 * (hi * loOf - lo * hiOf) >= DRIFT_POINTS * hiOf * loOf;
  const understood = (e: VivaEntry) => gradeKind(e.grade) === "understood";
  const handedOff = (e: VivaEntry) => e.aiUse === "delegated" || e.aiUse === "agent";
  const [uNow, uBefore] = [count(recent, understood), count(earlier, understood)];
  if (aheadBy(uBefore, earlier.length, uNow, recent.length))
    return `Your last ${DRIFT_RECENT} checks were understood ${pct(uNow / recent.length)}% of the time, against ${pct(uBefore / earlier.length)}% before. A small sample, but worth slowing down on the next change.`;
  const [hNow, hBefore] = [count(recent, handedOff), count(earlier, handedOff)];
  if (aheadBy(hNow, recent.length, hBefore, earlier.length))
    return `${pct(hNow / recent.length)}% of your last ${DRIFT_RECENT} changes were delegated or built by an agent, against ${pct(hBefore / earlier.length)}% before. Asking the agent why keeps the understanding with you.`;
  return null;
}

export function summariseTopics(entries: VivaEntry[], now?: Date): TopicSummary[] {
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
        recheck: now ? needsRecheck(counted, now) : false,
        steps: nextStepsFor(topic, thin, highConfidenceMiss),
        nextSteps: nextStepsFor(topic, thin, highConfidenceMiss).map((s) => s.text),
      };
    })
    .sort(
      (a, b) => Number(b.thin) - Number(a.thin) || b.last.timestamp.localeCompare(a.last.timestamp),
    );
}

/** A next step and the guide recommendation it comes from (an id in RECOMMENDATIONS). */
export interface NextStep {
  text: string;
  recommendationId: string;
}

export function nextStepsFor(
  topic: string,
  thin: boolean,
  highConfidenceMiss: boolean,
): NextStep[] {
  if (!thin)
    return [
      {
        text: "Keep the habit: one more viva on the next change in this area.",
        recommendationId: "one-small-question",
      },
    ];
  const steps: NextStep[] = [
    {
      text: `Next change in “${topic}” by hand, or generate then make sure you could rewrite it.`,
      recommendationId: "keep-learning-work",
    },
    { text: "Ask the agent why, not only to produce.", recommendationId: "use-ai-to-understand" },
  ];
  if (highConfidenceMiss) {
    steps.unshift({
      text: "Confident and wrong — the strongest signal. Slow down and re-explain before the next edit.",
      recommendationId: "ask-confidence",
    });
  }
  steps.push({
    text: "Pair or do a short walkthrough with someone solid in the area.",
    recommendationId: "gaps-to-pairing",
  });
  return steps;
}

/**
 * One habit for when nothing is thin: keep checking, and now and then write a change by hand in
 * the area checked least (fewest checks, then the oldest). Null with no topics.
 */
export function habitFor(topics: TopicSummary[]): NextStep | null {
  if (!topics.length || topics.some((t) => t.thin)) return null;
  const least = [...topics].sort(
    (a, b) =>
      a.entries.length - b.entries.length || a.last.timestamp.localeCompare(b.last.timestamp),
  )[0];
  return {
    text: `Keep the habit: run a viva on your next AI-assisted change. Once in a while, write a change in “${least.topic}” by hand. It is the area you have checked least.`,
    recommendationId: "keep-learning-work",
  };
}

/** localStorage key for the personal map's lines. They never leave this browser. */
export const LOG_STORAGE_KEY = "viva:personal-map:log";

/**
 * Merge new log text into what is already kept. Blank and comment lines are dropped, identical
 * lines (after trimming) are kept once, and the existing order comes first. Unparseable lines are
 * kept so a newer skill's lines survive until the platform learns their schema.
 */
export function mergeLogs(existing: string, incoming: string): string {
  // A multiset merge: keep every existing line, and add an incoming line only when the paste holds
  // it more times than the existing log does. Re-pasting the same log adds nothing, while a
  // correction that reverts to an earlier line (held, then wrong, then held) keeps all three.
  const clean = (text: string) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  const out = clean(existing);
  const have = new Map<string, number>();
  for (const line of out) have.set(line, (have.get(line) ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const line of clean(incoming)) {
    const n = (seen.get(line) ?? 0) + 1;
    seen.set(line, n);
    if (n > (have.get(line) ?? 0)) out.push(line);
  }
  return out.length ? `${out.join("\n")}\n` : "";
}

export const SAMPLE_LOG = `# Sample viva skill log (for trying the map)
2026-11-03 10:15 | 0.4.1 | adamsuk/example | pr-4 | aa11bb2 | cache invalidation | 4 | understood | session | live | hand
2026-11-04 15:30 | 0.4.1 | adamsuk/example | pr-5 | bb22cc3 | webhook retry | 3 | partial | session | live | delegated
2026-11-06 09:45 | 0.5.0 | adamsuk/example | pr-5 | bb22cc3 | retry backoff claim | 4 | understood | review-comment | live | unknown | wrong
2026-11-10 13:20 | 0.5.0 | adamsuk/example | pr-7 | cc33dd4 | cache invalidation | 2 | understood | checkout | live | explained | n/a
2026-11-11 17:05 | 0.5.0 | adamsuk/example | pr-8 | dd44ee5 | null handling claim | 3 | partial | review-comment | live | unknown | held
2026-11-13 11:50 | 0.5.0 | adamsuk/example | pr-9 | ee55ff6 | auth middleware | 4 | understood | review | live | agent | n/a
2026-11-18 14:22 | 0.3.1 | adamsuk/example | pr-12 | abc1234 | webhook retry | 4 | understood | session | live
2026-11-19 09:10 | 0.3.1 | adamsuk/example | pr-18 | def5678 | idempotency key | 5 | missed | checkout | live
2026-11-19 16:40 | 0.3.1 | adamsuk/example | pr-18 | def5678 | idempotency key | 3 | partial | session | live
2026-11-20 11:05 | 0.3.1 | adamsuk/example | main | ghi9012 | skill logging path | 2 | understood | last-commit | live
`;
