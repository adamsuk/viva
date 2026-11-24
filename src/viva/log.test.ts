import { test } from "node:test";
import assert from "node:assert/strict";
import {
  botClaims,
  byAiUse,
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
  SAMPLE_LOG,
} from "./log.ts";

test("parses the skill log format", () => {
  const entries = parseVivaLog(SAMPLE_LOG);
  assert.equal(entries.length, 4);
  assert.equal(entries[1].topic, "idempotency key");
  assert.equal(entries[1].confidence, 5);
  assert.equal(entries[1].grade, "missed");
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
  assert.equal(CURRENT_LOG_SCHEMA.version, "0.5.0");
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
  ].join("\n");
  const entries = parseVivaLog(log);
  assert.deepEqual(
    entries.map((e) => e.botClaim),
    ["wrong", "held", "partly", "n/a", "n/a", "wrong", "n/a"],
  );
  assert.deepEqual(botClaims(entries), { held: 1, partly: 1, wrong: 1, total: 3 });
  assert.deepEqual(botClaims([]), { held: 0, partly: 0, wrong: 0, total: 0 });
});
