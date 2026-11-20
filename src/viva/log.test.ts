import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVivaLog, summariseTopics, SAMPLE_LOG } from "./log.ts";

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
