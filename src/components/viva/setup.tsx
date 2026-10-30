import { CHECK_METHODS, MODES, RECORD_METHODS, type Setup } from "@/viva/model";
import { useViva } from "@/viva/store";

/** How the walk is set up: who builds, and which of Viva's own ideas a team uses, if any. */
export function SetupPanel() {
  const setup = useViva((s) => s.walk.setup);
  const configure = useViva((s) => s.configure);
  return (
    <details className="group border border-line bg-paper" open>
      <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-2 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Set up the walk
        </span>
        <span className="text-sm text-ink">
          {MODES.find((m) => m.id === setup.mode)!.label} ·{" "}
          {CHECK_METHODS.find((m) => m.id === setup.check)!.label} ·{" "}
          {RECORD_METHODS.find((m) => m.id === setup.record)!.label}
        </span>
      </summary>
      <div className="grid gap-4 border-t border-line p-4 lg:grid-cols-3">
        <Options
          legend="Who builds the change?"
          options={MODES}
          value={setup.mode}
          onChoose={(mode) => configure({ mode })}
        />
        <Options
          legend="Follow-up check"
          options={CHECK_METHODS}
          value={setup.check}
          onChoose={(check) => configure({ check })}
        />
        <Options
          legend="What is kept"
          options={RECORD_METHODS}
          value={setup.record}
          onChoose={(record) => configure({ record })}
          disabled={(id) => id === "map" && setup.check === "none"}
        />
      </div>
      <p className="border-t border-line px-4 py-2 text-xs text-muted">
        The follow-up check and the map are Viva's own product idea, and untested. Swap them for
        something else or leave them out: the rest of the walk still holds. Changing the setup
        starts the walk again.
      </p>
    </details>
  );
}

function Options<T extends Setup[keyof Setup]>({
  legend,
  options,
  value,
  onChoose,
  disabled,
}: {
  legend: string;
  options: { id: T; label: string; detail: string }[];
  value: T;
  onChoose: (id: T) => void;
  disabled?: (id: T) => boolean;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-2 grid gap-1">
        {options.map((o) => {
          const off = disabled?.(o.id) ?? false;
          return (
            <label
              key={o.id}
              className={
                "flex min-h-11 gap-2 border-l-[3px] px-2 py-1.5 text-sm " +
                (off
                  ? "cursor-not-allowed border-l-transparent opacity-50"
                  : value === o.id
                    ? "cursor-pointer border-l-accent bg-accent-bg"
                    : "cursor-pointer border-l-transparent hover:bg-paper-2")
              }
            >
              <input
                type="radio"
                name={legend}
                className="mt-0.5"
                checked={value === o.id}
                disabled={off}
                onChange={() => onChoose(o.id)}
              />
              <span>
                <span className="font-medium text-ink">{o.label}. </span>
                <span className="text-muted">
                  {off ? "Needs a follow-up check to feed it." : o.detail}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
