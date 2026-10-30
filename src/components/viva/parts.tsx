import { PARTS } from "@/viva/model";

export function Parts() {
  return (
    <section
      id="parts"
      aria-labelledby="parts-heading"
      className="mx-auto max-w-6xl scroll-mt-4 px-4 py-6 sm:px-6"
    >
      <h2
        id="parts-heading"
        className="border-t-2 border-ink pt-3 font-display text-4xl text-ink italic"
      >
        The parts
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        These are the things a person may be asked to defend. Stations are where an author, a
        reviewer, or a bot touches them. Learn the part and you can recognise it in any team, not
        just this one.
      </p>
      <ol className="mt-6 grid gap-x-10 sm:grid-cols-2">
        {PARTS.map((part, i) => (
          <li key={part.name} className="flex gap-4 border-b border-line py-4">
            <p className="font-display text-2xl leading-none text-accent italic">
              {String.fromCharCode(97 + i)})
            </p>
            <div>
              <h3 className="font-display text-2xl leading-tight text-ink">{part.name}</h3>
              <p className="mt-2 text-sm text-ink">{part.definition}</p>
              <p className="mt-3 text-sm text-muted">
                <span className="font-medium text-accent">{part.station}. </span>
                {part.here}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
