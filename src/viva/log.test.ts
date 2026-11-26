import { test } from "node:test";
import assert from "node:assert/strict";
import {
  botClaims,
  botTrend,
  hasBotTrend,
  byAiUse,
  byWeek,
  driftNote,
  weekOf,
  calibration,
  calibrationSentence,
  confidenceBucket,
  gradeKind,
  habitFor,
  mergeLogs,
  nextStepsFor,
  parseVivaLog,
  parseVivaLogDetailed,
  summariseTopics,
  summaryMarkdown,
  byStyle,
  byRisk,
  SAMPLE_LOG,
} from "./log.ts";

const tally = ({ byBot: _byBot, ...totals }: ReturnType<typeof botClaims>) => totals;

test("parses the skill log format", () => {
  const entries = parseVivaLog(SAMPLE_LOG);
  assert.equal(entries.length, 10);
  const miss = entries.find((e) => e.timestamp === "2026-10-28 09:10");
  assert.equal(miss?.topic, "idempotency key");
  assert.equal(miss?.confidence, 5);
  assert.equal(miss?.grade, "missed");
});

test("flags confident-wrong and suggests next steps", () => {
  const topics = summariseTopics(parseVivaLog(SAMPLE_LOG));
  const thin = topics.find((t) => t.topic === "idempotency key");
  assert.ok(thin);
  assert.equal(thin?.thin, true);
  assert.equal(thin?.highConfidenceMiss, true);
  assert.ok(thin?.nextSteps.some((s) => /Confident and wrong/.test(s)));
});

test("recognizes only exact passing grade tokens", () => {
  for (const grade of [" Understood ", "OK", "pass"]) assert.equal(gradeKind(grade), "understood");
  assert.equal(gradeKind("mostly understood"), "other");
  assert.equal(gradeKind("partially understood"), "partial");
});

test("negated understanding counts as a confident miss", () => {
  for (const grade of [
    "not understood",
    "not-yet-understood",
    "wasn’t fully understood",
    "never understood",
  ]) {
    const log = `2026-11-21 10:00 | 0.3.1 | adamsuk/example | main | abc1234 | webhook retry | 5 | ${grade} | session | live`;
    const [topic] = summariseTopics(parseVivaLog(log));
    assert.equal(topic.highConfidenceMiss, true, grade);
    assert.equal(topic.thin, true, grade);
  }
});

test("merging logs keeps existing lines first and drops duplicates and comments", () => {
  const a =
    "# header\n2026-11-18 14:22 | 0.3.1 | r | main | a | t1 | 4 | understood | session | live\n";
  const b =
    "2026-11-18 14:22 | 0.3.1 | r | main | a | t1 | 4 | understood | session | live  \n\n# note\n" +
    "2026-11-19 09:10 | 0.3.1 | r | main | b | t2 | 2 | partial | session | live";
  const merged = mergeLogs(a, b);
  assert.equal(
    merged,
    "2026-11-18 14:22 | 0.3.1 | r | main | a | t1 | 4 | understood | session | live\n" +
      "2026-11-19 09:10 | 0.3.1 | r | main | b | t2 | 2 | partial | session | live\n",
  );
  assert.equal(parseVivaLog(merged).length, 2);
  assert.equal(mergeLogs(merged, merged), merged);
});

test("merging nothing gives an empty log", () => {
  assert.equal(mergeLogs("", "\n# only a comment\n"), "");
});

test("a skill version in a covered range uses that schema", async () => {
  const { schemaFor } = await import("./log-schemas.ts");
  assert.equal(schemaFor("0.3.3")?.version, "0.3.1");
  assert.equal(schemaFor("0.3.1")?.version, "0.3.1");
  assert.equal(schemaFor("0.30.1"), undefined);
  assert.equal(schemaFor("9.9.9"), undefined);
});

test("the detailed parse counts skipped lines and unknown versions", () => {
  const log = [
    "2026-11-21 10:00 | 0.3.3 | r | main | a | t | 4 | understood | session | live",
    "2026-11-21 11:00 | 9.0.0 | r | main | a | t | 4 | understood | session | live",
    "2026-11-21 12:00 | 0.3.3 | too | short",
    "not a log line",
  ].join("\n");
  const parsed = parseVivaLogDetailed(log);
  assert.equal(parsed.entries.length, 2);
  assert.equal(parsed.skipped, 2);
  assert.equal(parsed.unknownVersion, 1);
});

