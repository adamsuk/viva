import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_WALK,
  clearAfter,
  doneCount,
  frontier,
  stationDone,
  vivaOutcome,
  type WalkState,
} from "./store.ts";

const good: WalkState = {
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
