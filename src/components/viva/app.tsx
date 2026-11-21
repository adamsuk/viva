import { BUILT_ON, FURTHER_READING } from "@/viva/model";
import { buildInfo, commitUrl, formatLondon, shortSha } from "@/viva/build-info";
import { doneCount, useViva } from "@/viva/store";
import { ChangelogEntries } from "@/components/viva/changelog";
import { Disclosure } from "@/components/viva/disclosure";
import { Guide } from "@/components/viva/guide";
import { Home } from "@/components/viva/home";
import { PersonalMap } from "@/components/viva/personal-map";
import { Rail } from "@/components/viva/rail";
import { SetupPanel } from "@/components/viva/setup";
import { Skills } from "@/components/viva/skills";
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
      <header className="border-b-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 border-b border-line py-2 text-xs">
            <p className="font-mono uppercase tracking-[0.18em] text-muted">
              An examination of AI in code review
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <a
                href="https://github.com/adamsuk/viva"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center px-2 font-medium text-accent underline underline-offset-4 hover:text-accent-2"
              >
                GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={reset}
                className="min-h-11 shrink-0 px-2 font-medium text-accent underline-offset-4 hover:underline"
              >
                Start over
              </button>
            </div>
          </div>
          <div className="grid gap-3 py-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end sm:gap-8">
            <h1 className="font-display text-6xl leading-[0.85] text-ink italic sm:text-7xl">
              Viva<span className="text-margin">.</span>
            </h1>
            <p className="max-w-2xl text-sm text-muted sm:pb-1 sm:text-base">
              Research notes and a guide on AI in code review, what it does to juniors and seniors,
              and how to check that people understand what they post and merge. One pull request,
              eight stations, every claim graded by the strength of its evidence.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <nav aria-label="Views" className="-mb-0.5 flex gap-4 sm:gap-6">
              <Tab label="Home" active={view === "home"} onClick={() => setView("home")} />
              <Tab label="Walk the PR" active={view === "walk"} onClick={() => setView("walk")} />
              <Tab label="The guide" active={view === "guide"} onClick={() => setView("guide")} />
              <Tab label="Personal map" active={view === "map"} onClick={() => setView("map")} />
              <Tab label="Skills" active={view === "skills"} onClick={() => setView("skills")} />
            </nav>
            <Progress count={count} />
          </div>
        </div>
      </header>
      {notice ? (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <button
            type="button"
            onClick={clearNotice}
            className="w-full border-l-4 border-margin bg-fail-bg px-4 py-3 text-left text-sm text-ink"
          >
            {notice}
          </button>
        </div>
      ) : null}

      {view === "home" ? (
        <Home />
      ) : view === "walk" ? (
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:px-6">
          <SetupPanel />
          <div className="grid gap-4 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start">
            <Rail />
            <Stage />
          </div>
        </div>
      ) : view === "map" ? (
        <PersonalMap />
      ) : view === "skills" ? (
        <Skills />
      ) : (
        <Guide />
      )}

      <BuiltOn />
    </main>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "min-h-11 whitespace-nowrap border-b-[3px] text-sm font-medium transition-colors duration-150 " +
        (active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

/** Eight boxes, one per station, ticked as the PR clears them. */
function Progress({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 pb-3 sm:pb-2.5">
      <span className="font-mono text-xs tabular-nums text-faint">PR #212</span>
      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className={
              "h-3 w-3 border " + (i < count ? "border-accent bg-accent" : "border-line bg-paper")
            }
          />
        ))}
      </span>
      <span className="sr-only">{count} of 8 stations done</span>
    </div>
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
                <p className="mt-1 text-sm text-accent">{ref.author}</p>
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
                      className="text-ink underline underline-offset-4 hover:text-accent"
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
            className="underline underline-offset-4 hover:text-accent"
          >
            {shortSha(info.sha)}
          </a>
        </>
      ) : null}
    </p>
  );
}