test("topics differing only in case or spacing are one topic", () => {
  const log = [
    "2026-11-21 10:00 | 0.3.3 | r | main | a | Webhook retry | 4 | partial | session | live",
    "2026-11-22 10:00 | 0.3.3 | r | main | a |  webhook  retry | 4 | missed | session | live",
  ].join("\n");
  const topics = summariseTopics(parseVivaLog(log));
  assert.equal(topics.length, 1);
  assert.equal(topics[0].topic, "webhook retry");
  assert.equal(topics[0].entries.length, 2);
  assert.equal(topics[0].thin, true);
});

test("disputed checks are not a gap and not confident-wrong", () => {
  assert.equal(gradeKind("disputed"), "disputed");
  assert.equal(gradeKind(" Disputed "), "disputed");
  const log = [
    "2026-11-21 10:00 | 0.3.3 | r | main | a | cache | 5 | disputed | session | live",
    "2026-11-21 11:00 | 0.3.3 | r | main | a | cache | 4 | disputed | session | live",
    "2026-11-21 12:00 | 0.3.3 | r | main | a | cache | 3 | understood | session | live",
  ].join("\n");
  const [topic] = summariseTopics(parseVivaLog(log));
  assert.equal(topic.thin, false);
  assert.equal(topic.highConfidenceMiss, false);
  assert.equal(topic.entries.length, 3);
});

test("confidence buckets read numbers and words", () => {
  assert.equal(confidenceBucket(1), "low");
  assert.equal(confidenceBucket(3), "mid");
  assert.equal(confidenceBucket(5), "high");
  assert.equal(confidenceBucket("4"), "high");
  assert.equal(confidenceBucket("Medium"), "mid");
  assert.equal(confidenceBucket("low"), "low");
  assert.equal(confidenceBucket("sure"), "high");
  assert.equal(confidenceBucket(9), null);
  assert.equal(confidenceBucket("maybe"), null);
  assert.equal(confidenceBucket(""), null);
});

test("calibration counts confidence against grade, without disputed or unreadable grades", () => {
  const log = [
    "2026-11-21 10:00 | 0.3.3 | r | main | a | t1 | 5 | understood | session | live",
    "2026-11-21 10:01 | 0.3.3 | r | main | a | t2 | high | missed | session | live",
    "2026-11-21 10:02 | 0.3.3 | r | main | a | t3 | 4 | partial | session | live",
    "2026-11-21 10:03 | 0.3.3 | r | main | a | t4 | 2 | understood | session | live",
    "2026-11-21 10:04 | 0.3.3 | r | main | a | t5 | 5 | disputed | session | live",
    "2026-11-21 10:05 | 0.3.3 | r | main | a | t6 | 5 | mostly understood | session | live",
    "2026-11-21 10:06 | 0.3.3 | r | main | a | t7 | ? | missed | session | live",
  ].join("\n");
  const rows = calibration(parseVivaLog(log));
  assert.deepEqual(rows, [
    { bucket: "high", understood: 1, partial: 1, missed: 1, total: 3 },
    { bucket: "mid", understood: 0, partial: 0, missed: 0, total: 0 },
    { bucket: "low", understood: 1, partial: 0, missed: 0, total: 1 },
  ]);
  assert.equal(
    calibrationSentence(rows),
    "When you were sure, you understood 1 of 3 times. 1 confident miss is the strongest signal to slow down.",
  );
  assert.equal(calibrationSentence(calibration([])), null);
});

test("schema 0.4 adds how the change was made, and 0.3 lines still parse", async () => {
  const { CURRENT_LOG_SCHEMA, schemaFor } = await import("./log-schemas.ts");
  assert.equal(CURRENT_LOG_SCHEMA.version, "0.7.0");
  assert.equal(schemaFor("0.4.2")?.version, "0.4.0");
  assert.equal(schemaFor("0.3.3")?.version, "0.3.1");
  const log = [
    "2026-11-21 10:00 | 0.3.3 | r | main | a | t1 | 4 | understood | session | live",
    "2026-11-21 11:00 | 0.4.0 | r | main | a | t2 | 4 | missed | session | live | delegated",
    "2026-11-21 12:00 | 0.4.0 | r | main | a | t3 | 2 | understood | session | live | Hand",
    "2026-11-21 13:00 | 0.4.0 | r | main | a | t4 | 3 | partial | session | live | vibes",
  ].join("\n");
  const entries = parseVivaLog(log);
  assert.deepEqual(
    entries.map((e) => e.aiUse),
    ["unknown", "delegated", "hand", "unknown"],
  );
  assert.deepEqual(byAiUse(entries), [
    { aiUse: "hand", understood: 1, partial: 0, missed: 0, total: 1 },
    { aiUse: "delegated", understood: 0, partial: 0, missed: 1, total: 1 },
    { aiUse: "unknown", understood: 1, partial: 1, missed: 0, total: 2 },
  ]);
});

