import { useState } from "react";
import { parseVivaLog, groupByTopic, type VivaEntry } from "@/viva/log";

export function PersonalMap() {
  const [entries, setEntries] = useState<VivaEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const parsed = parseVivaLog(text);
        setEntries(parsed);
        setError(parsed.length ? null : "No valid entries found. Expected the viva skill log format.");
      } catch (err) {
        setError(String(err));
      }
    };
    reader.readAsText(file);
  }

  const byTopic = groupByTopic(entries);
  const gaps = Array.from(byTopic.entries()).filter(([, list]) =>
    list.some((e) => String(e.confidence) === "5" || e.confidence === 5 || String(e.confidence).toLowerCase() === "high") &&
    list.some((e) => /miss|partial|wrong/i.test(e.grade)),
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="font-display text-4xl">Personal map</h2>
      <p className="mt-2 text-muted">
        Drop the log written by the{' '}
        <a
          href="https://github.com/adamsuk/viva-skills"
          className="text-accent underline"
          target="_blank"
          rel="noreferrer"
        >
          viva skill
        </a>
        {' '}(`~/.agents/viva-log.md`). Private, local, no account.
      </p>

      <label className="mt-6 block">
        <span className="text-sm text-muted">Log file</span>
        <input type="file" accept=".md,.txt" onChange={onFile} className="mt-1 block" />
      </label>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {entries.length > 0 && (
        <>
          <h3 className="mt-8 text-xl">Topics ({byTopic.size})</h3>
          <ul className="mt-2 space-y-2">
            {Array.from(byTopic.entries()).map(([topic, list]) => (
              <li key={topic} className="border-b border-line py-2">
                <strong>{topic}</strong>
                <span className="ml-2 text-sm text-muted">
                  {list.length} check{list.length === 1 ? "" : "s"} · last {list[list.length - 1].timestamp}
                </span>
                <div className="text-sm">
                  {list.map((e, i) => (
                    <span key={i} className="mr-2">
                      {e.grade} ({e.confidence})
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          {gaps.length > 0 && (
            <>
              <h3 className="mt-8 text-xl">Signals worth attention</h3>
              <ul className="mt-2 list-disc pl-5">
                {gaps.map(([topic]) => (
                  <li key={topic}>
                    {topic} — has both high confidence and a miss/partial. Consider the next change in this area by hand, or another viva.
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-8 text-sm text-muted">
            Suggestions drawn from the research recommendations: keep some work AI-free in thin areas, use AI to explain rather than only produce, and turn gaps into the next deliberate practice step.
          </p>
        </>
      )}
    </section>
  );
}
