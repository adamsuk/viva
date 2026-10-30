import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { docFiles } from "./docs.ts";

test("the Markdown docs match the model (run `npm run docs`)", () => {
  for (const [path, body] of Object.entries(docFiles())) {
    assert.equal(readFileSync(new URL(`../../${path}`, import.meta.url), "utf8"), body, path);
  }
});