test("every next step and the habit name a recommendation in the guide", async () => {
  const { RECOMMENDATIONS } = await import("./model.ts");
  const ids = new Set(RECOMMENDATIONS.map((r) => r.id));
  const steps = [
    ...nextStepsFor("t", true, true),
    ...nextStepsFor("t", true, false),
    ...nextStepsFor("t", false, false),
  ];
  for (const s of steps) assert.ok(ids.has(s.recommendationId), s.recommendationId);
  const solid = summariseTopics(
    parseVivaLog(
      [
        "2026-11-21 10:00 | 0.3.3 | r | main | a | cache | 4 | understood | session | live",
        "2026-11-22 10:00 | 0.3.3 | r | main | a | cache | 4 | understood | session | live",
        "2026-11-20 10:00 | 0.3.3 | r | main | a | auth | 3 | understood | session | live",
      ].join("\n"),
    ),
  );
  const habit = habitFor(solid);
  assert.ok(habit && ids.has(habit.recommendationId));
  assert.match(habit!.text, /“auth”/);
  assert.equal(habitFor(summariseTopics(parseVivaLog(SAMPLE_LOG))), null);
  assert.equal(habitFor([]), null);
});

test("a missed topic is due a re-check after seven days, not before", () => {
  const line = (ts: string, grade: string) =>
    `${ts} | 0.3.3 | r | main | a | cache | 3 | ${grade} | session | live`;
  const at = (log: string, now: string) =>
    summariseTopics(parseVivaLog(log), new Date(Date.parse(now)))[0].recheck;
  const missed = line("2026-11-10 09:00", "missed");
  assert.equal(at(missed, "2026-11-16T09:00:00"), false);
  assert.equal(at(missed, "2026-11-17T09:00:00"), true);
  assert.equal(at(line("2026-11-10 09:00", "partial"), "2026-11-20T09:00:00"), true);
  assert.equal(
    at(`${missed}\n${line("2026-11-11 09:00", "understood")}`, "2026-11-30T09:00:00"),
    false,
  );
  assert.equal(
    at(`${missed}\n${line("2026-11-11 09:00", "disputed")}`, "2026-11-30T09:00:00"),
    true,
  );
  assert.equal(summariseTopics(parseVivaLog(missed))[0].recheck, false);
});

test("schema 0.5.0 reads botClaim; older lines and other values read as n/a", async () => {
  const { schemaFor } = await import("./log-schemas.ts");
  assert.equal(schemaFor("0.5.0")?.version, "0.5.0");
  assert.equal(schemaFor("0.5.3")?.version, "0.5.0");
  assert.equal(schemaFor("0.4.4")?.version, "0.4.0");
  const log = [
    "2026-11-21 10:00 | 0.5.0 | r | pr-1 | a | retry claim | 4 | understood | review-comment | live | unknown | wrong",
    "2026-11-21 11:00 | 0.5.0 | r | pr-1 | a | cache claim | 3 | partial | review-comment | live | unknown | Held",
    "2026-11-21 12:00 | 0.5.0 | r | pr-1 | a | lock claim | 2 | missed | review-comment | live | unknown | partly",
    "2026-11-21 13:00 | 0.5.0 | r | pr-1 | a | own change | 4 | understood | session | live | hand | n/a",
    "2026-11-21 14:00 | 0.5.0 | r | pr-1 | a | odd claim | 4 | understood | review-comment | live | unknown | maybe",
    "2026-11-21 15:00 | 0.5.0 | r | pr-1 | a | bad question | 4 | disputed | review-comment | live | unknown | wrong",
    "2026-11-21 16:00 | 0.4.2 | r | pr-1 | a | old claim | 4 | understood | review-comment | live | unknown",
    "2026-11-21 17:00 | 0.5.0 | r | pr-1 | a | stray verdict | 4 | understood | session | live | hand | wrong",
  ].join("\n");
  const entries = parseVivaLog(log);
  assert.deepEqual(
    entries.map((e) => e.botClaim),
    ["wrong", "held", "partly", "n/a", "n/a", "wrong", "n/a", "n/a"],
  );
  assert.deepEqual(tally(botClaims(entries)), { held: 1, partly: 1, wrong: 1, total: 3 });
  assert.deepEqual(tally(botClaims([])), { held: 0, partly: 0, wrong: 0, total: 0 });
});

