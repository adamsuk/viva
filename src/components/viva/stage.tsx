import type { ReactNode } from "react";
import { RecommendationList, Sources, StrengthBadge } from "@/components/viva/recommendations";
import {
  BOT_COMMENTS,
  CHECK_METHODS,
  CONFIDENCE,
  DIFF,
  DRAFT_CHOICES,
  FACTORY,
  FACTORY_DRAFT_CHOICES,
  FACTORY_LOOP_CHOICES,
  FACTORY_POST_CHOICES,
  GUIDE,
  JOURNAL,
  NOT_APPLICABLE,
  LOOP_CHOICES,
  MAP_CHOICES,
  MAP_HISTORY,
  MAP_TOPIC,
  MERGE_CHOICES,
  OUTCOME,
  POST_CHOICES,
  PR,
  QUESTION,
  RECORD_METHODS,
  RECOMMENDATIONS,
  REVIEW_CHOICES,
  nextStation,
  notApplicable,
  stationFor,
  type Outcome,
  type StationId,
} from "@/viva/model";
import { stationDone, useViva, vivaOutcome, type WalkState } from "@/viva/store";

export function Stage() {
  const focus = useViva((s) => s.focus);
  const setup = useViva((s) => s.walk.setup);
  const station = stationFor(focus, setup);
  const skipped = notApplicable(focus, setup);

  return (
    <article className="border border-line border-t-4 border-t-ink bg-paper p-4 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Question {Number(station.index)} of 8 · {skipped ? "N/A" : station.part}
        </p>
        <p className="font-mono text-xs text-faint">Answered by: {station.owner}</p>
      </div>
      <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">{station.name}</h2>
      <p className="mt-3 max-w-2xl font-display text-xl leading-snug text-muted italic">
        {skipped ? "Not used in this setup." : station.thesis}
      </p>

      <div className="mt-6">
        {skipped ? (
          <NotApplicable id={focus} />
        ) : (
          <>
            {focus === "draft" && <Draft />}
            {focus === "post" && <Post />}
            {focus === "bot" && <Bot />}
            {focus === "review" && <Review />}
            {focus === "viva" && <Viva />}
            {focus === "merge" && <Merge />}
            {focus === "map" && <MapStation />}
            {focus === "loop" && <Loop />}
          </>
        )}
      </div>

      {!skipped && (focus === "viva" || focus === "map") ? <MethodBasis id={focus} /> : null}
      {setup.mode === "factory" ? <FactoryPanel id={focus} /> : null}

      {skipped ? null : (
        <>
          <aside className="mt-8 border-l-4 border-margin bg-paper-2 p-4">
            <p className="font-display text-lg italic text-margin">Examiner's note</p>
            <p className="mt-1 font-display text-lg leading-snug text-ink">{station.lesson}</p>
            {station.sources ? <Sources ids={station.sources} /> : null}
          </aside>

          <GuidePanel id={focus} />
        </>
      )}
    </article>
  );
}

function NotApplicable({ id }: { id: StationId }) {
  const setup = useViva((s) => s.walk.setup);
  const basis =
    id === "viva"
      ? CHECK_METHODS.find((m) => m.id === setup.check)
      : id === "map"
        ? RECORD_METHODS.find((m) => m.id === setup.record)
        : null;
  return (
    <div className="grid gap-4">
      <div className="border border-dashed border-line p-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">Not applicable</p>
        <p className="mt-2 text-sm text-ink">{NOT_APPLICABLE[id]}</p>
        {basis ? (
          <>
            <p className="mt-3 flex flex-wrap items-baseline gap-2 text-sm text-muted">
              <StrengthBadge strength={basis.strength} />
              <span>{basis.basis}</span>
            </p>
            <Sources ids={basis.sources} />
          </>
        ) : null}
      </div>
      <Continue id={id} />
    </div>
  );
}

