import { useState } from "react";
import changelogSource from "../../../CHANGELOG.md?raw";
import {
  GUIDE_JSON_URL,
  LLMS_FULL_URL,
  LLMS_TXT_URL,
  SCORES,
  auditPrompt,
  guideVersion,
} from "@/viva/machine";
import { Disclosure } from "@/components/viva/disclosure";
import { MaturityBadge } from "@/components/viva/recommendations";

const VERSION = guideVersion(changelogSource);
const PROMPT = auditPrompt(VERSION);

const link = "text-steel underline underline-offset-4 hover:text-steel-2";

/** Point an agent with read-only repo access at the guide, and get a scored gap list back. */
export function Assess() {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2500);
  };
  return (
    <Disclosure id="assess" title="Assess your team with an LLM" className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <MaturityBadge maturity="Cutting edge" />
        <span className="font-mono text-xs text-faint">Guide version {VERSION}</span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Give an agent read-only access to your repos and paste the prompt. It reads this guide as
        data and scores each recommendation from policies, templates and configs. It is told not to
        look at individuals.
      </p>
      <div className="mt-3 rounded-xl border border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-1">
          <p className="font-mono text-xs text-muted">Audit prompt</p>
          <button
            type="button"
            onClick={copy}
            className="min-h-11 rounded-lg px-3 text-sm font-medium text-steel underline-offset-4 hover:underline"
          >
            {copied === "done" ? "Copied" : copied === "failed" ? "Select and copy" : "Copy prompt"}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied === "done" ? "Prompt copied" : ""}
          </span>
        </div>
        <pre
          tabIndex={0}
          aria-label="Audit prompt"
          className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-xs leading-relaxed text-ink"
        >
          {PROMPT}
        </pre>
      </div>
      <dl className="mt-3 grid gap-1 text-sm">
        {Object.entries(SCORES).map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="w-16 shrink-0 font-mono text-xs text-steel">{k}</dt>
            <dd className="text-muted">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted">
        Machine-readable guide:{" "}
        <a href={GUIDE_JSON_URL} className={link}>
          guide.json
        </a>
        {" · "}
        <a href={LLMS_TXT_URL} className={link}>
          llms.txt
        </a>
        {" · "}
        <a href={LLMS_FULL_URL} className={link}>
          llms-full.txt
        </a>
        . Built from the same data as this page.
      </p>
    </Disclosure>
  );
}
