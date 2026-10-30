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
      className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-4 lg:flex-col lg:overflow-visible lg:pb-0"
    >
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
              "flex min-h-11 min-w-40 shrink-0 items-center gap-3 rounded-lg border px-3 text-left transition-colors duration-150 lg:min-w-0 lg:w-full " +
              (selected
                ? "border-ink bg-ink text-paper"
                : locked
                  ? "border-line bg-paper text-faint"
                  : "border-line bg-paper text-ink hover:border-ink")
            }
          >
            <span className="font-mono text-xs tabular-nums">{station.index}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-tight">{station.name}</span>
              <span className={"block text-xs " + (selected ? "text-paper/70" : "text-faint")}>
                {station.part}
              </span>
            </span>
            <span className="font-mono text-xs uppercase tracking-wide" aria-hidden="true">
              {done ? "Done" : locked ? "Wait" : selected ? "Now" : ""}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