/** How strong the evidence is for the follow-up check or record in use. */
function MethodBasis({ id }: { id: "viva" | "map" }) {
  const setup = useViva((s) => s.walk.setup);
  const m =
    id === "viva"
      ? CHECK_METHODS.find((c) => c.id === setup.check)!
      : RECORD_METHODS.find((c) => c.id === setup.record)!;
  return (
    <aside className="mt-8 border border-dashed border-line p-4">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
        Evidence for {m.label.toLowerCase()}
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm text-muted">
        <StrengthBadge strength={m.strength} />
        <span>{m.basis}</span>
      </p>
      <Sources ids={m.sources} />
    </aside>
  );
}

/** What changes at this station when the PR comes out of a software factory, as in Line. */
function FactoryPanel({ id }: { id: StationId }) {
  const note = FACTORY[id];
  return (
    <aside className="mt-8 border border-accent/40 bg-accent-bg p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-lg text-accent italic">In a software factory</p>
        <p className="font-mono text-xs text-muted">Beside Line's {note.line}</p>
      </div>
      <p className="mt-1 text-sm text-ink">{note.change}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-2 text-sm text-muted">
        <StrengthBadge strength={note.strength} />
        <span>{note.basis}</span>
      </p>
      <Sources ids={note.sources} />
    </aside>
  );
}

