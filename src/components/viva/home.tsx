import { HOMEPAGE } from "@/viva/self-audit";
import { OPEN_GROUND } from "@/viva/model";
import { useViva } from "@/viva/store";
import { Parts } from "@/components/viva/parts";

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
        <h3 className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-margin">
          Why a viva
        </h3>
        <p className="mt-2 max-w-2xl text-base text-muted">{HOMEPAGE.why}</p>
        <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          <Cta label="Walk the PR" detail={HOMEPAGE.walk} primary onClick={() => setView("walk")} />
          <Cta
            label="Audit your team"
            detail={HOMEPAGE.audit}
            onClick={() => setView("guide", "audit")}
          />
          <Cta
            label="Personal map"
            detail="Drop the viva skill log. See thin areas and the next practice step. Local only."
            onClick={() => setView("map")}
          />
          <Cta
            label="Skills"
            detail="Install the viva skills in Claude Code, Cursor, Codex or Grok. Keep them updated."
            onClick={() => setView("skills")}
          />
        </div>
        <h3 className="mt-12 font-mono text-xs uppercase tracking-[0.18em] text-margin">
          Where the open ground is
        </h3>
        <ul className="mt-2 grid max-w-3xl gap-2 text-sm text-ink">
          {OPEN_GROUND.map((line) => (
            <li key={line} className="border-b border-line py-2 pl-1">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          The evidence behind each claim is in{" "}
          <button
            type="button"
            onClick={() => setView("guide", "evidence")}
            className="text-accent underline underline-offset-4 hover:text-accent-2"
          >
            the guide
          </button>
          , labelled by strength. The personal map is the first local view of the private picture.
        </p>
      </section>
      <Parts />
    </>
  );
}

function Cta({
  label,
  detail,
  primary = false,
  onClick,
}: {
  label: string;
  detail: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex min-h-11 flex-col items-start rounded-2xl border p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent " +
        (primary
          ? "border-accent bg-accent text-on-accent hover:bg-accent-2"
          : "border-line bg-paper text-ink hover:border-accent")
      }
    >
      <span className="font-display text-xl">{label} →</span>
      <span className={"mt-1 text-sm " + (primary ? "text-on-accent/85" : "text-muted")}>
        {detail}
      </span>
    </button>
  );
}