test("summaryMarkdown gives counts only, leaving out disputed checks", () => {
  const log = [
    "2026-11-02 10:00 | 0.4.3 | secret/repo | pr-9 | abc | Webhook retry | 5 | understood | session | live | hand",
    "2026-11-01 10:00 | 0.4.3 | secret/repo | pr-9 | abc | webhook  retry | 2 | missed | session | live | delegated",
    "2026-11-03 10:00 | 0.4.3 | secret/repo | pr-9 | abc | cache key | 3 | partial | session | live | agent",
    "2026-11-04 10:00 | 0.4.3 | secret/repo | pr-9 | abc | cache key | 5 | disputed | session | live | hand",
  ].join("\n");
  const md = summaryMarkdown(parseVivaLog(log));
  assert.match(md, /2026-11-01 to 2026-11-03: 3 checks across 2 topics\./);
  assert.match(md, /Understood 1, partial 1, missed 1; 1 disputed, left out\./);
  assert.match(md, /\| high \| 1 \| 0 \| 0 \|/);
  assert.match(md, /\| low \| 0 \| 0 \| 1 \|/);
  assert.match(md, /\| delegated \| 0 \| 0 \| 1 \|/);
  for (const secret of ["secret/repo", "pr-9", "abc", "ebhook", "cache key"])
    assert.ok(!md.includes(secret), `leaked ${secret}`);
});

test("summaryMarkdown handles an empty log and logs with no ai-use", () => {
  assert.equal(summaryMarkdown([]), "No counted checks yet.");
  const old = "2026-11-01 10:00 | 0.3.3 | o/r | pr-1 | abc | t | 4 | understood | session | live";
  const md = summaryMarkdown(parseVivaLog(old));
  assert.match(md, /: 1 check across 1 topic\./);
  assert.ok(!md.includes("How the change was made"));
});

const line = (date: string, grade: string, aiUse = "hand", conf = 4) =>
  `${date} 10:00 | 0.4.3 | o/r | pr-1 | abc | t | ${conf} | ${grade} | session | live | ${aiUse}`;

test("weekOf gives the Monday of the week, and null for unreadable dates", () => {
  assert.equal(weekOf("2026-11-23 09:00"), "2026-11-23"); // a Monday
  assert.equal(weekOf("2026-11-29 23:59"), "2026-11-23"); // the Sunday after
  assert.equal(weekOf("2026-11-30 00:00"), "2026-11-30");
  assert.equal(weekOf("2027-01-01 12:00"), "2026-12-28"); // across a year boundary
  assert.equal(weekOf("yesterday"), null);
  assert.equal(weekOf("2026-02-30 10:00"), null);
});

test("byWeek counts checks and understood per week, leaving out disputed and unreadable dates", () => {
  const log = [
    line("2026-11-17", "understood"),
    line("2026-11-23", "missed"),
    line("2026-11-24", "understood"),
    line("2026-11-25", "disputed"),
    "someday 10:00 | 0.4.3 | o/r | pr-1 | abc | t | 4 | understood | session | live | hand",
  ].join("\n");
  assert.deepEqual(byWeek(parseVivaLog(log)), [
    { week: "2026-11-16", checks: 1, understood: 1 },
    { week: "2026-11-23", checks: 2, understood: 1 },
  ]);
});

test("byWeek keeps only the latest weeks", () => {
  const log = Array.from({ length: 10 }, (_, i) =>
    line(
      `2026-0${Math.floor(i / 4) + 1}-${String((i % 4) * 7 + 1).padStart(2, "0")}`,
      "understood",
    ),
  ).join("\n");
  const rows = byWeek(parseVivaLog(log), 3);
  assert.equal(rows.length, 3);
  assert.ok(rows[0].week < rows[2].week);
});

const days = (
  n: number,
  grade: (i: number) => string,
  aiUse: (i: number) => string = () => "hand",
) =>
  Array.from({ length: n }, (_, i) =>
    line(`2026-10-${String(i + 1).padStart(2, "0")}`, grade(i), aiUse(i)),
  ).join("\n");

test("driftNote stays quiet below ten checks and when nothing moved", () => {
  assert.equal(driftNote(parseVivaLog(days(9, (i) => (i < 4 ? "understood" : "missed")))), null);
  assert.equal(driftNote(parseVivaLog(days(12, () => "understood"))), null);
});

test("driftNote flags a drop in understood across the latest five", () => {
  const note = driftNote(
    parseVivaLog(days(12, (i) => (i < 7 ? "understood" : i < 9 ? "missed" : "understood"))),
  );
  assert.match(note ?? "", /understood 60% of the time, against 100% before/);
});

