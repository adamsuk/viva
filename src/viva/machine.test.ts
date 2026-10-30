import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RECOMMENDATIONS } from "./model.ts";
import { buildGuideJson, guideVersion, machineFiles } from "./machine.ts";

const changelog = readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8");

test("the guide is versioned by the newest changelog date", () => {
  assert.match(guideVersion(changelog), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(guideVersion(""), "unversioned");
});

test("guide.json carries every recommendation and parses", () => {
  const files = machineFiles(changelog);
  const json = JSON.parse(files["guide.json"]);
  assert.equal(json.name, "Viva");
  const recs = json.stations.flatMap((s: { recommendations: unknown[] }) => s.recommendations);
  assert.equal(recs.length, RECOMMENDATIONS.length);
  assert.deepEqual(Object.keys(files).sort(), ["guide.json", "llms-full.txt", "llms.txt"]);
});

test("the audit prompt stays read-only and away from individuals", () => {
  const prompt = buildGuideJson(changelog).audit.prompt;
  assert.match(prompt, /read-only/);
  assert.match(prompt, /Do not read, score, or report on any individual person/);
});

test("llms-full.txt names every recommendation id", () => {
  const full = machineFiles(changelog)["llms-full.txt"];
  for (const r of RECOMMENDATIONS) assert.ok(full.includes(`\`${r.id}\``), r.id);
});
