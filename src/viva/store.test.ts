import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SETUP } from "./model.ts";
import {
  EMPTY_WALK,
  clearAfter,
  doneCount,
  frontier,
  stationDone,
  useViva,
  vivaOutcome,
  type WalkState,
} from "./store.ts";

const good: WalkState = {
  setup: DEFAULT_SETUP,
  draft: "explain",
  post: "own",
  triage: { jitter: "forward", loop: "dismiss" },
  review: "read",
  answer: "b",
  confidence: "sure",
  merge: "talk",
  map: "private",
  loop: "pair",
};

test("a fresh walk starts at the draft", () => {
  assert.equal(frontier(EMPTY_WALK), "draft");
  assert.equal(doneCount(EMPTY_WALK), 0);
});

test("good choices reach the end", () => {
  assert.equal(doneCount(good), 8);
  assert.equal(vivaOutcome(good), "solid");
});

test("weak choices are sent back and stop the line", () => {
  assert.equal(frontier({ ...good, post: "agent" }), "post");
  assert.equal(frontier({ ...good, triage: { jitter: "forward", loop: "forward" } }), "bot");
  assert.equal(frontier({ ...good, review: "stamp" }), "review");
  assert.equal(frontier({ ...good, merge: "block" }), "merge");
  assert.equal(frontier({ ...good, map: "dashboard" }), "map");
});

test("a wrong answer still moves on: the viva informs, it does not gate", () => {
  const wrong = { ...good, answer: "a", confidence: "sure" as const };
  assert.ok(stationDone(wrong, "viva"));
  assert.equal(vivaOutcome(wrong), "blind");
});

test("changing a station clears everything after it", () => {
  const cleared = clearAfter(good, "bot");
  assert.deepEqual(cleared.triage, good.triage);
  assert.equal(cleared.review, null);
  assert.equal(cleared.answer, null);
  assert.equal(cleared.loop, null);
  assert.equal(cleared.draft, "explain");
});

test("with no follow-up check, the viva and merge stations are not applicable and count as done", () => {
  const walk = {
    ...EMPTY_WALK,
    setup: { ...DEFAULT_SETUP, check: "none" as const, record: "journal" as const },
  };
  assert.ok(stationDone(walk, "viva"));
  assert.ok(stationDone(walk, "merge"));
  assert.ok(!stationDone(walk, "map"));
  const noAnswers = { ...good, setup: walk.setup, answer: null, confidence: null, merge: null };
  assert.equal(doneCount(noAnswers), 8);
});

test("with nothing kept, the map station is not applicable", () => {
  const walk = { ...good, setup: { ...DEFAULT_SETUP, record: "none" as const }, map: null };
  assert.ok(stationDone(walk, "map"));
  assert.equal(doneCount(walk), 8);
});

test("in a factory, a vague work order and an agent's claim are sent back", () => {
  const factory = { ...DEFAULT_SETUP, mode: "factory" as const };
  const run = { ...good, setup: factory, draft: "session" as const, post: "record" as const };
  assert.equal(doneCount(run), 8);
  assert.equal(frontier({ ...run, draft: "vague" }), "draft");
  assert.equal(frontier({ ...run, post: "claim" }), "post");
});

test("the store keeps a map only when a follow-up check feeds it", () => {
  useViva.getState().configure({ check: "none" });
  assert.equal(useViva.getState().walk.setup.record, "journal");
  useViva.getState().configure({ check: "question", record: "map" });
  assert.equal(useViva.getState().walk.setup.record, "map");
});
