// Audit your team: questions a team answers about its own practice.
// Questions and rules live here. Recommendations come from model.ts, by id.

import { RECOMMENDATIONS, STATION_IDS, type StationId } from "./model.ts";

export type Answer = "covered" | "partial" | "gap" | "na";
export const ANSWERS: Answer[] = ["covered", "partial", "gap", "na"];
export const ANSWER_LABEL: Record<Answer, string> = {
  covered: "Covered",
  partial: "Partial",
  gap: "Gap",
  na: "N/A",
};

/** The answers a question offers. Only questions about Viva's own ideas can be N/A. */
export function answersFor(q: AuditQuestion): Answer[] {
  return q.na ? ANSWERS : ANSWERS.filter((a) => a !== "na");
}

export interface AuditQuestion {
  id: string;
  /** The station whose recommendations a gap points to. */
  station: StationId;
  q: string;
  covered: string;
  partial: string;
  gap: string;
  /** Recommendation ids at that station. Empty means the station's whole list. */
  recs: string[];
  /**
   * Set when the question is about Viva's own product idea (the follow-up check or the map).
   * A team that chose not to use it answers N/A, with this rule, and is not scored on it.
   */
  na?: string;
}

export const HOMEPAGE = {
  headline: "If you post it or merge it, you can defend it.",
  thesis:
    "AI makes code cheap to produce and easy to approve. Understanding is still the job. One small question after an AI-assisted change checks it, and many small answers show a person where their understanding is solid and where it is thin.",
  why: "A viva is an oral exam where you defend your own work. Nobody fails a viva for using a library. They fail for not being able to explain what they wrote. The evidence says AI can leave people unable to explain code they shipped, and that review bots and tired reviewers wave it through. Walk one pull request to see where a question fits. Then audit your own team.",
  walk: "Follow one AI-assisted PR, #212, through eight stations and see where it gets sent back.",
  audit:
    "Answer a few questions per station and see where your team checks understanding, and where it only checks code.",
};

export const QUESTIONS: AuditQuestion[] = [
  {
    id: "draft-read",
    station: "draft",
    q: "Do authors read and understand every AI-written line before asking for review?",
    covered: "It is written down, and reviewers send back changes the author cannot explain.",
    partial: "Expected, but not written down or not enforced.",
    gap: "Unreviewed agent output reaches reviewers.",
    recs: ["self-review-first", "use-ai-to-understand"],
  },
  {
    id: "draft-learners",
    station: "draft",
    q: "Is some work kept AI-free on purpose for people learning an area?",
    covered: "Yes, for starter issues and for people new to an area.",
    partial: "Informally, by some mentors.",
    gap: "No. Everyone uses the agent for everything.",
    recs: ["keep-learning-work"],
  },
  {
    id: "post-description",
    station: "post",
    q: "Does every PR description say why, what, and the decision the author is least sure of, in the author's words?",
    covered: "The PR template asks for it and reviewers expect it.",
    partial: "The template asks, but agent-written descriptions get through.",
    gap: "Descriptions are agent summaries or empty.",
    recs: ["own-description"],
  },
  {
    id: "post-disclose",
    station: "post",
    q: "Is AI help disclosed, for example with an Assisted-by trailer?",
    covered: "Always, by policy.",
    partial: "Sometimes, by habit.",
    gap: "Never, or nobody knows.",
    recs: ["disclose"],
  },
  {
    id: "bot-triage",
    station: "bot",
    q: "Are bot review comments checked by a person before anyone acts on them or reposts them?",
    covered: "Yes, and people who forward a bot comment can defend it.",
    partial: "Usually, but bot comments get applied without a check.",
    gap: "Bot comments are applied or reposted as found.",
    recs: ["bot-comments-are-claims", "repost-owns"],
  },
  {
    id: "bot-acceptance",
    station: "bot",
    q: "Do you know what share of your review bot's comments are accepted?",
    covered: "Tracked, and re-checked when the model changes.",
    partial: "A rough sense, never measured.",
    gap: "No idea.",
    recs: ["track-acceptance"],
  },
  {
    id: "review-explain",
    station: "review",
    q: "Does approval mean the reviewer could explain the change to someone else?",
    covered: "Yes, and a named person approves every change.",
    partial: "For risky changes only.",
    gap: "Approval means the checks passed and the bot was quiet.",
    recs: ["approve-what-you-can-explain", "quiz-reviewers"],
  },
  {
    id: "review-drift",
    station: "review",
    q: "Would you notice if reviewers started approving agent PRs with less scrutiny?",
    covered: "Approved PRs are sampled for a second read.",
    partial: "Someone would notice eventually.",
    gap: "No.",
    recs: ["watch-habituation"],
  },
  {
    id: "viva-question",
    station: "viva",
    q: "After an AI-assisted change, is understanding checked beyond review comments: a question, a walkthrough, or some other way?",
    covered: "Routinely, and the answer or explanation is discussed straight after.",
    partial: "Sometimes, in conversation.",
    gap: "Never, and review approval is not held to that standard either.",
    recs: ["one-small-question", "ask-confidence", "teach-with-the-answer"],
    na: "We chose not to add a follow-up check. Descriptions and review carry it.",
  },
  {
    id: "viva-dispute",
    station: "viva",
    q: "If questions are generated, can people dispute a bad one, and is it treated as practice rather than security?",
    covered: "Both.",
    partial: "One or the other.",
    gap: "Generated questions are final, or treated as proof.",
    recs: ["dispute-questions", "practice-not-security"],
    na: "No generated questions are used.",
  },
  {
    id: "merge-wrong",
    station: "merge",
    q: "What does a wrong answer do?",
    covered: "Opens a short conversation. Waivers are recorded on the PR.",
    partial: "Blocks the merge, or is ignored.",
    gap: "Nothing. The answer is recorded and ignored.",
    recs: ["talk-not-block", "waiver-recorded"],
    na: "There is no follow-up check, so there is no answer to act on.",
  },
  {
    id: "map-private",
    station: "map",
    q: "If answers or notes are kept, who can see each person's?",
    covered: "Only them, unless they choose to share. Never used in performance review.",
    partial: "Their manager, by default.",
    gap: "A dashboard or ranking, or nobody has decided.",
    recs: ["private-by-default", "topics-not-people"],
    na: "Nothing is kept about individuals.",
  },
  {
    id: "map-purpose",
    station: "map",
    q: "Did people hear what is collected, why, and for how long, before the first question?",
    covered: "Yes, in writing.",
    partial: "Mentioned in passing.",
    gap: "No.",
    recs: ["say-why-first"],
    na: "Nothing is collected.",
  },
  {
    id: "loop-next",
    station: "loop",
    q: "Does a thin area lead to a next step, like pairing or doing the next change by hand?",
    covered: "Yes, agreed between the person and a mentor.",
    partial: "Sometimes.",
    gap: "Gaps are recorded and nothing happens.",
    recs: ["gaps-to-pairing"],
  },
  {
    id: "loop-evaluate",
    station: "loop",
    q: "Do you measure whether any of this changes defects, learning, or how people feel?",
    covered: "Yes, against a baseline.",
    partial: "Anecdotes.",
    gap: "No.",
    recs: ["evaluate-it"],
  },
];

