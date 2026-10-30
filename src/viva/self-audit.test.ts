import { test } from "node:test";
import assert from "node:assert/strict";
import { RECOMMENDATIONS, STATION_IDS } from "./model.ts";
import {
  QUESTIONS,
  STATION_QUESTIONS,
  parseAnswers,
  scoreQuestions,
  stationResults,
  weakestStation,
} from "./self-audit.ts";

test("every station has two or three questions with unique ids", () => {
  for (const id of STATION_IDS) {
    const n = STATION_QUESTIONS[id].length;
    assert.ok(n >= 1 && n <= 3, `${id} has ${n}`);
  }
  const ids = QUESTIONS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("questions point at recommendations at their own station", () => {
  for (const q of QUESTIONS)
    for (const id of q.recs) {
      const r = RECOMMENDATIONS.find((x) => x.id === id);
      assert.ok(r, `${q.id} -> ${id}`);
      assert.equal(r.station, q.station, `${q.id} -> ${id}`);
    }
});

test("scoring counts partial as half and any gap marks the station", () => {
  const qs = STATION_QUESTIONS.post;
  assert.deepEqual(scoreQuestions(qs, {}), {
    answered: 0,
    total: qs.length,
    percent: 0,
    score: "Not started",
  });
  const s = scoreQuestions(qs, { [qs[0].id]: "covered", [qs[1].id]: "partial" });
  assert.equal(s.percent, 75);
  assert.equal(s.score, "Partial");
  assert.equal(scoreQuestions(qs, { [qs[0].id]: "gap" }).score, "Gap");
});

test("the weakest station is the lowest share, earliest on ties", () => {
  assert.equal(weakestStation(stationResults({})), null);
  const r = stationResults({
    "post-disclose": "gap",
    "map-private": "gap",
    "draft-read": "covered",
  });
  assert.equal(weakestStation(r)?.station, "post");
});

test("stored answers are filtered and corrupt values start fresh", () => {
  assert.deepEqual(parseAnswers(null), {});
  assert.deepEqual(parseAnswers("{nope"), {});
  assert.deepEqual(parseAnswers('{"post-disclose":"gap","x":"gap","map-private":"maybe"}'), {
    "post-disclose": "gap",
  });
});