function GuidePanel({ id }: { id: StationId }) {
  const guide = GUIDE[id];
  const recs = RECOMMENDATIONS.filter((r) => r.station === id);
  return (
    <aside className="mt-4 rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">Where people stay in the loop</p>
        <StageBadge stage={guide.stage} />
      </div>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-accent">AI</dt>
          <dd className="mt-1 text-ink">{guide.ai}</dd>
        </div>
        <div>
          <dt className="font-medium text-accent">Human in the loop</dt>
          <dd className="mt-1 text-ink">{guide.human}</dd>
        </div>
      </dl>
      <Sources ids={guide.sources} />
      {recs.length > 0 ? (
        <div className="mt-4 border-t border-line pt-4">
          <p className="font-mono text-xs text-muted">Recommendations</p>
          <div className="mt-2">
            <RecommendationList items={recs} show="stage" withTools />
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="border border-ink px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink">
      {stage === "Start" ? "Start here" : stage}
    </span>
  );
}

function Continue({ id }: { id: StationId }) {
  const walk = useViva((s) => s.walk);
  const advance = useViva((s) => s.advance);
  const next = nextStation(id);
  if (!next || !stationDone(walk, id)) return null;
  const nextStationView = stationFor(next, walk.setup);
  return (
    <div>
      <button
        type="button"
        onClick={advance}
        className="min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-on-accent"
      >
        Continue to {nextStationView.name.toLowerCase()}
        {notApplicable(next, walk.setup) ? " (N/A)" : ""}
      </button>
    </div>
  );
}

/** A set of single-choice cards. Selected card is inked; a sent-back choice is marked. */
function Choices<T extends string>({
  legend,
  options,
  value,
  onChoose,
  sentBack,
}: {
  legend: string;
  options: { id: T; label: string; detail: string }[];
  value: T | null;
  onChoose: (id: T) => void;
  sentBack?: (id: T) => boolean;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => {
          const selected = value === o.id;
          const back = selected && sentBack?.(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChoose(o.id)}
              className={
                "flex min-h-11 flex-col items-start rounded-xl border p-3 text-left transition-colors duration-150 " +
                (back
                  ? "border-fail bg-fail-bg text-ink"
                  : selected
                    ? "border-accent bg-accent-bg text-ink"
                    : "border-line bg-paper text-ink hover:border-ink")
              }
            >
              <span className="text-sm font-medium">{o.label}</span>
              <span className={"mt-1 text-sm " + (selected && !back ? "text-muted" : "text-muted")}>
                {o.detail}
              </span>
              {back ? <span className="mt-2 font-mono text-xs text-fail">Sent back</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="font-mono text-xs text-accent">{label}</p>
      {children}
    </div>
  );
}

function Diff({ highlight }: { highlight?: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md bg-code p-3 font-mono text-xs leading-relaxed text-code-ink">
      {DIFF.map((l, i) => (
        <div
          key={i}
          className={
            (l.kind === "add"
              ? "text-[#b9e3c6]"
              : l.kind === "del"
                ? "text-[#f0b8b0]"
                : "text-code-ink/60") +
            (highlight && l.text.includes(highlight) ? " bg-code-ink/15" : "")
          }
        >
          {l.kind === "add" ? "+ " : l.kind === "del" ? "- " : "  "}
          {l.text}
        </div>
      ))}
    </pre>
  );
}

function Draft() {
  const draft = useViva((s) => s.walk.draft);
  const factory = useViva((s) => s.walk.setup.mode === "factory");
  const choose = useViva((s) => s.choose);
  const options = factory ? FACTORY_DRAFT_CHOICES : DRAFT_CHOICES;
  const picked = options.find((c) => c.id === draft);
  const unread = draft === "delegate" || draft === "checks";
  return (
    <div className="grid gap-4">
      <Panel label={`PR ${PR.id} · ${PR.branch}`}>
        <h3 className="mt-1 font-display text-2xl">{PR.title}</h3>
        <p className="mt-2 text-sm text-muted">{PR.summary}</p>
      </Panel>
      <Choices
        legend={
          factory
            ? "You own the work order. An agent will build it. What do you hand it?"
            : "You are the author. How do you use the AI?"
        }
        options={options}
        value={draft}
        onChoose={(id) => choose("draft", "draft", id)}
        sentBack={(id) => Boolean(FACTORY_DRAFT_CHOICES.find((c) => c.id === id)?.sentBack)}
      />
      {picked && !("sentBack" in picked && picked.sentBack) ? (
        <>
          <p className="rounded-lg border border-line bg-paper-2 p-3 text-sm text-ink">
            {picked.result}
          </p>
          {unread ? (
            <p className="text-sm text-muted">
              {factory
                ? "The agent has opened the PR. You have not read its session or the diff."
                : "The agent's change is ready. You have not looked at it."}
            </p>
          ) : (
            <Diff />
          )}
          <Continue id="draft" />
        </>
      ) : null}
    </div>
  );
}

function Post() {
  const post = useViva((s) => s.walk.post);
  const factory = useViva((s) => s.walk.setup.mode === "factory");
  const choose = useViva((s) => s.choose);
  return (
    <div className="grid gap-4">
      <fieldset>
        <legend className="text-sm font-medium text-ink">
          {factory
            ? "The agent opens the PR. What should the factory require as its description?"
            : "Which description goes on the PR?"}
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(factory ? FACTORY_POST_CHOICES : POST_CHOICES).map((o) => {
            const selected = post === o.id;
            const back = selected && (o.id === "agent" || o.id === "claim");
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={selected}
                onClick={() => choose("post", "post", o.id)}
                className={
                  "flex min-h-11 flex-col items-start rounded-xl border p-3 text-left " +
                  (back
                    ? "border-fail bg-fail-bg"
                    : selected
                      ? "border-ink ring-2 ring-ink"
                      : "border-line hover:border-ink")
                }
              >
                <span className="text-sm font-medium text-ink">{o.label}</span>
                <span className="mt-2 font-mono text-xs leading-relaxed text-muted">{o.body}</span>
                {back ? <span className="mt-2 font-mono text-xs text-fail">Sent back</span> : null}
              </button>
            );
          })}
        </div>
      </fieldset>
      <Continue id="post" />
    </div>
  );
}

function Bot() {
  const triage = useViva((s) => s.walk.triage);
  const factory = useViva((s) => s.walk.setup.mode === "factory");
  const setTriage = useViva((s) => s.triage);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        {factory
          ? "The review agent ran after the gate and staged two comments. Check each against the diff. Send back to the building agent only the ones you would put your name to."
          : "The review bot left two comments. Check each against the diff. Forward the ones you would put your name to. Dismiss the rest."}
      </p>
      <Diff />
      {BOT_COMMENTS.map((c) => {
        const t = triage[c.id];
        const right = t === c.correct;
        return (
          <div key={c.id} className="rounded-xl border border-line p-4">
            <p className="font-mono text-xs text-faint">review-bot · on {c.line}</p>
            <p className="mt-2 text-sm text-ink">{c.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["forward", "dismiss"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={t === v}
                  onClick={() => setTriage(c.id, v)}
                  className={
                    "min-h-11 rounded-md border px-4 text-sm font-medium " +
                    (t === v
                      ? "border-accent bg-accent-bg text-ink"
                      : "border-line text-ink hover:border-ink")
                  }
                >
                  {v === "forward"
                    ? factory
                      ? "Send to the agent"
                      : "Forward as mine"
                    : "Dismiss"}
                </button>
              ))}
            </div>
            {t ? (
              <p
                className={
                  "mt-3 rounded-lg px-3 py-2 text-sm " +
                  (right ? "bg-pass-bg text-pass" : "bg-fail-bg text-fail")
                }
              >
                {right ? c.ifRight : c.ifWrong}
              </p>
            ) : null}
          </div>
        );
      })}
      <Continue id="bot" />
    </div>
  );
}