test("driftNote flags a rise in delegated or agent-built changes", () => {
  const note = driftNote(
    parseVivaLog(
      days(
        12,
        () => "understood",
        (i) => (i < 7 ? "hand" : i % 2 ? "agent" : "delegated"),
      ),
    ),
  );
  assert.match(
    note ?? "",
    /100% of your recent recorded changes were delegated or built by an agent, against 0% before/,
  );
});

test("driftNote orders by time, not by line, and ignores disputed checks", () => {
  const lines = days(12, (i) => (i < 7 ? "understood" : "missed"))
    .split("\n")
    .reverse();
  lines.push(line("2026-10-30", "disputed"));
  assert.match(driftNote(parseVivaLog(lines.join("\n"))) ?? "", /understood 0% of the time/);
});

const seq = (
  n: number,
  grade: (i: number) => string,
  aiUse: (i: number) => string = () => "hand",
) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    return line(d, grade(i), aiUse(i));
  }).join("\n");

test("driftNote compares unrounded rates: just under 20 points is quiet, exactly 20 fires", () => {
  // 8 of 41 earlier understood (19.5%), none of the latest 5: a 19.5-point drop.
  assert.equal(driftNote(parseVivaLog(seq(46, (i) => (i < 8 ? "understood" : "missed")))), null);
  // 33 of 41 earlier delegated (80.5%), all 5 recent: a 19.5-point rise.
  assert.equal(
    driftNote(
      parseVivaLog(
        seq(
          46,
          () => "understood",
          (i) => (i < 33 || i >= 41 ? "delegated" : "hand"),
        ),
      ),
    ),
    null,
  );
  // 2 of 5 earlier understood (40%), 1 of 5 recent (20%): exactly 20 points.
  assert.match(
    driftNote(parseVivaLog(seq(10, (i) => (i < 2 || i === 5 ? "understood" : "missed")))) ?? "",
    /understood 20% of the time, against 40% before/,
  );
});

test("driftNote leaves out impossible dates, as byWeek does", () => {
  const nine = Array.from({ length: 9 }, (_, i) => line(`2026-02-${20 + i}`, "understood")).join(
    "\n",
  );
  assert.equal(driftNote(parseVivaLog(`${nine}\n${line("2026-02-30", "missed")}`)), null);
});

test("driftNote fires on an exact 20-point change that floating point would miss", () => {
  // 3 of 5 earlier understood, 2 of 5 recent: 0.6 - 0.4 is 0.19999999999999996 in floating point.
  assert.match(
    driftNote(
      parseVivaLog(seq(10, (i) => (i < 3 || (i >= 5 && i < 7) ? "understood" : "missed"))),
    ) ?? "",
    /understood 40% of the time, against 60% before/,
  );
  // 4 of 5 earlier delegated, 5 of 5 recent: 1.0 - 0.8 is 0.19999999999999996 too.
  assert.match(
    driftNote(
      parseVivaLog(
        seq(
          10,
          () => "understood",
          (i) => (i === 4 ? "hand" : "delegated"),
        ),
      ),
    ) ?? "",
    /100% of your recent recorded changes were delegated or built by an agent, against 80% before/,
  );
});

test("summaryMarkdown never shows a timestamp that isn't a date, and skips empty tables", () => {
  const log = [
    "2026-11-02 10:00 | 0.4.3 | o/r | pr-1 | abc | t | 4 | understood | session | live | hand",
    "acme-payments-secret 10:00 | 0.4.3 | o/r | pr-1 | abc | t | 4 | understood | session | live | hand",
    "2026-02-30 10:00 | 0.4.3 | o/r | pr-1 | abc | t | 4 | understood | session | live | hand",
  ].join("\n");
  const md = summaryMarkdown(parseVivaLog(log));
  assert.ok(!md.includes("acme"), md);
  assert.ok(!md.includes("2026-02-30"), md);
  assert.match(md, /^Viva summary, 2026-11-02: 3 checks across 1 topic\./);
  const undated =
    "yesterday | 0.4.3 | o/r | pr-1 | abc | t | ? | understood | session | live | unknown";
  const md2 = summaryMarkdown(parseVivaLog(undated));
  assert.match(md2, /^Viva summary: 1 check across 1 topic\./);
  assert.ok(!md2.includes("| Confidence |"), md2);
});

