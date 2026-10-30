import { test } from "node:test";
import assert from "node:assert/strict";
import { hashFor, routeFromHash } from "./routes.ts";

test("three views have hash routes", () => {
  assert.deepEqual(routeFromHash(""), { view: "home", anchor: null });
  assert.deepEqual(routeFromHash("#walk"), { view: "walk", anchor: null });
  assert.deepEqual(routeFromHash("#/guide"), { view: "guide", anchor: null });
});

test("sections in the guide have anchors", () => {
  assert.deepEqual(routeFromHash("#evidence"), { view: "guide", anchor: "evidence" });
  assert.deepEqual(routeFromHash("#prior-art"), { view: "guide", anchor: "prior-art" });
  assert.deepEqual(routeFromHash("#audit"), { view: "guide", anchor: "audit" });
  assert.deepEqual(routeFromHash("#parts"), { view: "home", anchor: "parts" });
  assert.deepEqual(routeFromHash("#nonsense"), { view: "home", anchor: null });
});

test("hashes round trip", () => {
  for (const h of ["", "#walk", "#guide", "#parts", "#evidence", "#prior-art", "#audit"])
    assert.equal(hashFor(routeFromHash(h)), h);
});