function Review() {
  const review = useViva((s) => s.walk.review);
  const factory = useViva((s) => s.walk.setup.mode === "factory");
  const check = useViva((s) => s.walk.setup.check);
  const choose = useViva((s) => s.choose);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        {factory
          ? "You are the reviewer, and you approve. The gate is green, the record ties every check to this commit, and the agent has added jitter. This is the ninth agent PR in your queue today."
          : "You are now the reviewer. The checks are green, the description is clear, and the only bot comment left is about jitter."}
      </p>
      <Choices
        legend="What do you do?"
        options={REVIEW_CHOICES}
        value={review}
        onChoose={(id) => choose("review", "review", id)}
        sentBack={(id) => id === "stamp"}
      />
      {review === "read" ? (
        <>
          <p className="text-sm text-muted">
            {factory
              ? "You read the agent's session and trace one failure: the request times out, the loop sleeps, and the retry goes out with the same header."
              : "You trace one failure: the request times out, the loop sleeps, and the retry goes out with the same header."}
            {check === "none"
              ? " You could explain it to someone else, so you approve."
              : factory
                ? ""
                : " You write one question for the author."}
          </p>
          <Diff highlight="Idempotency-Key" />
        </>
      ) : null}
      <Continue id="review" />
    </div>
  );
}

