import { HOMEPAGE } from "@/viva/self-audit";
import { EXPERIMENTS, OPEN_GROUND } from "@/viva/model";
import { AGENTS, SKILLS, installCommand } from "@/viva/skills-data";
import { useViva } from "@/viva/store";
import { Parts } from "@/components/viva/parts";

const PLANNED = EXPERIMENTS.filter((e) => e.status === "Planned");

export function Home() {
  const setView = useViva((s) => s.setView);
  return (
    <>
      <section
        aria-labelledby="home-headline"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
      >
        <h2
          id="home-headline"
          className="font-display text-5xl leading-[1.02] text-ink italic sm:text-7xl"
        >
          {HOMEPAGE.headline}
        </h2>
        <p className="mt-6 max-w-3xl font-display text-xl leading-snug text-muted sm:text-2xl">
          {HOMEPAGE.thesis}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ActionButton primary onClick={() => setView("skills")}>
            Get the skills
          </ActionButton>
          <ActionButton onClick={() => setView("map")}>Open the personal map</ActionButton>
          <ActionButton onClick={() => setView("guide")}>Read the guide</ActionButton>
        </div>
      </section>

      <section
        id="skills-intro"
        aria-labelledby="home-skills"
        className="mx-auto max-w-6xl px-4 pb-8 sm:px-6"
      >
        <h3
          id="home-skills"
          className="font-mono text-xs uppercase tracking-[0.18em] text-margin"
        >
          The skills
        </h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {SKILLS.map((s) => (
            <article key={s.name} className="rounded-2xl border border-line bg-paper p-5">
              <h4 className="font-display text-2xl">{s.name}</h4>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
              <p className="mt-2 font-mono text-xs text-faint">Invoke: {s.invoke}</p>
              <code className="mt-3 block break-all rounded border border-line bg-paper-2 px-2 py-1 font-mono text-xs">
                {installCommand(s.name)}
              </code>
            </article>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm text-muted">
          Works in {AGENTS.map((a) => a.name).join(", ")} and other Agent Skills hosts. Each check
          is written to a log on your own machine, <code className="font-mono text-xs">~/.agents/viva-log.md</code>.
          Nothing leaves the machine. Install options and keeping them updated are on the{" "}
          <TextLink onClick={() => setView("skills")}>Skills page</TextLink>.
        </p>
        <h3 className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-margin">
          Why a viva
        </h3>
        <p className="mt-2 max-w-2xl text-base text-muted">{HOMEPAGE.why}</p>
      </section>

      <section
        aria-labelledby="home-direction"
        className="mx-auto max-w-6xl px-4 pb-8 sm:px-6"
      >
        <h3
          id="home-direction"
          className="font-mono text-xs uppercase tracking-[0.18em] text-margin"
        >
          Where the open ground is
        </h3>
        <ul className="mt-2 grid max-w-3xl gap-2 text-sm text-ink">
          {OPEN_GROUND.map((line) => (
            <li key={line} className="border-b border-line py-2 pl-1">
              {line}
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-margin">
          Experiments planned
        </h3>
        <ul className="mt-2 grid max-w-3xl gap-2 text-sm text-ink">
          {PLANNED.map((e) => (
            <li key={e.id} className="border-b border-line py-2 pl-1">
              {e.text}
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-margin">
          The direction
        </h3>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          A personal practice companion with almost zero friction: a private, longitudinal map of
          understanding built from many small checks, with thin areas turned into next steps. No
          accounts, no team views, no hard gates. The{" "}
          <TextLink onClick={() => setView("map")}>personal map</TextLink> is the first local view
          of it. Scope and what is deferred are in{" "}
          <a
            href="https://github.com/adamsuk/viva/blob/main/docs/mvp-platform.md"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-4 hover:text-accent-2"
          >
            docs/mvp-platform.md
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
        <p className="mt-3 max-w-3xl text-sm text-muted">
          The evidence behind each claim is in{" "}
          <TextLink onClick={() => setView("guide", "evidence")}>the guide</TextLink>, labelled by
          strength. To see where a question fits in review, open the{" "}
          <TextLink onClick={() => setView("walk")}>worked example</TextLink>: {HOMEPAGE.walk} Or{" "}
          <TextLink onClick={() => setView("guide", "audit")}>audit your team</TextLink>.
        </p>
      </section>
      <Parts />
    </>
  );
}

function TextLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-accent underline underline-offset-4 hover:text-accent-2"
    >
      {children}
    </button>
  );
}

function ActionButton({
  primary = false,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "min-h-11 rounded-2xl border px-5 font-display text-lg transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent " +
        (primary
          ? "border-accent bg-accent text-on-accent hover:bg-accent-2"
          : "border-line bg-paper text-ink hover:border-accent")
      }
    >
      {children} →
    </button>
  );
}
