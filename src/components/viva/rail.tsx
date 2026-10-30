import { STATIONS, stationIndex } from "@/viva/model";
import { frontier, stationDone, useViva } from "@/viva/store";

export function Rail() {
  const focus = useViva((s) => s.focus);
  const focusStation = useViva((s) => s.focusStation);
  const walk = useViva((s) => s.walk);
  const frontierIndex = stationIndex(frontier(walk));

  return (
    <nav
      aria-label="Stations"
      className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-ink lg:pb-0"
    >
      <p className="hidden py-2 font-mono text-xs uppercase tracking-[0.18em] text-muted lg:block">
        Questions
      </p>
      {STATIONS.map((station) => {
        const locked = stationIndex(station.id) > frontierIndex;
        const selected = focus === station.id;
        const done = stationDone(walk, station.id);
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => focusStation(station.id)}
            aria-current={selected ? "step" : undefined}
            className={
              "flex min-h-11 min-w-40 shrink-0 items-baseline gap-3 border-l-[3px] px-3 py-2 text-left transition-colors duration-150 lg:min-w-0 lg:w-full lg:border-b lg:border-b-line " +
              (selected
                ? "border-l-accent bg-accent-bg text-ink"
                : locked
                  ? "border-l-transparent text-faint"
                  : "border-l-transparent text-ink hover:bg-paper-2")
            }
          >
            <span className="font-display text-lg italic tabular-nums text-accent">
              {Number(station.index)}.
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-tight">{station.name}</span>
              <span className="block text-xs text-faint">{station.part}</span>
            </span>
            <span
              className={"font-display text-lg " + (done ? "text-pass" : "text-faint")}
              aria-label={done ? "done" : locked ? "not yet" : undefined}
            >
              {done ? "✓" : locked ? "·" : ""}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