test("the sample shows every section of the map", () => {
  const { entries, skipped, unknownVersion } = parseVivaLogDetailed(SAMPLE_LOG);
  assert.equal(skipped, 0);
  assert.equal(unknownVersion, 0);
  assert.ok(byWeek(entries).length >= 2, "Over time needs two weeks");
  assert.ok(
    byAiUse(entries).some((r) => r.aiUse !== "unknown"),
    "how the change was made",
  );
  assert.deepEqual(tally(botClaims(entries)), { held: 1, partly: 0, wrong: 1, total: 2 });
  assert.ok(calibration(entries).some((r) => r.total > 0));
  assert.ok(
    entries.some((e) => e.scope === "review"),
    "a review-scope check",
  );
  assert.equal(botClaims(entries).byBot.length, 2, "two bots");
  const versions = entries.map((e) => e.skillVersion);
  assert.deepEqual(versions, [...versions].sort(), "skill versions rise with the dates");
  assert.equal(driftNote(entries), null, "no drift note on the sample");
});

test("a later line for the same check supersedes the earlier one", () => {
  const log = [
    "2026-11-21 10:00 | 0.5.0 | r | pr-1 | a | retry | 5 | missed | session | live | hand | n/a",
    "2026-11-21 10:00 | 0.5.0 | r | pr-2 | b | claim | 4 | understood | review-comment | live | unknown | held",
    "2026-11-21 10:00 | 0.5.0 | r | pr-1 | a | Retry  | 5 | disputed | session | live | hand | n/a",
    "2026-11-21 10:00 | 0.5.0 | r | pr-2 | b | claim | 4 | understood | review-comment | live | unknown | wrong",
    "2026-11-21 10:00 | 0.5.0 | r | pr-3 | c | retry | 3 | partial | session | live | hand | n/a",
  ].join("\n");
  const { entries, superseded } = parseVivaLogDetailed(log);
  assert.equal(superseded, 2);
  assert.deepEqual(
    entries.map((e) => [e.branchOrPr, e.grade, e.botClaim]),
    [
      ["pr-1", "disputed", "n/a"],
      ["pr-2", "understood", "wrong"],
      ["pr-3", "partial", "n/a"],
    ],
  );
  assert.deepEqual(tally(botClaims(entries)), { held: 0, partly: 0, wrong: 1, total: 1 });
  assert.equal(parseVivaLogDetailed(SAMPLE_LOG).superseded, 0);
});

test("pasting a log keeps a correction that reverts to the original line", () => {
  const held =
    "2026-11-21 10:00 | 0.5.1 | r | pr-2 | b | claim | 4 | understood | review-comment | live | unknown | held";
  const wrong = held.replace("| held", "| wrong");
  const file = [held, wrong, held].join("\n");
  assert.deepEqual(
    parseVivaLog(file).map((e) => e.botClaim),
    ["held"],
  );
  const merged = mergeLogs("", file);
  assert.deepEqual(
    parseVivaLog(merged).map((e) => e.botClaim),
    ["held"],
  );
  assert.equal(mergeLogs(merged, file), merged, "re-pasting adds nothing");
  assert.equal(mergeLogs(merged, [held, wrong].join("\n")), merged, "an older copy adds nothing");
  assert.equal(parseVivaLogDetailed(merged).superseded, 1, "one check corrected, counted once");
  assert.equal(
    parseVivaLogDetailed([held, held].join("\n")).superseded,
    0,
    "a repeat is not a correction",
  );
});

test("a correction must keep the scope: other scopes are separate checks", () => {
  const a =
    "2026-11-21 10:00 | 0.5.1 | r | pr-2 | b | claim | 4 | understood | review-comment | live | unknown | held";
  const b =
    "2026-11-21 10:00 | 0.5.1 | r | pr-2 | b | claim | 4 | understood | review | live | agent | n/a";
  assert.equal(parseVivaLog([a, b].join("\n")).length, 2);
});

test("schema 0.6.0 records which bot made a checked comment, counted per bot", async () => {
  const { schemaFor } = await import("./log-schemas.ts");
  assert.equal(schemaFor("0.6.2")?.version, "0.6.0");
  const log = [
    "2026-11-21 10:00 | 0.6.0 | r | pr-1 | a | t1 | 4 | understood | review-comment | live | unknown | wrong | CodeRabbit",
    "2026-11-21 11:00 | 0.6.0 | r | pr-1 | a | t2 | 4 | understood | review-comment | live | unknown | held | coderabbit",
    "2026-11-21 12:00 | 0.6.0 | r | pr-1 | a | t3 | 4 | understood | review-comment | live | unknown | held | copilot",
    "2026-11-21 13:00 | 0.6.0 | r | pr-1 | a | t4 | 4 | understood | review-comment | live | unknown | partly | <script>",
    "2026-11-21 14:00 | 0.5.1 | r | pr-1 | a | t5 | 4 | understood | review-comment | live | unknown | held",
    "2026-11-21 15:00 | 0.6.0 | r | pr-1 | a | t6 | 4 | understood | session | live | hand | n/a | coderabbit",
  ].join("\n");
  const entries = parseVivaLog(log);
  assert.deepEqual(
    entries.map((e) => e.bot),
    ["coderabbit", "coderabbit", "copilot", "unknown", "unknown", "n/a"],
  );
  assert.deepEqual(botClaims(entries).byBot, [
    { bot: "coderabbit", held: 1, partly: 0, wrong: 1, total: 2 },
    { bot: "unknown", held: 1, partly: 1, wrong: 0, total: 2 },
    { bot: "copilot", held: 1, partly: 0, wrong: 0, total: 1 },
  ]);
});

