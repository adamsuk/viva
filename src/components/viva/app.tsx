import { BUILT_ON, FURTHER_READING } from "@/viva/model";
import { buildInfo, commitUrl, formatLondon, shortSha } from "@/viva/build-info";
import { doneCount, useViva } from "@/viva/store";
import { ChangelogEntries } from "@/components/viva/changelog";
import { Disclosure } from "@/components/viva/disclosure";
import { Guide } from "@/components/viva/guide";
import { Home } from "@/components/viva/home";
import { Rail } from "@/components/viva/rail";
import { Stage } from "@/components/viva/stage";
import { useHashRoute } from "@/components/viva/use-hash-route";

export function VivaApp() {
  const view = useViva((s) => s.view);
  const setView = useViva((s) => s.setView);
  const reset = useViva((s) => s.reset);
  const notice = useViva((s) => s.notice);
  const clearNotice = useViva((s) => s.clearNotice);
  const count = useViva((s) => doneCount(s.walk));
  useHashRoute();

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-wide text-muted">
                AI, code review and understanding
              </p>
              <h1 className="font-display text-4xl leading-none text-ink">Viva</h1>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
              <a
                href="https://github.com/adamsuk/viva"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-steel underline underline-offset-4 hover:text-steel-2"
              >
                View on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 shrink-0 rounded-md px-3 text-sm font-medium text-steel underline-offset-4 hover:underline"
              >
                Start over
              </button>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-muted sm:text-base">
            Research notes and a guide on AI in code review, what it does to juniors and seniors,
            and how to check that people understand what they post and merge. One pull request,
            eight stations. Every claim is labelled by how strong its evidence is.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav
              aria-label="Views"
              className="grid grid-cols-3 gap-1 rounded-xl bg-paper-2 p-1 sm:flex"
            >
              <Seg label="Home" active={view === "home"} onClick={() => setView("home")} />
              <Seg label="Walk the PR" active={view === "walk"} onClick={() => setView("walk")} />
              <Seg label="The guide" active={view === "guide"} onClick={() => setView("guide")} />
            </nav>
            <p className="font-mono text-xs tabular-nums text-faint">
              PR #212 · {count} of 8 stations done
            </p>
          </div>
          {notice ? (
            <button
              type="button"
              onClick={clearNotice}
              className="rounded-lg border border-line bg-hold-bg px-4 py-3 text-left text-sm text-ink"
            >
              {notice}
            </button>
          ) : null}
        </div>
      </header>

      {view === "home" ? (
        <Home />
      ) : view === "walk" ? (
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start">
          <Rail />
          <Stage />
        </div>
      ) : (
        <Guide />
      )}

      <BuiltOn />
    </main>
  );
}

function Seg({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "min-h-11 whitespace-nowrap rounded-lg px-2 text-sm font-medium transition-colors duration-150 sm:px-4 " +
        (active ? "bg-ink text-paper" : "text-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

function BuiltOn() {
  return (
    <footer aria-labelledby="built-on" className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
      <div className="border-t border-line pt-6">
        <Disclosure id="built-on" title="Built on">
          <p className="mt-2 max-w-2xl text-sm text-muted">Viva started from these four pieces.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BUILT_ON.map((ref) => (
              <li key={ref.id} className="rounded-2xl border border-line bg-paper p-4">
                <p className="font-mono text-xs text-faint">
                  {ref.publication} · {ref.date}
                </p>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-display text-lg leading-snug text-ink underline-offset-4 hover:underline"
                >
                  {ref.title}
                </a>
                <p className="mt-1 text-sm text-steel">{ref.author}</p>
                <p className="mt-2 text-sm text-muted">{ref.took}</p>
              </li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure id="further-reading" title="Further reading" className="mt-4">
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every source behind the evidence and the recommendations, grouped by topic and dated.
            Figures in this area change within months, so check the date.
          </p>
          {FURTHER_READING.map((group) => (
            <section key={group.heading} aria-label={group.heading} className="mt-4">
              <h3 className="font-mono text-xs text-muted">{group.heading}</h3>
              <ul className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {group.refs.map((ref) => (
                  <li key={ref.id} className="text-sm">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline underline-offset-4 hover:text-steel"
                    >
                      {ref.title}
                    </a>
                    <span className="text-muted">
                      . {ref.author}, {ref.publication}, {ref.date}.
                    </span>
                    <p className="mt-1 text-muted">{ref.took}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Disclosure>
        <Disclosure id="changelog" title="Changelog" className="mt-4">
          <ChangelogEntries />
        </Disclosure>
        <LastUpdated />
      </div>
    </footer>
  );
}

function LastUpdated() {
  const info = buildInfo();
  if (!info) return null;
  return (
    <p className="mt-6 font-mono text-xs text-faint">
      Last updated <time dateTime={info.iso}>{formatLondon(info.iso)}</time>
      {info.sha ? (
        <>
          {" · "}
          <a
            href={commitUrl(info.sha)}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-steel"
          >
            {shortSha(info.sha)}
          </a>
        </>
      ) : null}
    </p>
  );
}
