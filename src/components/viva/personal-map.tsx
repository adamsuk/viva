import { useEffect, useRef, useState } from "react";
import { RECOMMENDATIONS } from "@/viva/model";
import {
  LOG_STORAGE_KEY,
  botClaims,
  byAiUse,
  calibration,
  calibrationSentence,
  SAMPLE_LOG,
  gradeKind,
  habitFor,
  mergeLogs,
  parseVivaLog,
  parseVivaLogDetailed,
  summariseTopics,
  type AiUseRow,
  type BotClaimCounts,
  type CalibrationRow,
  type NextStep,
  type TopicSummary,
} from "@/viva/log";

type Mode = "add" | "replace";

/** The kept lines live in this browser's localStorage only. Nothing is sent anywhere. */
function readStored(): { text: string; ok: boolean } {
  try {
    return { text: window.localStorage.getItem(LOG_STORAGE_KEY) ?? "", ok: true };
  } catch {
    return { text: "", ok: false };
  }
}

function writeStored(text: string): boolean {
  try {
    if (text) window.localStorage.setItem(LOG_STORAGE_KEY, text);
    else window.localStorage.removeItem(LOG_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function PersonalMap() {
  const inputGeneration = useRef(0);
  const [text, setText] = useState("");
  const [log, setLog] = useState(() => (typeof window === "undefined" ? "" : readStored().text));
  const [storageOk, setStorageOk] = useState(true);
  const [mode, setMode] = useState<Mode>("add");
  const [error, setError] = useState<string | null>(null);
  const [sample, setSample] = useState<string | null>(null);
  const usedSample = sample !== null;

  useEffect(() => {
    if (typeof window !== "undefined" && !readStored().ok) setStorageOk(false);
  }, []);

  const { entries, skipped, unknownVersion } = parseVivaLogDetailed(sample ?? log);

  function load(raw: string, sample = false) {
    if (!parseVivaLog(raw).length) {
      setError("No valid entries. Expected the viva skill log format.");
      return;
    }
    setError(null);
    if (sample) {
      // The sample is for trying the map. It is shown, never kept.
      setSample(raw);
      return;
    }
    const next = mergeLogs(mode === "replace" ? "" : log, raw);
    setSample(null);
    setLog(next);
    setStorageOk(writeStored(next));
  }

  function loadLatest(raw: string, sample = false) {
    inputGeneration.current++;
    load(raw, sample);
  }

  function forget() {
    inputGeneration.current++;
    setLog("");
    setText("");
    setSample(null);
    setError(null);
    setStorageOk(writeStored(""));
  }

  function download() {
    const blob = new Blob([log], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viva-log.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const generation = ++inputGeneration.current;
    e.currentTarget.value = "";

    const reader = new FileReader();
    const onReadFailure = () => {
      if (generation !== inputGeneration.current) return;
      setError("Could not read the log file. Try selecting it again or paste the log.");
    };

    reader.onload = () => {
      if (generation === inputGeneration.current) load(String(reader.result ?? ""));
    };
    reader.onerror = onReadFailure;
    try {
      reader.readAsText(file);
    } catch {
      onReadFailure();
    }
  }

  const topics = summariseTopics(entries, new Date());
  const thin = topics.filter((t) => t.thin);
  const habit = habitFor(topics);
  const disputed = entries.filter((e) => gradeKind(e.grade) === "disputed").length;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h2 className="font-display text-4xl italic sm:text-5xl">Personal map</h2>
      <p className="mt-3 max-w-2xl text-muted">
        A private picture from the checks you already run. Drop or paste the log written by the{" "}
        <a
          href="https://github.com/adamsuk/viva-skills"
          className="text-accent underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          viva skill
        </a>{" "}
        (<code className="font-mono text-sm">~/.agents/viva-log.md</code>). Kept in this browser
        only. No account. No shared view.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block rounded-2xl border border-line bg-paper p-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-margin">
            Log file
          </span>
          <input type="file" accept=".md,.txt" onChange={onFile} className="mt-2 block text-sm" />
        </label>
        <div className="rounded-2xl border border-line bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-margin">Or paste</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste log lines here…"
            className="mt-2 w-full rounded border border-line bg-paper-2 p-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => loadLatest(text)}
            className="mt-2 min-h-11 rounded-2xl border border-accent bg-accent px-4 text-sm text-on-accent"
          >
            Read paste
          </button>
        </div>
      </div>

      <fieldset className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <legend className="sr-only">What new lines do</legend>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="map-mode"
            checked={mode === "add"}
            onChange={() => setMode("add")}
          />
          Add to what is kept
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="map-mode"
            checked={mode === "replace"}
            onChange={() => setMode("replace")}
          />
          Replace it
        </label>
      </fieldset>

      <p className="mt-4 max-w-2xl text-sm text-muted">
        What is kept: the log lines you add here (date, skill version, repo, branch or PR, commit,
        topic, confidence, grade, scope), in this browser&apos;s local storage on this device, until
        you press Forget this log. Nothing is sent anywhere. The sample is never kept.
      </p>
      {!storageOk && (
        <p className="mt-2 border-l-4 border-margin bg-hold-bg px-4 py-2 text-sm">
          This browser will not let the page keep the log (private mode or storage full). The map
          works for this visit only. Use Download log to keep a copy.
        </p>
      )}

      <p className="mt-4 text-sm text-muted">
        No log yet?{" "}
        <button
          type="button"
          onClick={() => loadLatest(SAMPLE_LOG, true)}
          className="text-accent underline underline-offset-4"
        >
          Try the sample
        </button>
        , or install the skill with{" "}
        <code className="font-mono text-xs">npx skills add adamsuk/viva-skills --skill viva</code>{" "}
        and run <code className="font-mono text-xs">/viva</code>.
      </p>

      {error && (
        <p className="mt-4 border-l-4 border-margin bg-fail-bg px-4 py-2 text-sm">{error}</p>
      )}

      {entries.length > 0 && (
        <>
          <p className="mt-8 text-sm text-muted">
            {entries.length} check{entries.length === 1 ? "" : "s"} · {topics.length} topic
            {topics.length === 1 ? "" : "s"}
            {thin.length ? ` · ${thin.length} thin` : ""}
            {disputed ? ` · ${disputed} disputed` : ""}
            {usedSample ? " · sample data" : ""}
          </p>
          {(skipped > 0 || unknownVersion > 0) && (
            <p className="mt-2 text-sm text-muted">
              {skipped > 0 &&
                `${skipped} line${skipped === 1 ? "" : "s"} skipped: not in the viva log format. `}
              {unknownVersion > 0 &&
                `${unknownVersion} line${unknownVersion === 1 ? "" : "s"} from a skill version this page does not know yet, read with the oldest format.`}
            </p>
          )}
          {!usedSample && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={download}
                className="min-h-11 rounded-2xl border border-line px-4 text-sm"
              >
                Download log
              </button>
              <button
                type="button"
                onClick={forget}
                className="min-h-11 rounded-2xl border border-margin px-4 text-sm text-margin"
              >
                Forget this log
              </button>
            </div>
          )}

          {thin.length > 0 && (
            <div className="mt-6 rounded-2xl border border-margin bg-hold-bg p-4">
              <h3 className="font-display text-2xl">Next steps</h3>
              <p className="mt-1 text-sm text-muted">
                From the recommendations: turn a thin area into the next deliberate practice step.
              </p>
              <ul className="mt-3 space-y-3">
                {thin.map((t) => (
                  <li key={t.topic}>
                    <p className="font-medium">{t.topic}</p>
                    <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                      {t.steps.map((s) => (
                        <li key={s.text}>
                          <StepText step={s} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {habit && (
            <div className="mt-6 rounded-2xl border border-line bg-paper p-4">
              <h3 className="font-display text-2xl">Next habit</h3>
              <p className="mt-1 text-sm text-muted">
                <StepText step={habit} />
              </p>
            </div>
          )}

          <Calibration rows={calibration(entries)} />
          <ByAiUse rows={byAiUse(entries)} />
          <BotComments counts={botClaims(entries)} />

          <h3 className="mt-10 font-display text-2xl">Topics</h3>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {topics.map((t) => (
              <TopicRow key={t.topic} summary={t} />
            ))}
          </ul>

          {disputed > 0 && (
            <p className="mt-4 max-w-2xl text-sm text-muted">
              Struck-through checks were disputed: the question was faulty, so they count for
              nothing here. Many disputes in one area say more about the questions than about you.
            </p>
          )}

          <p className="mt-8 max-w-2xl text-sm text-muted">
            Practice, not proof. A model can answer most of these questions, so a pass is a signal
            for you, not a security control. The map stays in this browser. See{" "}
            <a
              href="https://github.com/adamsuk/viva/blob/98bd330b09ed4f040e2a36b07195cc566a05aa97/docs/mvp-platform.md"
              className="text-accent underline underline-offset-4"
            >
              the MVP notes
            </a>{" "}
            and the{" "}
            <a
              href="https://github.com/adamsuk/viva-skills"
              className="text-accent underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              skill
            </a>
            .
          </p>
        </>
      )}
    </section>
  );
}

function TopicRow({ summary }: { summary: TopicSummary }) {
  const { topic, entries, last, highConfidenceMiss, thin, recheck } = summary;
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">
          {topic}
          {thin && (
            <span className="ml-2 font-mono text-xs uppercase tracking-wider text-margin">
              thin
            </span>
          )}
          {recheck && (
            <span className="ml-2 font-mono text-xs uppercase tracking-wider text-accent">
              re-check
            </span>
          )}
          {highConfidenceMiss && (
            <span className="ml-2 font-mono text-xs uppercase tracking-wider text-fail">
              confident-wrong
            </span>
          )}
        </p>
        <p className="font-mono text-xs text-faint">
          {entries.length} · last {last.timestamp}
        </p>
      </div>
      <div className="mt-1 flex flex-wrap gap-2 text-sm">
        {entries.map((e, i) => {
          const kind = gradeKind(e.grade);
          const cls =
            kind === "understood"
              ? "bg-pass-bg text-pass"
              : kind === "missed"
                ? "bg-fail-bg text-fail"
                : kind === "disputed"
                  ? "border border-line text-faint line-through"
                  : "bg-hold-bg text-hold";
          return (
            <span key={i} className={`rounded px-1.5 py-0.5 ${cls}`}>
              {e.grade} ({e.confidence})
            </span>
          );
        })}
      </div>
      {recheck && (
        <p className="mt-1 text-sm text-muted">
          Missed a week or more ago. Run /viva on your next change here, or ask your agent for one
          question on this area.
        </p>
      )}
      <p className="mt-1 font-mono text-xs text-faint">
        {last.repo} · {last.branchOrPr} · {last.scope} · {last.live}
      </p>
    </li>
  );
}

const BUCKET_LABEL: Record<CalibrationRow["bucket"], string> = {
  high: "Sure (4–5)",
  mid: "Middling (3)",
  low: "Unsure (1–2)",
};

/** Confidence against grade: does feeling sure track understanding? No score, no ranking. */
function Calibration({ rows }: { rows: CalibrationRow[] }) {
  const shown = rows.filter((r) => r.total > 0);
  if (!shown.length) return null;
  const sentence = calibrationSentence(rows);
  return (
    <section aria-labelledby="calibration-heading" className="mt-10">
      <h3 id="calibration-heading" className="font-display text-2xl">
        Confidence and grade
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Whether feeling sure went with understanding. A confident wrong answer is the signal that
        matters most.
      </p>
      <table className="mt-3 w-full max-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-line font-mono text-xs uppercase tracking-wider text-faint">
            <th className="py-1 pr-2 font-normal">Confidence</th>
            <th className="py-1 pr-2 font-normal">Understood</th>
            <th className="py-1 pr-2 font-normal">Partial</th>
            <th className="py-1 pr-2 font-normal">Missed</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.bucket} className="border-b border-line">
              <th scope="row" className="py-1 pr-2 font-medium">
                {BUCKET_LABEL[r.bucket]}
              </th>
              <td className="py-1 pr-2 text-pass">{r.understood}</td>
              <td className="py-1 pr-2 text-hold">{r.partial}</td>
              <td
                className={`py-1 pr-2 ${r.bucket === "high" && r.missed ? "font-medium text-fail" : "text-fail"}`}
              >
                {r.missed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sentence && <p className="mt-2 text-sm">{sentence}</p>}
    </section>
  );
}

function BotComments({ counts }: { counts: BotClaimCounts }) {
  if (!counts.total) return null;
  return (
    <section aria-labelledby="bot-comments-heading" className="mt-10">
      <h3 id="bot-comments-heading" className="font-display text-2xl">
        Bot comments you checked
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Whether each bot comment&apos;s claim held when it was checked against the code. Catching a
        wrong claim counts as understanding. If few hold, the bot deserves less of your attention.
      </p>
      <p className="mt-3 text-sm">
        Of {counts.total}: <span className="text-pass">{counts.held} held</span>,{" "}
        <span className="text-hold">{counts.partly} partly</span>,{" "}
        <span className="text-fail">{counts.wrong} wrong</span>.
      </p>
    </section>
  );
}

const AI_USE_LABEL: Record<AiUseRow["aiUse"], string> = {
  hand: "By hand",
  explained: "Asked AI why",
  "generated-then-understood": "Generated, then understood",
  delegated: "Delegated to AI",
  agent: "Built by an agent",
  unknown: "Not recorded",
};

/**
 * Grades by how the change was made. The research found the way AI is used predicts
 * understanding: delegation scored lowest, asking why and generate-then-understand scored highest.
 */
function ByAiUse({ rows }: { rows: AiUseRow[] }) {
  if (!rows.some((r) => r.aiUse !== "unknown")) return null;
  const rate = (r: AiUseRow) => r.understood / r.total;
  const delegated = rows.find((r) => r.aiUse === "delegated");
  const others = rows.filter((r) => r.aiUse !== "delegated" && r.aiUse !== "unknown");
  const othersTotal = others.reduce((n, r) => n + r.total, 0);
  const othersRate = othersTotal
    ? others.reduce((n, r) => n + r.understood, 0) / othersTotal
    : null;
  const delegatedWeaker = delegated && othersRate !== null && rate(delegated) < othersRate;
  return (
    <section aria-labelledby="ai-use-heading" className="mt-10">
      <h3 id="ai-use-heading" className="font-display text-2xl">
        By how the change was made
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        In a randomized trial, how people used AI mattered more than whether they did: handing over
        the task scored lowest on understanding, asking why or generating and then understanding
        scored as well as coding by hand.{" "}
        <a
          href="https://www.anthropic.com/research/AI-assistance-coding-skills"
          className="text-accent underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          The study
        </a>
        .
      </p>
      <table className="mt-3 w-full max-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-line font-mono text-xs uppercase tracking-wider text-faint">
            <th className="py-1 pr-2 font-normal">How</th>
            <th className="py-1 pr-2 font-normal">Understood</th>
            <th className="py-1 pr-2 font-normal">Partial</th>
            <th className="py-1 pr-2 font-normal">Missed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.aiUse} className="border-b border-line">
              <th scope="row" className="py-1 pr-2 font-medium">
                {AI_USE_LABEL[r.aiUse]}
              </th>
              <td className="py-1 pr-2 text-pass">{r.understood}</td>
              <td className="py-1 pr-2 text-hold">{r.partial}</td>
              <td className="py-1 pr-2 text-fail">{r.missed}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {delegatedWeaker && (
        <p className="mt-2 text-sm">
          Your delegated changes were understood less often than the rest. Next time, ask the agent
          why, or make sure you could rewrite what it wrote.
        </p>
      )}
    </section>
  );
}

/** A step, with the label of the guide recommendation behind it and a link to the guide. */
function StepText({ step }: { step: NextStep }) {
  const rec = RECOMMENDATIONS.find((r) => r.id === step.recommendationId);
  return (
    <>
      {step.text}
      {rec && (
        <>
          {" "}
          <a
            href="#guide"
            title={rec.text}
            className="font-mono text-xs whitespace-nowrap text-accent underline underline-offset-4"
          >
            {rec.maturity}: {rec.id}
          </a>
        </>
      )}
    </>
  );
}