test("driftNote ignores checks that never recorded how the change was made", () => {
  // Five 0.3 lines (no ai-use) then five 0.4 lines with two delegated: no recorded baseline, no note.
  const old = Array.from(
    { length: 5 },
    (_, i) => `2026-10-0${i + 1} 10:00 | 0.3.1 | r | m | a | t | 4 | understood | session | live`,
  );
  const recent = ["hand", "hand", "delegated", "agent", "hand"].map(
    (u, i) =>
      `2026-10-1${i} 10:00 | 0.4.1 | r | m | a | t | 4 | understood | session | live | ${u}`,
  );
  assert.equal(driftNote(parseVivaLog([...old, ...recent].join("\n"))), null);
});

test("bot names accept a [bot] login suffix", () => {
  const line =
    "2026-11-21 10:00 | 0.6.0 | r | pr-1 | a | t | 4 | understood | review-comment | live | unknown | held | coderabbitai[bot]";
  assert.equal(parseVivaLog(line)[0].bot, "coderabbitai");
});

test("driftNote needs three recorded checks on each side before comparing hand-offs", () => {
  const rows = [
    "hand",
    "hand",
    "hand",
    "unknown",
    "unknown",
    "hand",
    "delegated",
    "agent",
    "delegated",
    "hand",
  ];
  const log = rows.map(
    (u, i) =>
      `2026-10-1${i} 10:00 | 0.4.1 | r | m | a | t | 4 | understood | session | live | ${u}`,
  );
  // Earlier: 3 recorded hand (0%); recent: 5 recorded, 3 handed off (60%).
  assert.match(
    driftNote(parseVivaLog(log.join("\n"))) ?? "",
    /60% of your recent recorded changes/,
  );
  log[1] = log[1].replace("| hand", "| unknown");
  assert.equal(driftNote(parseVivaLog(log.join("\n"))), null, "only 2 recorded before");
});

test("driftNote leaves out practice checks on old PRs", () => {
  const live = Array.from(
    { length: 10 },
    (_, i) =>
      `2026-10-${String(i + 1).padStart(2, "0")} 10:00 | 0.6.2 | r | m | a | t | 4 | understood | session | live | hand | n/a | n/a`,
  );
  const practice = Array.from(
    { length: 5 },
    (_, i) =>
      `2026-10-2${i} 10:00 | 0.6.2 | r | pr-${i + 1} | a | t | 4 | missed | practice | live | hand | n/a | n/a`,
  );
  assert.equal(driftNote(parseVivaLog([...live, ...practice].join("\n"))), null);
});

test("botTrend counts each bot's verdicts week by week, leaving out disputed and impossible dates", () => {
  const rc = (d: string, claim: string, bot: string, grade = "understood") =>
    `${d} 10:00 | 0.6.0 | r | pr-1 | a | t-${d}-${bot} | 4 | ${grade} | review-comment | live | unknown | ${claim} | ${bot}`;
  const log = [
    rc("2026-11-02", "held", "coderabbit"),
    rc("2026-11-03", "wrong", "coderabbit"),
    rc("2026-11-04", "held", "copilot"),
    rc("2026-11-10", "wrong", "coderabbit"),
    rc("2026-11-11", "wrong", "coderabbit", "disputed"),
    rc("2026-02-30", "held", "coderabbit"),
    "2026-11-12 10:00 | 0.6.0 | r | pr-1 | a | own | 4 | understood | session | live | hand | n/a | n/a",
  ].join("\n");
  const trend = botTrend(parseVivaLog(log));
  assert.deepEqual(trend.bots, ["coderabbit", "copilot"]);
  assert.deepEqual(
    trend.weeks.map((w) => ({ week: w.week, cells: { ...w.cells } })),
    [
      {
        week: "2026-11-02",
        cells: {
          coderabbit: { held: 1, partly: 0, wrong: 1, total: 2 },
          copilot: { held: 1, partly: 0, wrong: 0, total: 1 },
        },
      },
      { week: "2026-11-09", cells: { coderabbit: { held: 0, partly: 0, wrong: 1, total: 1 } } },
    ],
  );
  assert.equal(hasBotTrend(trend), true);
  assert.equal(hasBotTrend(botTrend(parseVivaLog(rc("2026-11-02", "held", "copilot")))), false);
  assert.deepEqual(botTrend([]), { bots: [], weeks: [] });
});

