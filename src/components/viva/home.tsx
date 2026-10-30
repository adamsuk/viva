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
        <h2 id="home-headline" className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          {HOMEPAGE.headline}
        </h2>
        <p className="mt-4 max-w-3xl font-display text-xl leading-snug text-ink sm:text-2xl">
          {HOMEPAGE.thesis}
        </p>
        <h3 className="mt-8 font-mono text-xs text-muted">Why a viva</h3>
        <p className="mt-2 max-w-2xl text-base text-muted">{HOMEPAGE.why}</p>
        <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          <Cta label="Walk the PR" detail={HOMEPAGE.walk} primary onClick={() => setView("walk")} />
          <Cta
            label="Audit your team"
            detail={HOMEPAGE.audit}
            onClick={() => setView("guide", "audit")}
          />
        </div>
        <h3 className="mt-10 font-mono text-xs text-muted">Where the open ground is</h3>
        <ul className="mt-2 grid max-w-3xl gap-2 text-sm text-ink">
          {OPEN_GROUND.map((line) => (
            <li key={line} className="rounded-lg border border-line bg-paper px-3 py-2">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          The evidence behind each claim is in{" "}
          <button
            type="button"
            onClick={() => setView("guide", "evidence")}
            className="text-steel underline underline-offset-4 hover:text-steel-2"
          >
            the guide
          </button>
          , labelled by strength.
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
        "flex min-h-11 flex-col items-start rounded-2xl border p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-steel " +
        (primary
          ? "border-ink bg-ink text-paper hover:bg-steel"
          : "border-line bg-paper text-ink hover:border-steel")
      }
    >
      <span className="font-display text-xl">{label} →</span>
      <span className={"mt-1 text-sm " + (primary ? "text-paper/80" : "text-muted")}>{detail}</span>
    </button>
  );
}
