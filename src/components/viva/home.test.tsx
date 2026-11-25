import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VivaApp } from "@/components/viva/app";
import { HOMEPAGE } from "@/viva/self-audit";
import { installCommand } from "@/viva/skills-data";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLElement;
let root: Root;

function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<VivaApp />));
}

const controls = () =>
  Array.from(container.querySelectorAll("button, a")).map((el) => el.textContent?.trim() ?? "");

beforeEach(() => {
  window.location.hash = "";
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("home", () => {
  it("leads with the unchanged headline and the skill install commands", () => {
    render();
    expect(container.querySelector("h2")?.textContent).toBe(
      "If you post it or merge it, you can defend it.",
    );
    expect(HOMEPAGE.headline).toBe("If you post it or merge it, you can defend it.");
    const text = container.textContent ?? "";
    expect(text).toContain("npx skills add adamsuk/viva-skills --skill viva");
    expect(text).toContain("npx skills add adamsuk/viva-skills --skill viva-assess");
    expect(text).toContain(installCommand("viva"));
    expect(text).toContain("/viva");
    expect(text).toContain("~/.agents/viva-log.md");
    for (const host of ["Claude Code", "Cursor", "Codex", "Grok", "Agent Skills"]) {
      expect(text).toContain(host);
    }
  });

  it("does not sell the walk: no Walk the PR control, no eight stations in the header", () => {
    render();
    expect(controls().filter((c) => /walk the pr/i.test(c))).toEqual([]);
    expect(container.querySelector("header")?.textContent).not.toMatch(/eight stations/i);
  });

  it("has no Start over or PR #212 progress strip on home", () => {
    render();
    const header = container.querySelector("header")?.textContent ?? "";
    expect(header).not.toContain("Start over");
    expect(header).not.toContain("PR #212");
  });

  it("puts the worked example after the skills tabs, not first after Home", () => {
    render();
    const tabs = Array.from(container.querySelectorAll("nav button")).map((b) => b.textContent);
    expect(tabs[0]).toBe("Home");
    expect(tabs[1]).not.toMatch(/walk|worked/i);
    expect(tabs).toContain("Worked example");
  });

  it("keeps #walk as the worked example with setup, rail and Start over", () => {
    window.location.hash = "#walk";
    render();
    const text = container.textContent ?? "";
    expect(text).toContain("Set up the walk");
    expect(text).toContain("PR #212");
    expect(controls()).toContain("Start over");
  });
});
