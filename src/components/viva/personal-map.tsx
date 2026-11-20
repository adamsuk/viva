import { useState } from "react";
import {
  SAMPLE_LOG,
  gradeKind,
  parseVivaLog,
  summariseTopics,
  type TopicSummary,
  type VivaEntry,
} from "@/viva/log";

export function PersonalMap() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<VivaEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usedSample, setUsedSample] = useState(false);

  function load(raw: string, sample = false) {
    const parsed = parseVivaLog(raw);
    setEntries(parsed);
    setUsedSample(sample);
    setError(parsed.length ? null : "No valid entries. Expected the viva skill log format.");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => load(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  const topics = summariseTopics(entries);
  const thin = topics.filter((t) => t.thin);

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
        (<code className="font-mono text-sm">~/.agents/viva-log.md</code>). Local only. No account. No
        shared view.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block rounded-2xl border border-line bg-paper p-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-margin">Log file</span>
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
            onClick={() => load(text)}
            className="mt-2 min-h-11 rounded-2xl border border-accent bg-accent px-4 text-sm text-on-accent"
          >
            Read paste
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        No log yet?{" "}
        <button
          type="button"
          onClick={() => load(SAMPLE_LOG, true)}
          className="text-accent underline underline-offset-4"
        >
          Try the sample
        </button>
        , or install the skill with{" "}
        <code className="font-mono text-xs">npx skills add adamsuk/viva-skills --skill viva</code> and run{" "}
        <code className="font-mono text-xs">/viva</code>.
      </p>

      {error && <p className="mt-4 border-l-4 border-margin bg-fail-bg px-4 py-2 text-sm">{error}</p>}

      {entries.length > 0 && (
        <>
          <p className="mt-8 text-sm text-muted">
            {entries.length} check{entries.length === 1 ? "" : "s"} · {topics.length} topic
            {topics.length === 1 ? "" : "s"}
            {thin.length ? ` · ${thin.length} thin` : ""}
            {usedSample ? " · sample data" : ""}
          </p>

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
                      {t.nextSteps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="mt-10 font-display text-2xl">Topics</h3>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {topics.map((t) => (
              <TopicRow key={t.topic} summary={t} />
            ))}
          </ul>

          <p className="mt-8 max-w-2xl text-sm text-muted">
            Practice, not proof. A model can answer most of these questions, so a pass is a signal for you,
            not a security control. The map stays on this machine. See{" "}
            <a href="docs/mvp-platform.md" className="text-accent underline underline-offset-4">
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
  const { topic, entries, last, highConfidenceMiss, thin } = summary;
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">
          {topic}
          {thin && (
            <span className="ml-2 font-mono text-xs uppercase tracking-wider text-margin">thin</span>
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
                : "bg-hold-bg text-hold";
          return (
            <span key={i} className={`rounded px-1.5 py-0.5 ${cls}`}>
              {e.grade} ({e.confidence})
            </span>
          );
        })}
      </div>
      <p className="mt-1 font-mono text-xs text-faint">
        {last.repo} · {last.branchOrPr} · {last.scope} · {last.live}
      </p>
    </li>
  );
}
