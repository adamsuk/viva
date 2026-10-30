import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ALL_REFERENCES,
  BOT_COMMENTS,
  CLAIMS,
  FACTORY,
  STATION_IDS as IDS,
  notApplicable,
  stationFor,
  GAPS,
  GUIDE,
  QUESTION,
  RECOMMENDATIONS,
  STATIONS,
  STATION_IDS,
  TOOLS,
  outcomeOf,
} from "./model.ts";

test("stations line up with their ids", () => {
  assert.deepEqual(
    STATIONS.map((s) => s.id),
    [...STATION_IDS],
  );
  STATIONS.forEach((s, i) => assert.equal(s.index, String(i + 1).padStart(2, "0")));
  for (const id of STATION_IDS) assert.ok(GUIDE[id], id);
});

test("reference ids are unique and every reference is dated and linked", () => {
  const ids = ALL_REFERENCES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const r of ALL_REFERENCES) {
    assert.ok(r.date.trim(), r.id);
    assert.match(r.url, /^https:\/\//, r.id);
  }
});

test("every cited source exists", () => {
  const ids = new Set(ALL_REFERENCES.map((r) => r.id));
  const cited = [
    ...STATIONS.flatMap((s) => s.sources ?? []),
    ...Object.values(FACTORY).flatMap((f) => f.sources),
    ...Object.values(GUIDE).flatMap((g) => g.sources),
    ...RECOMMENDATIONS.flatMap((r) => r.sources),
    ...CLAIMS.flatMap((c) => c.sources),
  ];
  for (const id of cited) assert.ok(ids.has(id), id);
});

test("every source is cited somewhere", () => {
  const cited = new Set([
    ...STATIONS.flatMap((s) => s.sources ?? []),
    ...Object.values(FACTORY).flatMap((f) => f.sources),
    ...Object.values(GUIDE).flatMap((g) => g.sources),
    ...RECOMMENDATIONS.flatMap((r) => r.sources),
    ...CLAIMS.flatMap((c) => c.sources),
  ]);
  for (const r of ALL_REFERENCES) assert.ok(cited.has(r.id), `${r.id} is never cited`);
});

test("every recommendation and claim has a source and a unique id", () => {
  for (const list of [RECOMMENDATIONS, CLAIMS]) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const x of list) assert.ok(x.sources.length > 0, x.id);
  }
});

test("every station has at least one recommendation", () => {
  for (const id of STATION_IDS)
    assert.ok(
      RECOMMENDATIONS.some((r) => r.station === id),
      id,
    );
});

test("tools and gaps point at real recommendations", () => {
  const ids = new Set(RECOMMENDATIONS.map((r) => r.id));
  for (const t of TOOLS) for (const f of t.fits) assert.ok(ids.has(f.rec), `${t.name} -> ${f.rec}`);
  for (const id of Object.keys(GAPS)) assert.ok(ids.has(id), id);
});

test("the viva question has exactly one right answer among its options", () => {
  assert.equal(QUESTION.options.filter((o) => o.id === QUESTION.answer).length, 1);
});

test("one bot comment is right and one is wrong", () => {
  assert.deepEqual(BOT_COMMENTS.map((c) => c.correct).sort(), ["dismiss", "forward"]);
});

test("confidence splits right and wrong answers four ways", () => {
  assert.equal(outcomeOf(true, "sure"), "solid");
  assert.equal(outcomeOf(true, "guess"), "fragile");
  assert.equal(outcomeOf(false, "sure"), "blind");
  assert.equal(outcomeOf(false, "think"), "thin");
});

test("every station has a factory note, and only Viva's own stations can be skipped", () => {
  for (const id of IDS) assert.ok(FACTORY[id].change, id);
  const none = { mode: "team" as const, check: "none" as const, record: "none" as const };
  assert.deepEqual(
    IDS.filter((id) => notApplicable(id, none)),
    ["viva", "merge", "map"],
  );
  assert.equal(stationFor("viva", { ...none, check: "walkthrough" }).name, "Walkthrough");
  assert.equal(stationFor("draft", { ...none, mode: "factory" }).owner, "Work order owner");
});
