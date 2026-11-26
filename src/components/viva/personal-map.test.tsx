import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PersonalMap } from "@/components/viva/personal-map";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const BLOCKED = /will not let the page keep the log/;

let container: HTMLElement;
let root: Root;

function render() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(<PersonalMap />));
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("PersonalMap storage notice", () => {
  it("says nothing about storage when the browser allows it", () => {
    render();
    expect(container.textContent).not.toMatch(BLOCKED);
  });

  it("says the log can't be kept when the browser blocks storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    render();
    expect(container.textContent).toMatch(BLOCKED);
  });
});