export const STATION_QUESTIONS: Record<StationId, AuditQuestion[]> = Object.fromEntries(
  STATION_IDS.map((id) => [id, QUESTIONS.filter((q) => q.station === id)]),
) as Record<StationId, AuditQuestion[]>;

export function gapRecommendations(q: AuditQuestion): string[] {
  if (q.recs.length) return q.recs;
  return RECOMMENDATIONS.filter((r) => r.station === q.station).map((r) => r.id);
}

export type Answers = Record<string, Answer>;

export type Score = "Covered" | "Partial" | "Gap" | "N/A" | "Not started";

export interface StationResult {
  station: StationId;
  answered: number;
  total: number;
  /** 0 to 100. Covered counts 1, partial a half, gap nothing. N/A answers are left out. */
  percent: number;
  /** Answers that count towards the percent: everything but N/A. */
  scored: number;
  score: Score;
}

export function scoreQuestions(questions: AuditQuestion[], answers: Answers) {
  const all = questions.filter((q) => answers[q.id]);
  const answered = all.filter((q) => answers[q.id] !== "na");
  const points = answered.reduce(
    (sum, q) => sum + (answers[q.id] === "covered" ? 1 : answers[q.id] === "partial" ? 0.5 : 0),
    0,
  );
  const percent = answered.length ? Math.round((points / answered.length) * 100) : 0;
  const score: Score =
    all.length === 0
      ? "Not started"
      : answered.length === 0
        ? "N/A"
        : answered.some((q) => answers[q.id] === "gap")
          ? "Gap"
          : answered.some((q) => answers[q.id] === "partial")
            ? "Partial"
            : "Covered";
  return {
    answered: all.length,
    scored: answered.length,
    total: questions.length,
    percent,
    score,
  };
}

export function stationResults(answers: Answers): StationResult[] {
  return STATION_IDS.map((station) => ({
    station,
    ...scoreQuestions(STATION_QUESTIONS[station], answers),
  }));
}

export function weakestStation(results: StationResult[]): StationResult | null {
  const started = results.filter((r) => r.scored > 0);
  if (!started.length) return null;
  return started.reduce((a, b) => (b.percent < a.percent ? b : a));
}

export const STORAGE_KEY = "viva-audit-v1";

export function parseAnswers(raw: string | null): Answers {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return {};
    const ids = new Set(QUESTIONS.map((q) => q.id));
    return Object.fromEntries(
      Object.entries(data).filter(
        ([k, v]) => ids.has(k) && typeof v === "string" && (ANSWERS as string[]).includes(v),
      ),
    ) as Answers;
  } catch {
    // A corrupt or old value starts the audit fresh.
    return {};
  }
}
