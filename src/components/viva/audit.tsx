import { useEffect, useState } from "react";
import { RECOMMENDATIONS, STATIONS, stationById } from "@/viva/model";
import {
  ANSWERS,
  ANSWER_LABEL,
  STATION_QUESTIONS,
  STORAGE_KEY,
  gapRecommendations,
  parseAnswers,
  scoreQuestions,
  stationResults,
  weakestStation,
  type Answer,
  type Answers,
  type AuditQuestion,
  type Score,
} from "@/viva/self-audit";
import { RecommendationList } from "@/components/viva/recommendations";

function loadAnswers(): Answers {
  try {
    return parseAnswers(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

/** Answers stay in this browser's localStorage. Nothing is sent anywhere. */
function useAnswers() {
  const [answers, setAnswers] = useState<Answers>(() =>
    typeof window === "undefined" ? {} : loadAnswers(),
  );
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // Storage can be full or blocked. The audit still works for this visit.
    }
  }, [answers]);
  return [answers, setAnswers] as const;
}

export function AuditTeam() {
  const [answers, setAnswers] = useAnswers();
  const set = (id: string, a: Answer) => setAnswers((prev) => ({ ...prev, [id]: a }));
  const answeredCount = Object.keys(answers).length;

  return (
    <section
      id="audit"
      aria-labelledby="audit-heading"
      className="scroll-mt-4 border-t border-line pt-8"
    >
      <h2 id="audit-heading" className="font-display text-3xl text-ink">
        Audit your team
      </h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        Ask each station whether your team checks understanding there, or only checks code. Pick the
        rule that fits. Each gap points to that station's recommendations and tools. Audit the
        practice, never a person.
      </p>
      <p className="mt-2 max-w-2xl text-xs text-muted">
        Your answers stay in this browser. Nothing is sent or shared.
        {answeredCount > 0 ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setAnswers({})}
              className="min-h-11 rounded-md px-1 font-medium text-steel underline underline-offset-4 hover:text-steel-2"
            >
              Clear answers
            </button>
          </>
        ) : null}
      </p>

      <ol className="mt-6 grid gap-4">
        {STATIONS.map((s) => (
          <li key={s.id}>
            <section
              aria-labelledby={`audit-${s.id}`}
              className="rounded-2xl border border-line bg-paper p-4 sm:p-6"
            >
              <p className="font-mono text-xs text-faint">
                {s.index} · {s.part} · {s.owner}
              </p>
              <h3 id={`audit-${s.id}`} className="font-display text-2xl text-ink">
                {s.name}
              </h3>
              <ol className="mt-4 grid gap-4">
                {STATION_QUESTIONS[s.id].map((q) => (
                  <Question key={q.id} q={q} answer={answers[q.id]} onAnswer={set} />
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                So far:{" "}
                <ScoreBadge score={scoreQuestions(STATION_QUESTIONS[s.id], answers).score} />
              </p>
            </section>
          </li>
        ))}
      </ol>

      <Summary answers={answers} />
    </section>
  );
}

const TONE: Record<Answer, string> = {
  covered: "border-pass bg-pass-bg",
  partial: "border-hold bg-hold-bg",
  gap: "border-fail bg-fail-bg",
};

function Question({
  q,
  answer,
  onAnswer,
}: {
  q: AuditQuestion;
  answer: Answer | undefined;
  onAnswer: (id: string, a: Answer) => void;
}) {
  const rule: Record<Answer, string> = { covered: q.covered, partial: q.partial, gap: q.gap };
  return (
    <li className="rounded-xl border border-line p-3 sm:p-4">
      <fieldset>
        <legend className="text-sm text-ink">{q.q}</legend>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {ANSWERS.map((a) => (
            <label
              key={a}
              className={
                "flex min-h-11 cursor-pointer gap-2 rounded-lg border p-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-steel " +
                (answer === a ? TONE[a] : "border-line hover:border-steel")
              }
            >
              <input
                type="radio"
                name={q.id}
                value={a}
                checked={answer === a}
                onChange={() => onAnswer(q.id, a)}
                className="mt-0.5 accent-steel"
              />
              <span>
                <span className="font-medium text-ink">{ANSWER_LABEL[a]}. </span>
                <span className="text-muted">{rule[a]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {answer === "gap" ? <GapLinks q={q} /> : null}
    </li>
  );
}

function GapLinks({ q }: { q: AuditQuestion }) {
  const station = stationById(q.station);
  const ids = gapRecommendations(q);
  const items = RECOMMENDATIONS.filter((r) => ids.includes(r.id));
  return (
    <details className="group mt-3" open>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-steel [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="transition-transform duration-150 group-open:rotate-90">
          ▸
        </span>
        Start with {station.index} {station.name}:{" "}
        {items.length === 1 ? "1 recommendation" : `${items.length} recommendations`}
      </summary>
      <div className="mt-2">
        <RecommendationList items={items} show="stage" withTools />
      </div>
    </details>
  );
}

const SCORE_TONE: Record<Score, string> = {
  Covered: "bg-pass-bg text-pass",
  Partial: "bg-hold-bg text-hold",
  Gap: "bg-fail-bg text-fail",
  "Not started": "bg-paper-2 text-muted",
};

function ScoreBadge({ score }: { score: Score }) {
  return (
    <span
      className={
        "inline-block whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-xs " +
        SCORE_TONE[score]
      }
    >
      {score}
    </span>
  );
}

function Summary({ answers }: { answers: Answers }) {
  const results = stationResults(answers);
  const weakest = weakestStation(results);
  return (
    <section
      aria-labelledby="audit-summary"
      className="mt-6 rounded-2xl border border-ink bg-paper p-4 sm:p-6"
    >
      <h3 id="audit-summary" className="font-display text-2xl text-ink">
        Summary
      </h3>
      <p className="mt-1 text-sm text-muted">
        Covered counts as one, partial as a half, gap as nothing. The weakest station has the lowest
        share, ties going to the earliest.
      </p>
      <div
        aria-live="polite"
        className="mt-4 rounded-xl border border-line bg-paper-2 p-4 text-sm text-ink"
      >
        {weakest ? (
          <p>
            <span className="font-medium">
              Weakest station: {stationById(weakest.station).index}{" "}
              {stationById(weakest.station).name}
            </span>{" "}
            at {weakest.percent}%.
          </p>
        ) : (
          <p>Answer a station to see where your team is weakest.</p>
        )}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="font-mono text-xs text-muted">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-3 font-normal">
                Station
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Score
              </th>
              <th scope="col" className="py-2 pr-3 font-normal">
                Share
              </th>
              <th scope="col" className="py-2 font-normal">
                Answered
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const s = stationById(r.station);
              const isWeakest = weakest?.station === r.station;
              return (
                <tr
                  key={r.station}
                  className={"border-b border-line " + (isWeakest ? "bg-fail-bg" : "")}
                >
                  <th scope="row" className="py-2 pr-3 font-normal text-ink">
                    {s.index} {s.name}
                    {isWeakest ? (
                      <span className="ml-2 font-mono text-xs text-fail">Weakest</span>
                    ) : null}
                  </th>
                  <td className="py-2 pr-3">
                    <ScoreBadge score={r.score} />
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-muted">
                    {r.answered ? `${r.percent}%` : ""}
                  </td>
                  <td className="py-2 tabular-nums text-muted">
                    {r.answered} of {r.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
