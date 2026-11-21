import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeKind, parseVivaLog, summariseTopics, SAMPLE_LOG } from "./log.ts";

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
  for (const grade of ["not understood", "not-yet-understood", "wasn’t fully understood", "never understood"]) {
    const log = `2026-11-21 10:00 | 0.3.1 | adamsuk/example | main | abc1234 | webhook retry | 5 | ${grade} | session | live`;
    const [topic] = summariseTopics(parseVivaLog(log));
    assert.equal(topic.highConfidenceMiss, true, grade);
    assert.equal(topic.thin, true, grade);
  }
});
