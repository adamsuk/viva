import { test } from "node:test";
import assert from "node:assert/strict";
import { AGENTS, SKILLS, agentCommands, installCommand } from "./skills-data.ts";

test("both skills are listed, each with at least one feature", () => {
  assert.deepEqual(
    SKILLS.map((s) => s.name),
    ["viva", "viva-assess"],
  );
  for (const s of SKILLS) assert.ok(s.features.length > 0, s.name);
});

test("viva lists dispute, review comments and how the change was made", () => {
  const viva = SKILLS.find((s) => s.name === "viva")!;
  const text = viva.features.map((f) => `${f.name} ${f.text}`).join(" ");
  assert.match(text, /dispute/i);
  assert.match(text, /review comment/i);
  assert.match(text, /how the change was made/i);
});

test("every agent gets an install command for both skills", () => {
  for (const a of AGENTS) {
    assert.deepEqual(agentCommands(a.flag), [
      `npx skills add adamsuk/viva-skills --skill viva --agent ${a.flag} -g`,
      `npx skills add adamsuk/viva-skills --skill viva-assess --agent ${a.flag} -g`,
    ]);
  }
  assert.equal(installCommand("viva"), "npx skills add adamsuk/viva-skills --skill viva");
});

test("the Skills page says the bot verdict is kept and viva-assess reports how the bots fared", () => {
  const text = (name: string) =>
    SKILLS.find((s) => s.name === name)!
      .features.map((f) => `${f.name} ${f.text}`)
      .join(" ");
  assert.match(text("viva"), /claim held, and which bot/i);
  assert.match(text("viva-assess"), /bot/i);
});

test("the Skills page offers the before-you-post step: own description and disclosure", () => {
  const viva = SKILLS.find((s) => s.name === "viva")!;
  const card = viva.features.find((f) => f.name === "Before you post");
  assert.ok(card);
  assert.match(card.text, /own words/);
  assert.match(card.text, /Assisted-by/);
});

test("the Skills page offers practice mode for experiment 1", () => {
  const viva = SKILLS.find((s) => s.name === "viva")!;
  const card = viva.features.find((f) => f.name === "Practice mode");
  assert.ok(card);
  assert.match(card.text, /\/viva practice/);
  assert.match(card.text, /experiment 1/);
});

test("the Skills page offers the opt-in post-commit reminder", () => {
  const viva = SKILLS.find((s) => s.name === "viva")!;
  const card = viva.features.find((f) => f.name === "Reminder after commits");
  assert.ok(card);
  assert.match(card.text, /opt-in/i);
  assert.match(card.text, /install-hook\.sh/);
  assert.match(card.text, /never blocks a commit/);
});
