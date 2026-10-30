import { useState } from "react";
import {
  ADOPTION_STAGES,
  CHECK_METHODS,
  FACTORY,
  NOT_APPLICABLE,
  RECORD_METHODS,
  CLAIMS,
  CLAIM_TOPICS,
  EXPERIMENTS,
  GAPS,
  GUIDE,
  OPEN_QUESTIONS,
  RECOMMENDATIONS,
  STATIONS,
  TOOLS,
  TOOLS_CHECKED,
  type Maturity,
} from "@/viva/model";
import { AuditTeam } from "@/components/viva/audit";
import { Assess } from "@/components/viva/assess";
import {
  MaturityLegend,
  RecommendationList,
  Sources,
  StrengthBadge,
  StrengthLegend,
} from "@/components/viva/recommendations";
import { StageBadge } from "@/components/viva/stage";

export function Guide() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-6 sm:px-6">
      <section aria-labelledby="stages-heading">
        <h2
          id="stages-heading"
          className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
        >
          Bringing checks in
        </h2>
        <p className="mt-2 max-w-2xl text-base text-muted">
          Start with ownership, before any quiz. Add one small question once people own their
          changes. Build a map only when the questions are trusted, and keep it private.
        </p>
        <ol className="mt-4 grid gap-3 lg:grid-cols-3">
          {ADOPTION_STAGES.map((s) => (
            <li key={s.stage} className="rounded-2xl border border-line bg-paper p-4">
              <StageBadge stage={s.stage} />
              <p className="mt-2 text-sm text-ink">{s.summary}</p>
              <Sources ids={s.sources} />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="loop-heading">
        <h2
          id="loop-heading"
          className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
        >
          Where people stay in the loop
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line font-mono text-xs text-muted">
              <tr>
                <th className="p-3">Station</th>
                <th className="p-3">AI</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Human in the loop</th>
              </tr>
            </thead>
            <tbody>
              {STATIONS.map((s) => (
                <tr key={s.id} className="border-b border-line align-top last:border-0">
                  <th scope="row" className="p-3 font-medium text-ink">
                    <span className="font-mono text-xs text-faint">{s.index} </span>
                    {s.name}
                  </th>
                  <td className="p-3 text-ink">{GUIDE[s.id].ai}</td>
                  <td className="p-3">
                    <StageBadge stage={GUIDE[s.id].stage} />
                  </td>
                  <td className="p-3 text-ink">{GUIDE[s.id].human}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Variations />
      <Recommendations />
      <Evidence />
      <PriorArt />
      <OpenQuestions />
      <AuditTeam />
      <Assess />
    </div>
  );
}

function Recommendations() {
  const [filter, setFilter] = useState<Maturity | "All">("All");
  const items = RECOMMENDATIONS.filter((r) => filter === "All" || r.maturity === filter);
  return (
    <section aria-labelledby="recs-heading">
      <h2
        id="recs-heading"
        className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
      >
        Recommendations, labelled
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        Most of this is new. Each recommendation carries one of two labels, so settled practice
        stays apart from newer ideas.
      </p>
      <div className="mt-3">
        <MaturityLegend />
      </div>
      <div className="mt-4 flex flex-wrap gap-1" role="group" aria-label="Filter by label">
        {(["All", "Best practice", "Cutting edge"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={
              "min-h-11 rounded-lg px-3 text-sm font-medium " +
              (filter === f
                ? "bg-accent text-on-accent"
                : "border border-line text-muted hover:text-ink")
            }
          >
            {f} (
            {f === "All"
              ? RECOMMENDATIONS.length
              : RECOMMENDATIONS.filter((r) => r.maturity === f).length}
            )
          </button>
        ))}
      </div>
      <div className="mt-4">
        <RecommendationList items={items} show="station" withTools />
      </div>
    </section>
  );
}

function Evidence() {
  return (
    <section id="evidence" aria-labelledby="evidence-heading" className="scroll-mt-4">
      <h2
        id="evidence-heading"
        className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
      >
        The evidence
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        What the research says, labelled by strength. Several figures here are a few months old and
        move fast. Where a secondary source disagrees with the primary one, the primary one wins.
      </p>
      <div className="mt-3">
        <StrengthLegend />
      </div>
      {CLAIM_TOPICS.map((topic) => (
        <section key={topic} aria-label={topic} className="mt-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-margin">{topic}</h3>
          <ul className="mt-2 grid gap-3 lg:grid-cols-2">
            {CLAIMS.filter((c) => c.topic === topic).map((c) => (
              <li key={c.id} className="rounded-xl border border-line bg-paper p-3">
                <StrengthBadge strength={c.strength} />
                <p className="mt-2 text-sm text-ink">{c.text}</p>
                {c.caveat ? <p className="mt-1 text-sm text-muted">{c.caveat}</p> : null}
                <Sources ids={c.sources} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}

function PriorArt() {
  return (
    <section id="prior-art" aria-labelledby="prior-art-heading" className="scroll-mt-4">
      <h2
        id="prior-art-heading"
        className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
      >
        Prior art
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        Tools that already exist, checked on {TOOLS_CHECKED}. This is not an endorsement. None of
        the comprehension checks has published evidence that it works.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <li key={t.name} className="rounded-2xl border border-line bg-paper p-4">
            <a
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="font-display text-xl text-ink underline-offset-4 hover:underline"
            >
              {t.name}
            </a>
            <p className="mt-2 text-sm text-ink">{t.what}</p>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-accent">Evidence. </span>
              {t.evidence}
            </p>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-margin">
        Gaps no tool covers yet
      </h3>
      <ul className="mt-2 grid gap-2 text-sm">
        {Object.entries(GAPS).map(([id, gap]) => (
          <li key={id} className="rounded-lg border border-line bg-paper px-3 py-2 text-ink">
            <span className="font-mono text-xs text-faint">{id} · </span>
            {gap}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OpenQuestions() {
  return (
    <section aria-labelledby="open-heading">
      <h2
        id="open-heading"
        className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
      >
        Open questions and experiments
      </h2>
      <ol className="mt-4 grid max-w-3xl list-decimal gap-2 pl-5 text-sm text-ink marker:text-faint">
        {OPEN_QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line font-mono text-xs text-muted">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Experiment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Result</th>
            </tr>
          </thead>
          <tbody>
            {EXPERIMENTS.map((e) => (
              <tr key={e.id} className="border-b border-line align-top last:border-0">
                <td className="p-3 font-mono text-xs text-faint">{e.id}</td>
                <td className="p-3 text-ink">{e.text}</td>
                <td className="p-3 font-mono text-xs text-muted">{e.status}</td>
                <td className="p-3 text-muted">{e.result || "None yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Variations() {
  return (
    <section id="variations" aria-labelledby="variations-heading" className="scroll-mt-4">
      <h2
        id="variations-heading"
        className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
      >
        Without the product idea, or inside a factory
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        The follow-up check and the map are Viva's own idea, and nothing has tested them yet. A team
        can swap them for something else or leave them out. Stations 1 to 4 and 8 stand on their
        own, and they are the Start stage of this guide. Set this up at the top of the walk.
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-margin">
            Follow-up check
          </h3>
          <dl className="mt-2 grid gap-2 text-sm">
            {CHECK_METHODS.map((m) => (
              <div key={m.id} className="border-b border-line pb-2">
                <dt className="font-medium text-ink">{m.label}</dt>
                <dd className="text-muted">{m.id === "none" ? NOT_APPLICABLE.viva : m.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-margin">
            What is kept
          </h3>
          <dl className="mt-2 grid gap-2 text-sm">
            {RECORD_METHODS.map((m) => (
              <div key={m.id} className="border-b border-line pb-2">
                <dt className="font-medium text-ink">{m.label}</dt>
                <dd className="text-muted">{m.id === "none" ? NOT_APPLICABLE.map : m.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-margin">
        Inside a software factory
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        In{" "}
        <a
          href="https://adamsuk.github.io/line/"
          target="_blank"
          rel="noreferrer"
          className="text-accent underline underline-offset-4 hover:text-accent-2"
        >
          Line
        </a>
        , agents build from work orders and people plan and approve. The PR still walks the same
        eight stations, but the author is an agent. The person who has to defend the change is the
        one who wrote the work order and the one who approves it.
      </p>
      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line font-mono text-xs text-muted">
            <tr>
              <th className="p-3">Station</th>
              <th className="p-3">Beside Line's</th>
              <th className="p-3">Who answers</th>
              <th className="p-3">What changes</th>
            </tr>
          </thead>
          <tbody>
            {STATIONS.map((st) => (
              <tr key={st.id} className="border-b border-line align-top last:border-0">
                <th scope="row" className="p-3 font-medium text-ink">
                  <span className="font-mono text-xs text-faint">{st.index} </span>
                  {st.name}
                </th>
                <td className="p-3 text-muted">{FACTORY[st.id].line}</td>
                <td className="p-3 text-ink">{FACTORY[st.id].owner}</td>
                <td className="p-3 text-ink">{FACTORY[st.id].change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