test("botTrend columns come from the weeks shown, and any bot name is safe", () => {
  const rc = (d: string, claim: string, bot: string) =>
    `${d} 10:00 | 0.6.0 | r | pr-1 | a | t-${d}-${bot}-${claim} | 4 | understood | review-comment | live | unknown | ${claim} | ${bot}`;
  const old = ["held", "held", "wrong", "held", "partly"].map((c) => rc("2026-01-05", c, "oldbot"));
  const recent = Array.from({ length: 9 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 8, 7 + 7 * i)).toISOString().slice(0, 10);
    return rc(d, "held", "copilot");
  });
  const trend = botTrend(parseVivaLog([...old, ...recent].join("\n")));
  assert.deepEqual(trend.bots, ["copilot"]);
  assert.equal(trend.weeks.length, 8);

  const tricky = botTrend(
    parseVivaLog(
      [rc("2026-11-02", "held", "constructor"), rc("2026-11-09", "held", "copilot")].join("\n"),
    ),
  );
  assert.equal((Object as unknown as { held?: number }).held, undefined, "Object untouched");
  assert.deepEqual(
    { ...tricky.weeks[0].cells.constructor },
    { held: 1, partly: 0, wrong: 0, total: 1 },
  );
  assert.equal(hasBotTrend(tricky), false);
});

test("schema 0.7.0 records question style and risk tier; older lines default", async () => {
  const { schemaFor } = await import("./log-schemas.ts");
  assert.equal(schemaFor("0.7.1")?.version, "0.7.0");
  assert.equal(schemaFor("0.6.4")?.version, "0.6.0");
  const log = [
    "2026-11-20 10:00 | 0.6.4 | r | pr-1 | a | t0 | 4 | understood | session | live | hand | n/a | n/a",
    "2026-11-21 10:00 | 0.7.0 | r | pr-1 | a | t1 | 4 | understood | session | live | hand | n/a | n/a | scenario | n/a",
    "2026-11-21 11:00 | 0.7.0 | r | pr-2 | a | t2 | 3 | partial | session | live | delegated | n/a | n/a | Decision | high",
    "2026-11-21 12:00 | 0.7.0 | r | pr-2 | a | t3 | 4 | missed | session | live | delegated | n/a | n/a | decision | high",
    "2026-11-21 13:00 | 0.7.0 | r | pr-3 | a | t4 | 2 | understood | session | live | hand | n/a | n/a | riddle | extreme",
    "2026-11-21 14:00 | 0.7.0 | r | pr-4 | a | t5 | 5 | understood | session | live | hand | n/a | n/a | scenario | low",
    "2026-11-21 15:00 | 0.7.0 | r | pr-4 | a | t6 | 5 | disputed | session | live | hand | n/a | n/a | decision | low",
  ].join("\n");
  const entries = parseVivaLog(log);
  assert.deepEqual(
    entries.map((e) => [e.style, e.risk]),
    [
      ["scenario", "n/a"],
      ["scenario", "n/a"],
      ["decision", "high"],
      ["decision", "high"],
      ["scenario", "n/a"],
      ["scenario", "low"],
      ["decision", "low"],
    ],
  );
  assert.deepEqual(
    byStyle(entries).map((r) => [r.key, r.understood, r.partial, r.missed]),
    [
      ["scenario", 4, 0, 0],
      ["decision", 0, 1, 1],
    ],
  );
  assert.deepEqual(
    byRisk(entries).map((r) => [r.key, r.total]),
    [
      ["low", 1],
      ["high", 2],
    ],
  );
  const md = summaryMarkdown(entries);
  assert.match(md, /\| Question style \|/);
  assert.match(md, /\| decision \| 0 \| 1 \| 1 \|/);
  assert.match(md, /\| high \| 0 \| 1 \| 1 \|/);
});

test("summaryMarkdown shows no style or risk tables when the options were never used", () => {
  const log =
    "2026-11-21 10:00 | 0.7.0 | r | pr-1 | a | t1 | 4 | understood | session | live | hand | n/a | n/a | scenario | n/a";
  const md = summaryMarkdown(parseVivaLog(log));
  assert.ok(!md.includes("Question style"));
  assert.ok(!md.includes("Risk tier"));
});