function Viva() {
  const walk = useViva((s) => s.walk);
  const choose = useViva((s) => s.choose);
  const outcome = vivaOutcome(walk);
  const locked = outcome !== null;
  const { mode, check } = walk.setup;
  const intro =
    mode === "factory"
      ? check === "walkthrough"
        ? "You own the work order. You talk the approver through what the agent built, with no agent open. They stop you at the retry loop and ask:"
        : "You are the approver. Before your approval counts, answer one question about the change, with no agent open. Then say how sure you are."
      : check === "walkthrough"
        ? "You are the author. In a five-minute walkthrough, with no agent open, the reviewer stops you at the retry loop and asks:"
        : "You are the author again. Answer without opening the agent. Then say how sure you are.";
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">{intro}</p>
      <Panel label={check === "walkthrough" ? "Asked live" : "One question"}>
        <p className="mt-2 text-base text-ink">{QUESTION.prompt}</p>
        <fieldset className="mt-3" disabled={locked}>
          <legend className="sr-only">Answer</legend>
          <div className="grid gap-2">
            {QUESTION.options.map((o) => (
              <label
                key={o.id}
                className={
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-sm " +
                  (locked && o.id === QUESTION.answer
                    ? "border-pass bg-pass-bg"
                    : locked && o.id === walk.answer
                      ? "border-fail bg-fail-bg"
                      : "border-line")
                }
              >
                <input
                  type="radio"
                  name="viva-answer"
                  className="mt-0.5"
                  checked={walk.answer === o.id}
                  onChange={() => choose("viva", "answer", o.id)}
                />
                <span>{o.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4" disabled={walk.answer === null || locked}>
          <legend className="text-sm font-medium text-ink">
            {check === "walkthrough" ? "How sure did you sound?" : "How sure are you?"}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONFIDENCE.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={walk.confidence === c.id}
                disabled={walk.answer === null || locked}
                onClick={() => choose("viva", "confidence", c.id)}
                className={
                  "min-h-11 rounded-md border px-4 text-sm font-medium disabled:opacity-50 " +
                  (walk.confidence === c.id
                    ? "border-accent bg-accent-bg text-ink"
                    : "border-line text-ink hover:border-ink")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      </Panel>
      {outcome ? (
        <>
          <OutcomeNote outcome={outcome} walk={walk} />
          <ConfidenceGrid outcome={outcome} />
          <button
            type="button"
            onClick={() => {
              choose("viva", "confidence", null);
              choose("viva", "answer", null);
            }}
            className="justify-self-start text-sm text-accent underline underline-offset-4"
          >
            Answer again
          </button>
        </>
      ) : null}
      <Continue id="viva" />
    </div>
  );
}

function OutcomeNote({ outcome, walk }: { outcome: Outcome; walk: WalkState }) {
  const delegated = walk.draft === "delegate" || walk.draft === "checks";
  return (
    <div className="rounded-xl border border-line bg-paper-2 p-4 text-sm">
      <p className="font-display text-xl text-ink">{OUTCOME[outcome].label}</p>
      <p className="mt-1 text-ink">{OUTCOME[outcome].meaning}</p>
      <p className="mt-2 text-muted">{QUESTION.why}</p>
      {delegated ? (
        <p className="mt-2 text-muted">
          {walk.draft === "checks"
            ? "You wrote the checks but never read the session. You knew what the change had to do, not how it did it."
            : "You handed the draft to the agent and never read the loop. Whatever you answered, you were answering about code you had not seen."}
        </p>
      ) : null}
    </div>
  );
}

const GRID: { outcome: Outcome; row: string; col: string }[] = [
  { outcome: "solid", row: "Right", col: "Sure" },
  { outcome: "fragile", row: "Right", col: "Unsure" },
  { outcome: "blind", row: "Wrong", col: "Sure" },
  { outcome: "thin", row: "Wrong", col: "Unsure" },
];

function ConfidenceGrid({ outcome }: { outcome: Outcome }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted">What an answer with confidence tells you</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {GRID.map((g) => (
          <div
            key={g.outcome}
            className={
              "rounded-lg border p-3 text-sm " +
              (g.outcome === outcome
                ? "border-accent bg-accent-bg text-ink"
                : "border-line text-ink")
            }
          >
            <p
              className={
                "font-mono text-xs " + (g.outcome === outcome ? "text-accent" : "text-faint")
              }
            >
              {g.row} · {g.col}
            </p>
            <p className="mt-1 font-medium">{OUTCOME[g.outcome].label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Merge() {
  const walk = useViva((s) => s.walk);
  const choose = useViva((s) => s.choose);
  const outcome = vivaOutcome(walk);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        {walk.setup.mode === "factory"
          ? "The gate is green and your approval is pending. The answer was"
          : "You are the reviewer. The author's answer was"}{" "}
        <span className="font-medium text-ink">
          {outcome ? OUTCOME[outcome].label.toLowerCase() : "not given"}
        </span>
        . Set what an answer does to the merge, for this PR and every one after it.
      </p>
      <Choices
        legend="What does the answer do?"
        options={MERGE_CHOICES}
        value={walk.merge}
        onChoose={(id) => choose("merge", "merge", id)}
        sentBack={(id) => Boolean(MERGE_CHOICES.find((c) => c.id === id)?.sentBack)}
      />
      {walk.merge === "talk" ? (
        <p className="rounded-lg border border-line bg-pass-bg p-3 text-sm text-pass">
          {outcome === "solid" || outcome === "fragile"
            ? "Merged. The answer was right, and it is shown to the author with the reason."
            : "Five minutes on idempotency keys, then merged. The conversation is the point, not the score."}
        </p>
      ) : null}
      <Continue id="merge" />
    </div>
  );
}

function MapStation() {
  const walk = useViva((s) => s.walk);
  const choose = useViva((s) => s.choose);
  const outcome = vivaOutcome(walk) ?? "thin";
  const rows = [{ topic: MAP_TOPIC, outcome, checks: 1, fresh: true }, ...MAP_HISTORY];
  const journal = walk.setup.record === "journal";
  return (
    <div className="grid gap-4">
      {journal ? (
        <Panel label="Your learning log">
          <ul className="mt-2 grid gap-2 text-sm">
            <li className="border border-ink px-3 py-2 text-ink">
              #212:{" "}
              {outcome === "solid"
                ? "explained why the retry reuses the same key."
                : "had to ask why the retry reuses the same key."}
              <span className="ml-2 font-mono text-xs text-accent">new</span>
            </li>
            {JOURNAL.map((line) => (
              <li key={line} className="border border-line px-3 py-2 text-muted">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Written by the person, one line per PR. Nothing is generated or scored.
          </p>
        </Panel>
      ) : (
        <Panel label="Your map">
          <ul className="mt-2 grid gap-2">
            {rows.map((r) => (
              <li
                key={r.topic}
                className={
                  "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm " +
                  ("fresh" in r ? "border-ink" : "border-line")
                }
              >
                <span className="text-ink">
                  {r.topic}
                  {"fresh" in r ? (
                    <span className="ml-2 font-mono text-xs text-accent">new</span>
                  ) : null}
                </span>
                <span className="font-mono text-xs text-muted">
                  {OUTCOME[r.outcome].label} · {r.checks} {r.checks === 1 ? "check" : "checks"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      <Choices
        legend={journal ? "Who can see this log?" : "Who can see this map?"}
        options={MAP_CHOICES}
        value={walk.map}
        onChoose={(id) => choose("map", "map", id)}
        sentBack={(id) => Boolean(MAP_CHOICES.find((c) => c.id === id)?.sentBack)}
      />
      <Continue id="map" />
    </div>
  );
}

function Loop() {
  const walk = useViva((s) => s.walk);
  const choose = useViva((s) => s.choose);
  const setView = useViva((s) => s.setView);
  const outcome = vivaOutcome(walk);
  const { mode, record } = walk.setup;
  const where = record === "map" ? "map" : record === "journal" ? "log" : null;
  const intro = !where
    ? "Nothing was kept, so the next step comes from the review itself: idempotency took the longest to explain. Pick a next step."
    : outcome === "solid"
      ? `Idempotent retries is solid. The thinnest area on your ${where} is auth token refresh. Pick a next step for that.`
      : `Idempotent retries is the thinnest area on your ${where}. Pick a next step.`;
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">{intro}</p>
      <Choices
        legend="What next?"
        options={mode === "factory" ? FACTORY_LOOP_CHOICES : LOOP_CHOICES}
        value={walk.loop}
        onChoose={(id) => choose("loop", "loop", id)}
      />
      {walk.loop ? (
        <div className="rounded-xl border border-line bg-pass-bg p-4 text-sm text-pass">
          <p>
            The loop is closed. The next change in that area is one someone can defend. That is the
            whole idea, with or without the extra checks: whoever posts or merges a change can
            explain it, and a thin area leads to a next step.
          </p>
          <button
            type="button"
            onClick={() => setView("guide", "audit")}
            className="mt-3 min-h-11 rounded-md bg-accent px-4 text-sm font-medium text-on-accent"
          >
            Now audit your team
          </button>
        </div>
      ) : null}
    </div>
  );
}
