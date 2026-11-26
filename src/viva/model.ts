// Viva: the stations, the pull request that walks them, the evidence, and the guide.
// Every claim and recommendation names its sources by id. Sources are dated.

export const STATION_IDS = [
  "draft",
  "post",
  "bot",
  "review",
  "viva",
  "merge",
  "map",
  "loop",
] as const;

export type StationId = (typeof STATION_IDS)[number];

export interface Station {
  id: StationId;
  index: string;
  name: string;
  part: string;
  owner: string;
  thesis: string;
  lesson: string;
  sources?: ReferenceId[];
}

export const STATIONS: Station[] = [
  {
    id: "draft",
    index: "01",
    name: "Draft",
    part: "AI-assisted edit",
    owner: "Author",
    thesis:
      "The author writes the change with an AI assistant. How they use it matters more than whether they use it.",
    lesson:
      "In a controlled trial, people who handed the work to the AI scored lowest on a quiz about what they had just built. People who asked why, or generated code and then made sure they understood it, scored about as well as people who coded by hand. Speed was not the difference. Attention was.",
    sources: ["shen-tamkin", "impaired"],
  },
  {
    id: "post",
    index: "02",
    name: "Post",
    part: "PR description",
    owner: "Author",
    thesis:
      "Posting a pull request asks someone else to spend time on it. The description is the author's first defence of the change.",
    lesson:
      "Open-source projects now say it plainly. Review AI output yourself before asking anyone else to. Disclose the help. Be able to answer questions about your work. A description the agent wrote can say what changed. It cannot say which decision the author is least sure of.",
    sources: ["llvm-policy", "kernel-assistants", "gnome-review"],
  },
  {
    id: "bot",
    index: "03",
    name: "Bot review",
    part: "AI comments",
    owner: "Author and reviewer",
    thesis:
      "A review bot comments within minutes. Some comments are right, some are noise, and some describe code that is not there.",
    lesson:
      "In the largest study so far, developers accepted about a third of one review bot's comments and rejected more than half. A bot comment is a claim to check, not a finding. If a person reposts it as their own, they own it, and they should be able to defend it like anything else they post.",
    sources: ["coderabbit-wild", "cra-empirical", "llvm-policy"],
  },
  {
    id: "review",
    index: "04",
    name: "Review",
    part: "Approval",
    owner: "Reviewer",
    thesis:
      "A person reads the change. Review was never only about bugs. It is how a team comes to understand its own code.",
    lesson:
      "Clean, confident output lowers a reader's guard. Developers with an AI assistant wrote less secure code and were more sure it was secure. Reviewers who see many agent PRs approve more of them over time. Approval should mean the reviewer could explain the change, not that the bot was quiet.",
    sources: ["bacchelli-bird", "perry", "habituation"],
  },
  {
    id: "viva",
    index: "05",
    name: "Viva",
    part: "One question",
    owner: "Author",
    thesis:
      "One small question about the author's own change, with a confidence rating. A minute, not an exam.",
    lesson:
      "Working code does not prove understanding. About a third of students could not explain programs they had just written, and answering questions about their own code tracked success better than passing tests did. Asking with confidence turns the answer into a signal: a confident wrong answer matters most. A model can answer most such questions too, so this is practice, not a security control.",
    sources: ["lehtinen-struggle", "lehtinen-qlc", "sparck-cwt", "lehtinen-ai-qlc"],
  },
  {
    id: "merge",
    index: "06",
    name: "Merge",
    part: "Decision",
    owner: "Reviewer",
    thesis:
      "The answer feeds the merge, but it does not decide it. A wrong answer starts a conversation.",
    lesson:
      "Questions written by a model are sometimes wrong, so a hard block punishes bad questions as well as thin understanding. Block only when a critical behaviour stays unexplained. Let anyone waive the check with a reason that stays on the PR.",
    sources: ["explyt-gate", "sphinx", "automcq"],
  },
  {
    id: "map",
    index: "07",
    name: "Map",
    part: "Private picture",
    owner: "The person",
    thesis:
      "Many small answers add up to a picture of where someone's understanding is solid and where it is thin. It belongs to them.",
    lesson:
      "Monitoring with no clear purpose has not been linked to better performance, and intrusive monitoring goes with worse attitudes and more stress. In the EU, AI that monitors or evaluates workers is classed as high risk. A map that is private by default, and shared only by choice, is feedback. A dashboard of people is surveillance.",
    sources: ["ravid-epm", "eu-ai-act"],
  },
  {
    id: "loop",
    index: "08",
    name: "Return",
    part: "Next step",
    owner: "The person, with a mentor",
    thesis:
      "A thin area becomes the next thing to learn: a pairing session, a change done by hand, a short read.",
    lesson:
      "Survey respondents say AI has cut the mentoring juniors get. Seniors' pre-AI foundations are what let them steer the tools. A map of gaps is only useful if it leads somewhere. The loop closes when the next change in that area is one the person can defend.",
    sources: ["leaddev-2025", "feng-junior-senior"],
  },
];

export function stationById(id: StationId): Station {
  return STATIONS[stationIndex(id)];
}

export function stationIndex(id: StationId): number {
  return STATION_IDS.indexOf(id);
}

export function nextStation(id: StationId): StationId | null {
  const i = stationIndex(id);
  return i < STATION_IDS.length - 1 ? STATION_IDS[i + 1] : null;
}

export const LOCK_REASON: Record<StationId, string> = {
  draft: "",
  post: "Draft the change first.",
  bot: "Post the PR first. The bot reviews what was posted.",
  review: "Triage the bot's comments first. A person reads the change, not the bot's noise.",
  viva: "Review the change first.",
  merge: "Answer the question first. The merge reads the answer.",
  map: "Decide the merge first.",
  loop: "Look at the map first. The next step comes from what it shows.",
};

// The pull request that walks the line.

export const PR = {
  id: "#212",
  title: "Retry failed webhook deliveries",
  branch: "fix/webhook-retry",
  summary:
    "Customers miss webhooks when their endpoint is briefly down. Retry each failed delivery up to five times with exponential backoff.",
};

export const DIFF: { kind: "add" | "del" | "ctx"; text: string }[] = [
  { kind: "ctx", text: "export async function deliver(hook: Hook, event: Event) {" },
  { kind: "del", text: "  return post(hook.url, event.body);" },
  { kind: "add", text: "  const headers = { 'Idempotency-Key': event.id };" },
  { kind: "add", text: "  for (let attempt = 1; attempt <= 5; attempt++) {" },
  {
    kind: "add",
    text: "    const res = await post(hook.url, event.body, { headers, timeoutMs: 3000 });",
  },
  { kind: "add", text: "    if (res.ok) return res;" },
  { kind: "add", text: "    await sleep(250 * 2 ** attempt);" },
  { kind: "add", text: "  }" },
  { kind: "add", text: "  throw new DeliveryFailed(event.id);" },
  { kind: "ctx", text: "}" },
];

export type DraftChoice = "delegate" | "explain" | "ask" | "vague" | "checks" | "session";

export const DRAFT_CHOICES: { id: DraftChoice; label: string; detail: string; result: string }[] = [
  {
    id: "delegate",
    label: "Hand it over",
    detail: "Paste the ticket into the agent and accept the edit when the tests pass.",
    result:
      "Done in four minutes. The tests are green. You did not read the retry loop or the new header. In the trial, delegation scored 39% on the quiz that followed, and iterative AI debugging 24%.",
  },
  {
    id: "explain",
    label: "Generate, then understand",
    detail: "Let the agent write it, then ask it to explain each line until you could rewrite it.",
    result:
      "Done in twelve minutes. You know why the Idempotency-Key header is there. In the trial, generate-then-understand was the highest-scoring pattern, though only two people used it.",
  },
  {
    id: "ask",
    label: "Ask about the concept first",
    detail: "Ask how safe retries work, then write the loop yourself with the agent checking.",
    result:
      "Done in fifteen minutes. You could explain retries without the code in front of you. In the trial, conceptual inquiry averaged 65% and was among the fastest high-scoring patterns.",
  },
];

export type PostChoice = "agent" | "own" | "claim" | "record";

export const POST_CHOICES: { id: PostChoice; label: string; body: string }[] = [
  {
    id: "agent",
    label: "Use the agent's description",
    body: "This PR adds robust retry logic with exponential backoff to improve webhook delivery reliability. It handles transient failures gracefully and includes an idempotency header to ensure safe retries.",
  },
  {
    id: "own",
    label: "Write it yourself",
    body: "Why: customers miss webhooks when their endpoint blips. What: up to five tries, backoff 500ms to 8s, same Idempotency-Key on every try so the receiver can drop repeats. Least sure of: whether a 3s timeout is too short for slow receivers. Assisted-by: an AI assistant (drafted the loop, I rewrote the backoff).",
  },
];

export const POST_SENT_BACK =
  "Sent back. The agent's description says what changed in words that fit any PR. It names no risk and no reason, and nobody can tell whether the author could answer a question about it. Write the why, the decision you are least sure of, and say where AI helped.";

/** In a software factory an agent builds the edit. The person shapes it through the work order. */
export const FACTORY_DRAFT_CHOICES: {
  id: DraftChoice;
  label: string;
  detail: string;
  result: string;
  sentBack?: string;
}[] = [
  {
    id: "vague",
    label: "Title only",
    detail: 'File "Retry failed webhooks" and let the agent work out the rest.',
    result: "",
    sentBack:
      "Sent back. The line does not start from a vague idea. Without checks that mean done, the agent decides what done means, and nobody can say later what the change was meant to do.",
  },
  {
    id: "checks",
    label: "Write the checks that mean done",
    detail:
      "A failed delivery is retried up to five times. A repeat never reaches the receiver twice.",
    result:
      "The agent builds against your checks. You know what the change must do. You have not seen how it does it.",
  },
  {
    id: "session",
    label: "Write the checks, then read the session",
    detail: "Same checks, then read how the agent got there before the PR opens.",
    result:
      "You know what it must do and how it was built, including why the agent added an Idempotency-Key header. Reading the session is the factory version of generate-then-understand.",
  },
];

export const FACTORY_POST_CHOICES: { id: PostChoice; label: string; body: string }[] = [
  {
    id: "claim",
    label: "The agent's summary",
    body: "Implemented robust webhook retries with exponential backoff and idempotency. All tests pass. Ready to merge.",
  },
  {
    id: "record",
    label: "An evidence record",
    body: "Agreed: up to five tries; a repeat never reaches the receiver twice. Checks on this commit: retry.test (6 pass), idempotency.test (3 pass). Not asked for: none. Reach: every outbound webhook. Owner is least sure of: the 3s timeout. Assisted-by: build agent.",
  },
];

export const FACTORY_POST_SENT_BACK =
  "Sent back. An agent saying it is done is not evidence. The record should tie the agreed behaviour to the checks that ran on this commit, flag anything nobody asked for, and say how far a mistake would reach.";

export type Triage = "forward" | "dismiss";

export interface BotComment {
  id: string;
  line: string;
  text: string;
  correct: Triage;
  ifWrong: string;
  ifRight: string;
}

export const BOT_COMMENTS: BotComment[] = [
  {
    id: "jitter",
    line: "await sleep(250 * 2 ** attempt);",
    text: "Pure exponential backoff makes every failed delivery retry at the same moments. Add random jitter so a recovering endpoint is not hit by a synchronised wave.",
    correct: "forward",
    ifRight:
      "Kept. The comment is right, and you can say why: synchronised retries can knock a recovering server over again.",
    ifWrong:
      "This one was right. Dismissing a correct comment is cheaper than forwarding a wrong one, but check it: what happens when a thousand deliveries fail at the same second?",
  },
  {
    id: "loop",
    line: "for (let attempt = 1; attempt <= 5; attempt++) {",
    text: "Critical: this loop never terminates if the endpoint keeps failing, which can exhaust the worker pool.",
    correct: "dismiss",
    ifRight:
      "Dismissed. The loop stops after five attempts and throws. The bot described code that is not there.",
    ifWrong:
      "You forwarded a claim you did not check. The loop is capped at five and then throws. If you post it, you own it, and the next question could be about this comment.",
  },
];

export type ReviewChoice = "stamp" | "read";

export const REVIEW_CHOICES: { id: ReviewChoice; label: string; detail: string }[] = [
  {
    id: "stamp",
    label: "Approve",
    detail: "The tests pass, the bot found nothing else, and the description reads well.",
  },
  {
    id: "read",
    label: "Read the retry path",
    detail: "Trace one failed delivery through the loop, then ask the viva question.",
  },
];

export const REVIEW_SENT_BACK =
  "Sent back. A quiet bot and a fluent description are not evidence that anyone understands the change. This is the automation bias the evidence warns about. Read the path a failure takes.";

export type Confidence = "sure" | "think" | "guess";

export const CONFIDENCE: { id: Confidence; label: string }[] = [
  { id: "sure", label: "Sure" },
  { id: "think", label: "I think so" },
  { id: "guess", label: "Guessing" },
];

export const QUESTION = {
  prompt:
    "The receiver processes a delivery, but its reply is lost and the request times out. What happens next?",
  options: [
    {
      id: "a",
      text: "The receiver processes the event twice, because the retry is a new request.",
    },
    {
      id: "b",
      text: "The retry carries the same Idempotency-Key, so a receiver that checks it can drop the repeat.",
    },
    { id: "c", text: "Nothing. A timeout counts as success, so there is no retry." },
    { id: "d", text: "The sender gives up at once and throws DeliveryFailed." },
  ],
  answer: "b",
  why: "A timeout is a failure from the sender's side, so the loop retries. The retry sends the same Idempotency-Key, event.id. The receiver can see it has already handled that key and drop the repeat. Without the key, option A is what happens.",
};

export type Outcome = "solid" | "fragile" | "thin" | "blind";

export function outcomeOf(correct: boolean, confidence: Confidence): Outcome {
  if (correct) return confidence === "sure" ? "solid" : "fragile";
  return confidence === "sure" ? "blind" : "thin";
}

export const OUTCOME: Record<Outcome, { label: string; meaning: string }> = {
  solid: { label: "Solid", meaning: "Right, and sure. Nothing to do." },
  fragile: {
    label: "Fragile",
    meaning: "Right, but unsure. Worth a second look before it is needed in an incident.",
  },
  thin: {
    label: "Thin, and you knew it",
    meaning: "Wrong, and you said so. Honest. This is where to learn next.",
  },
  blind: {
    label: "Blind spot",
    meaning:
      "Wrong, and sure. The signal that matters most. Confident misunderstanding is what slips past review.",
  },
};

export type MergeChoice = "block" | "talk" | "ignore";

export const MERGE_CHOICES: {
  id: MergeChoice;
  label: string;
  detail: string;
  sentBack?: string;
}[] = [
  {
    id: "block",
    label: "Block until they pass",
    detail: "No merge until the author gets a question right.",
    sentBack:
      "Sent back. The question was written by a model and can be wrong. A hard block punishes bad questions too, and teaches people to paste the quiz into an AI. Block only when a critical behaviour stays unexplained.",
  },
  {
    id: "talk",
    label: "Talk, then decide",
    detail:
      "A right answer merges. A wrong one opens a five-minute conversation first. Anyone can waive it with a reason on the PR.",
  },
  {
    id: "ignore",
    label: "Merge either way",
    detail: "Record the answer and move on.",
    sentBack:
      "Sent back. If the answer never changes anything, the question is theatre, and people will treat it that way. A wrong answer should at least start a conversation.",
  },
];

export type MapChoice = "private" | "lead" | "dashboard";

export const MAP_CHOICES: { id: MapChoice; label: string; detail: string; sentBack?: string }[] = [
  {
    id: "private",
    label: "Only you",
    detail: "You see your map. You choose what to share, and with whom.",
  },
  {
    id: "lead",
    label: "You and your manager",
    detail: "Your manager sees your map in one-to-ones.",
    sentBack:
      "Sent back. Once a manager sees it by default, people answer for the audience, not to learn. Share by choice, not by default.",
  },
  {
    id: "dashboard",
    label: "A team dashboard",
    detail: "Everyone's map, side by side, ranked.",
    sentBack:
      "Sent back. That is a ranking of people, and it is monitoring. The evidence links intrusive monitoring to more stress and worse attitudes, not to better work. In the EU, AI that evaluates workers is classed as high risk.",
  },
];

/** Earlier checks on the map, so the walk shows a picture built from many answers. */
export const MAP_HISTORY: { topic: string; outcome: Outcome; checks: number }[] = [
  { topic: "Backoff and jitter", outcome: "solid", checks: 3 },
  { topic: "Database migrations", outcome: "fragile", checks: 2 },
  { topic: "Auth token refresh", outcome: "thin", checks: 1 },
];

export const MAP_TOPIC = "Idempotent retries";

export type LoopChoice = "pair" | "hand" | "read" | "route";

export const LOOP_CHOICES: { id: LoopChoice; label: string; detail: string }[] = [
  {
    id: "pair",
    label: "Pair on it",
    detail: "Thirty minutes with someone strong in the area, on a real change.",
  },
  {
    id: "hand",
    label: "Do the next one by hand",
    detail: "Take the next ticket in this area and write the core of it without the agent.",
  },
  {
    id: "read",
    label: "Read, then re-check",
    detail: "A short read on the concept, and another question in a week.",
  },
];

export const FACTORY_LOOP_CHOICES: { id: LoopChoice; label: string; detail: string }[] = [
  {
    id: "route",
    label: "Route the area to a person",
    detail:
      "Until someone can explain it, changes there need a named human reviewer who knows the area.",
  },
  {
    id: "hand",
    label: "A person builds the next one",
    detail: "The next work order in this area is built by a person, with the agent checking.",
  },
  {
    id: "pair",
    label: "Pair on the session",
    detail: "Thirty minutes reading the agent's session with someone strong in the area.",
  },
];

// Setting up the walk. The follow-up check and the map are Viva's product idea, so a team can
// replace them or leave them out. The walk can also run inside a software factory, as in Line.

export type Mode = "team" | "factory";
export type CheckMethod = "question" | "walkthrough" | "none";
export type RecordMethod = "map" | "journal" | "none";

export interface Setup {
  mode: Mode;
  check: CheckMethod;
  record: RecordMethod;
}

export const DEFAULT_SETUP: Setup = { mode: "team", check: "question", record: "map" };

export const MODES: { id: Mode; label: string; detail: string }[] = [
  {
    id: "team",
    label: "People with AI",
    detail: "A person writes the change with an assistant, then posts it.",
  },
  {
    id: "factory",
    label: "A software factory",
    detail: "Agents build from work orders. People plan and approve, as in Line.",
  },
];

/** How strong the evidence is for an option or a factory note, and what it rests on. */
export interface Basis {
  strength: Strength;
  basis: string;
  sources: ReferenceId[];
}

export const CHECK_METHODS: ({
  id: CheckMethod;
  label: string;
  detail: string;
  name: string;
  part: string;
} & Basis)[] = [
  {
    id: "question",
    label: "A viva question",
    detail: "One scenario question with a confidence rating. Viva's product idea.",
    name: "Viva",
    part: "One question",
    strength: "Gap",
    basis:
      "No comprehension check on PRs has published evidence. Its parts are backed: asking questions about your own code tracks success (Moderate), practice tests and confidence ratings help learning (Strong, Moderate). A model can answer most such questions (Moderate).",
    sources: ["lehtinen-struggle", "adesope", "sparck-cwt", "lehtinen-ai-qlc"],
  },
  {
    id: "walkthrough",
    label: "A walkthrough",
    detail: "Five minutes talking the reviewer through the change, no agent open.",
    name: "Walkthrough",
    part: "Live explanation",
    strength: "Gap",
    basis:
      "Not tested as a check on understanding. Nearby: explaining aids learning (Strong, in lab settings), a live oral exam scaled to one class (Weak), and 1978 walkthroughs found errors about as well as testing (Moderate, a different goal). Probably harder to fake with an AI than a written question, though nobody has tested that.",
    sources: ["bisra", "barba-exam", "myers-walkthrough"],
  },
  {
    id: "none",
    label: "None",
    detail: "No follow-up check. The description and review carry it.",
    name: "Follow-up",
    part: "Not used",
    strength: "Gap",
    basis:
      "No study compares teams with and without a follow-up check. What remains is backed: review is about understanding and spreads knowledge (Strong, Moderate), and clear descriptions make changes easier to review (Moderate).",
    sources: ["bacchelli-bird", "rigby-bird", "ram-reviewability"],
  },
];

export const RECORD_METHODS: ({
  id: RecordMethod;
  label: string;
  detail: string;
  name: string;
  part: string;
} & Basis)[] = [
  {
    id: "map",
    label: "A private map",
    detail: "Answers grouped by topic over time. Needs a follow-up check to feed it.",
    name: "Map",
    part: "Private picture",
    strength: "Gap",
    basis:
      "Viva's untested idea. Monitoring without a clear purpose goes with more stress and no gain (Strong), so privacy is the part with evidence behind it.",
    sources: ["ravid-epm"],
  },
  {
    id: "journal",
    label: "A learning log",
    detail: "The person keeps one line per PR: what they had to look up or ask.",
    name: "Log",
    part: "Own notes",
    strength: "Weak",
    basis:
      "Reflective journals in engineering courses are valued by students, and the number of entries predicted marks in one course. Small, correlational, students not working engineers.",
    sources: ["palmer-journal", "bisra"],
  },
  {
    id: "none",
    label: "None",
    detail: "Nothing is kept. Next steps come from reviews and one-to-ones.",
    name: "Record",
    part: "Not used",
    strength: "Gap",
    basis: "No evidence either way. Keeping nothing avoids the monitoring risks entirely.",
    sources: ["ravid-epm"],
  },
];

export const JOURNAL: string[] = [
  "#198: looked up how jitter spreads retries.",
  "#205: asked why the migration needed a lock.",
  "#209: could not say what refresh does on a 401. Asked in review.",
];

/** Why a station is skipped when its method is None. */
export const NOT_APPLICABLE: Partial<Record<StationId, string>> = {
  viva: "No follow-up check is used. Understanding is checked by the author's own description at Post, and by a reviewer who approves only what they could explain. That is the Start stage of the guide, and it holds up on its own.",
  merge:
    "With no follow-up check there is no answer to act on. The change merges on its checks and a named approval.",
  map: "Nothing is kept. That is a fair choice: a record is only worth keeping if it leads to a next step and stays private. Next steps come from review conversations and one-to-ones instead.",
};

/** Whether a station is skipped under this setup. */
export function notApplicable(id: StationId, setup: Setup): boolean {
  if (id === "viva" || id === "merge") return setup.check === "none";
  if (id === "map") return setup.record === "none";
  return false;
}

/** The station as it reads under this setup: its name, part and owner can change. */
export function stationFor(id: StationId, setup: Setup): Station {
  const base = stationById(id);
  let { name, part, owner } = base;
  if (id === "viva") {
    const m = CHECK_METHODS.find((c) => c.id === setup.check)!;
    name = m.name;
    part = m.part;
  }
  if (id === "map") {
    const m = RECORD_METHODS.find((c) => c.id === setup.record)!;
    name = m.name;
    part = m.part;
  }
  let thesis = base.thesis;
  if (setup.mode === "factory") {
    owner = FACTORY[id].owner;
    thesis = FACTORY[id].thesis ?? thesis;
  }
  return { ...base, name, part, owner, thesis };
}

export interface FactoryNote {
  /** The Line station or stations this one sits beside. */
  line: string;
  owner: string;
  /** The station's thesis when an agent is the author, if it reads differently. */
  thesis?: string;
  change: string;
  /** How strong the evidence is for the change, and what it rests on. */
  strength: Strength;
  basis: string;
  sources: ReferenceId[];
}

/** What changes at each station when the PR comes out of a software factory. */
export const FACTORY: Record<StationId, FactoryNote> = {
  draft: {
    line: "Backlog and Bench",
    owner: "Work order owner",
    thesis:
      "An agent builds the change from a work order. The person shapes it through the checks that mean done, and through how closely they read what the agent did.",
    change:
      "An agent builds the edit, so nobody is at the keyboard to learn from it. The person's understanding comes from the work order: the checks that mean done. Reading the agent's session is how they learn how it was built. A vague work order is sent back before the agent starts.",
    strength: "Gap",
    basis:
      "Writing checks that mean done rests on one preprint: agents claimed completion 29 to 38 points more often than evaluators confirmed (Moderate). That reading the session builds understanding is untested. In one small study, developers reading raw agent logs found the agent's bugs only 17% of the time (60% with a stepping tool).",
    sources: ["spec-sign-off", "agentstepper", "shen-tamkin"],
  },
  post: {
    line: "Gate",
    owner: "The factory",
    thesis:
      "The agent opens the PR. Its description is a record the factory requires, not an author's defence.",
    change:
      "The agent opens the PR, so an agent-written description is expected. It has to be a record, not a claim: the agreed behaviour, the checks that ran on this commit, behaviour nobody asked for, and how far a mistake would reach. The work order owner adds the decision they are least sure of.",
    strength: "Moderate",
    basis:
      "That an agent's claim of done is not evidence rests on one preprint (Moderate). The record format is a practitioner proposal (Opinion). Clear descriptions make changes easier to review (Moderate, pre-AI).",
    sources: ["spec-sign-off", "oreilly-cheap-review", "ram-reviewability"],
  },
  bot: {
    line: "Review",
    owner: "Reviewer",
    change:
      "In Line, the review agent runs after the gate, in the background, and its comments are staged, not posted straight away. The reviewer still triages them. Sending one back to the building agent as an instruction is the factory version of reposting it, so it still needs a person who could defend it.",
    strength: "Opinion",
    basis:
      "Staging review comments is Line's design, not a studied practice. Review bot comments are often wrong (Moderate), so checking them still matters.",
    sources: ["coderabbit-wild", "cra-empirical"],
  },
  review: {
    line: "Review",
    owner: "Reviewer",
    change:
      "Agents open PRs faster than people can read them, and most agent PRs studied so far got no human review at all. Reviewers also react more favourably to agent code than its quality warrants. Line caps agent PRs at what people can read, and the reviewer reads the agent's session as well as the diff.",
    strength: "Moderate",
    basis:
      "Most AI-generated PRs get no review, and agents dominate the reviews they do get (Moderate). Reviewer load doubled under one AI mandate (Moderate). Reviewers reacted more favourably to agent PRs despite more redundancy (Moderate). Drift over time is one unreplicated preprint (Weak), and one controlled study saw reviews loosen everywhere, not only with agents.",
    sources: [
      "aidev-human-review",
      "faster-than-review",
      "less-reuse",
      "habituation",
      "agents-review-behaviour",
    ],
  },
  viva: {
    line: "Review, before approval",
    owner: "Approver and work order owner",
    thesis:
      "One small check for the people who asked for the change and who approve it, before the approval counts.",
    change:
      "There is no human author to ask. The check goes to the person who approves, before the approval counts, and to the work order owner. It is never a required gate check: Line trusts checks that are cheap, run every time and are hard to fake, and a question a model can answer is easy to fake.",
    strength: "Gap",
    basis:
      "Quizzing approvers exists as a tool with no published evidence. That a model can answer most questions about code is Moderate, and keeping it out of the gate follows from that.",
    sources: ["pr-quiz", "lehtinen-ai-qlc"],
  },
  merge: {
    line: "Gate and Artifact",
    owner: "The factory and the approver",
    change:
      "Merge is decided by the gate's checks and a named approval, as in Line. An answer can hold up approval for a conversation, but it is never one of the checks.",
    strength: "Opinion",
    basis: "Line's design and one practitioner proposal. Not studied.",
    sources: ["explyt-gate"],
  },
  map: {
    line: "Return",
    owner: "The person",
    change:
      "Comprehension debt grows fastest when agents write most of the code. The factory's version of the map is a topic view: which areas of its output nobody can explain. It never names people.",
    strength: "Gap",
    basis:
      "A topic view of understanding is untested. Nearby: knowledge of code concentrates in few people (Moderate), and losses when people leave can be several times the expected loss (Moderate), though both measure who edits code, not who understands it. Not naming people is backed by the monitoring evidence (Strong).",
    sources: ["avelino-truck", "rigby-turnover", "ravid-epm", "osmani-debt"],
  },
  loop: {
    line: "Return",
    owner: "Product and the person",
    change:
      "In Line, the production signal becomes the next work order. A thin area can too: route changes there to a person who knows it, or have a person build the next one, until someone can explain it.",
    strength: "Gap",
    basis:
      "Routing a thin area to a person is untested. Naming successors for at-risk files cut expected loss by up to 15% (Moderate). Expert-novice pairing transfers knowledge in industry, though novices rarely reflect (Moderate, qualitative).",
    sources: ["rigby-turnover", "plonka-pairing", "feng-junior-senior"],
  },
};

export const PARTS: { name: string; station: string; definition: string; here: string }[] = [
  {
    name: "AI-assisted change",
    station: "Draft",
    definition: "Code written with an assistant or agent. The person who posts it owns it.",
    here: "PR #212 adds a retry loop and an Idempotency-Key header.",
  },
  {
    name: "Description",
    station: "Post",
    definition:
      "Why the change exists, what it does, and the decision the author is least sure of.",
    here: "The author is least sure whether a 3-second timeout is too short.",
  },
  {
    name: "Bot comment",
    station: "Bot review",
    definition: "A claim from a review bot. Checked by a person before anyone acts on it.",
    here: "One comment is right about jitter. One describes a loop that never ends. It does end.",
  },
  {
    name: "Approval",
    station: "Review",
    definition: "A reviewer saying they understand the change and it meets its goal.",
    here: "The reviewer traces a lost reply through the loop before approving.",
  },
  {
    name: "Viva question",
    station: "Viva",
    definition:
      "One scenario question about the author's own change, answered with a confidence rating.",
    here: "A reply is lost and the request times out. What happens next?",
  },
  {
    name: "Map",
    station: "Map",
    definition:
      "A private picture, built from many answers, of where understanding is solid or thin.",
    here: "Idempotent retries joins backoff, migrations and token refresh.",
  },
];

// Sources.

export type ReferenceId =
  | "shen-tamkin"
  | "lehtinen-qlc"
  | "llvm-policy"
  | "osmani-debt"
  | "lehtinen-struggle"
  | "lehtinen-ai-qlc"
  | "impaired"
  | "kosmyna"
  | "lee-critical"
  | "perry"
  | "metr-2025"
  | "metr-2026"
  | "canaries"
  | "canaries-timing"
  | "feng-junior-senior"
  | "leaddev-2025"
  | "so-2025"
  | "sonar-2026"
  | "coderabbit-wild"
  | "cra-empirical"
  | "habituation"
  | "bacchelli-bird"
  | "sparck-cwt"
  | "adesope"
  | "bisra"
  | "automcq"
  | "barba-exam"
  | "ravid-epm"
  | "eu-ai-act"
  | "bainbridge"
  | "explyt-gate"
  | "sphinx"
  | "pr-quiz"
  | "kernel-assistants"
  | "gnome-review"
  | "owasp-ai"
  | "aidev-human-review"
  | "less-reuse"
  | "agents-review-behaviour"
  | "agentstepper"
  | "rigby-bird"
  | "ram-reviewability"
  | "myers-walkthrough"
  | "palmer-journal"
  | "plonka-pairing"
  | "hannay-pairing"
  | "avelino-truck"
  | "rigby-turnover"
  | "oreilly-cheap-review"
  | "spec-sign-off"
  | "faster-than-review";

export interface Reference {
  id: ReferenceId;
  title: string;
  author: string;
  publication: string;
  date: string;
  url: string;
  took: string;
}

/** The pieces Viva started from. */
export const BUILT_ON: Reference[] = [
  {
    id: "shen-tamkin",
    title: "How AI assistance impacts the formation of coding skills",
    author: "Judy Hanwen Shen, Alex Tamkin",
    publication: "Anthropic",
    date: "29 January 2026",
    url: "https://www.anthropic.com/research/AI-assistance-coding-skills",
    took: "The trial behind the Draft station. 52 mostly junior engineers. The AI group scored 50% on a quiz against 67%, with no significant speed gain. How people used AI mattered more than whether they did.",
  },
  {
    id: "lehtinen-qlc",
    title: "Let's Ask Students About Their Programs, Automatically",
    author: "Teemu Lehtinen, André L. Santos, Juha Sorva",
    publication: "ICPC 2021",
    date: "March 2021",
    url: "https://arxiv.org/abs/2103.11138",
    took: "The idea behind the Viva station. After code passes its tests, ask the author questions about their own program. Passing tests is not understanding.",
  },
  {
    id: "llvm-policy",
    title: "LLVM AI Tool Use Policy",
    author: "LLVM Project",
    publication: "llvm.org",
    date: "January 2026",
    url: "https://llvm.org/docs/AIToolPolicy.html",
    took: "The rule behind the Post station. Use any tool, but a human reads the output first and should be able to answer questions about their work during review.",
  },
  {
    id: "osmani-debt",
    title: "Comprehension Debt: the hidden cost of AI generated code",
    author: "Addy Osmani",
    publication: "AddyOsmani.com",
    date: "14 March 2026",
    url: "https://addyosmani.com/blog/comprehension-debt/",
    took: "The name for the problem. The gap between how much code a team has and how much of it anyone understands. Green tests do not show it.",
  },
];

export const FURTHER_READING: { heading: string; refs: Reference[] }[] = [
  {
    heading: "Understanding and learning",
    refs: [
      {
        id: "impaired",
        title: "(Im)Paired Programming: Coding Agents Improve Productivity but Harm Understanding",
        author: "Nishant Balepur and others",
        publication: "arXiv",
        date: "29 July 2026",
        url: "https://arxiv.org/abs/2607.26375",
        took: "54 students. Agents helped first-pass completion but hurt comprehension of their own code. Copy-paste prompts and auto-accepted edits went with the lowest understanding. Users still preferred the agent.",
      },
      {
        id: "lehtinen-struggle",
        title: "Students Struggle to Explain Their Own Program Code",
        author: "Teemu Lehtinen, Aleksi Lukkarinen, Lassi Haaranen",
        publication: "ITiCSE 2021",
        date: "June 2021",
        url: "https://arxiv.org/abs/2104.06710",
        took: "About a third of students struggled to explain code they had just written. Answering questions about it tracked course success better than a correct submission did.",
      },
      {
        id: "lehtinen-ai-qlc",
        title:
          "Let's Ask AI About Their Programs: Exploring ChatGPT's Answers To Program Comprehension Questions",
        author: "Teemu Lehtinen, Charles Koutcheme, Arto Hellas",
        publication: "ICSE SEET 2024",
        date: "April 2024",
        url: "https://arxiv.org/abs/2404.11734",
        took: "GPT-4 answered 88% of 399 questions about code correctly, GPT-3.5 69%. Loop and variable tracing were hardest. A question alone cannot tell a person from a model.",
      },
      {
        id: "kosmyna",
        title:
          "Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task",
        author: "Nataliya Kosmyna and others",
        publication: "arXiv (MIT Media Lab)",
        date: "June 2025",
        url: "https://arxiv.org/abs/2506.08872",
        took: "54 people, essays not code. The LLM group showed the weakest brain connectivity and most could not quote what they had just written. Small, unreviewed, and widely overstated in coverage.",
      },
      {
        id: "lee-critical",
        title:
          "The Impact of Generative AI on Critical Thinking: Self-Reported Reductions in Cognitive Effort and Confidence Effects From a Survey of Knowledge Workers",
        author: "Hao-Ping (Hank) Lee and others",
        publication: "CHI 2025",
        date: "April 2025",
        url: "https://doi.org/10.1145/3706598.3713778",
        took: "319 knowledge workers. More confidence in the AI went with less critical thinking. More confidence in oneself went with more. Self-reported, not measured skill.",
      },
      {
        id: "bainbridge",
        title: "Ironies of Automation",
        author: "Lisanne Bainbridge",
        publication: "Automatica",
        date: "1983",
        url: "https://doi.org/10.1016/0005-1098(83)90046-8",
        took: "Skills that go unused fade, and people monitor reliable automation poorly. Written about process control, forty years before review bots.",
      },
    ],
  },
  {
    heading: "AI in code review",
    refs: [
      {
        id: "coderabbit-wild",
        title:
          "Is Agentic Code Review Helpful? Mining Developers' Feedback to CodeRabbit Reviews in the Wild",
        author: "Hong Yi Lin, Mingzhao Liang, Patanamon Thongtanunam, Kla Tantithamthavorn",
        publication: "arXiv",
        date: "3 July 2026",
        url: "https://arxiv.org/abs/2607.03316",
        took: "31,073 comment and feedback pairs across 239 repos. 36.4% accepted, 7.3% discussed, 56.3% rejected.",
      },
      {
        id: "cra-empirical",
        title:
          "From Industry Claims to Empirical Reality: An Empirical Study of Code Review Agents in Pull Requests",
        author: "Kowshik Chowdhury, Dipayan Banik, K M Ferdous, Shazibul Islam Shamim",
        publication: "arXiv",
        date: "3 April 2026",
        url: "https://arxiv.org/abs/2604.03196",
        took: "3,109 PRs. PRs reviewed only by agents merged at 45%, against 68% for human-only review. 12 of 13 agents had an average signal ratio below 60%.",
      },
      {
        id: "habituation",
        title:
          "Beyond Lexical Metrics: Sentence-Embedding Detection of Reviewer Habituation in AI Code Review",
        author: "Haoran Yu, Lifei Liu, Danping Zhang",
        publication: "arXiv",
        date: "5 September 2026",
        url: "https://arxiv.org/abs/2609.06213",
        took: "400 repeat reviewers over 207 days. Approval of agent PRs rose from 30.5% to 36.6%. Simple comment metrics did not show the drift. Embeddings did. No defect data.",
      },
      {
        id: "bacchelli-bird",
        title: "Expectations, Outcomes, and Challenges of Modern Code Review",
        author: "Alberto Bacchelli, Christian Bird",
        publication: "ICSE 2013",
        date: "May 2013",
        url: "https://web.eecs.umich.edu/~weimerw/2018-481/readings/codereview.pdf",
        took: "At Microsoft, finding defects was the main motive for review but not its main outcome. Understanding the change is the core of reviewing, and knowledge transfer is one of its benefits.",
      },
      {
        id: "perry",
        title: "Do Users Write More Insecure Code with AI Assistants?",
        author: "Neil Perry, Megha Srivastava, Deepak Kumar, Dan Boneh",
        publication: "ACM CCS 2023",
        date: "November 2023",
        url: "https://arxiv.org/abs/2211.03622",
        took: "47 participants. Those with an assistant wrote less secure code and were more likely to believe it was secure.",
      },
      {
        id: "owasp-ai",
        title: "Secure Coding with AI Cheat Sheet",
        author: "OWASP",
        publication: "OWASP Cheat Sheet Series",
        date: "Undated",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html",
        took: "Every AI change has a named human owner. AI review does not replace human review.",
      },
    ],
  },
  {
    heading: "Juniors and seniors",
    refs: [
      {
        id: "canaries",
        title:
          "Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence",
        author: "Erik Brynjolfsson, Bharat Chandar, Ruyu Chen",
        publication: "Stanford Digital Economy Lab",
        date: "November 2025 revision",
        url: "https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf",
        took: "ADP payroll data. Employment of software developers aged 22 to 25 fell nearly 20% from its late-2022 peak, while older workers held steady.",
      },
      {
        id: "canaries-timing",
        title:
          "Canaries, interest rates and timing: more on recent drivers of employment changes for young workers",
        author: "Stanford Digital Economy Lab",
        publication: "Stanford Digital Economy Lab",
        date: "9 February 2026",
        url: "https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers",
        took: "With stricter controls the decline is significant only after 2024. Some of the timing may reflect factors other than AI. Interest rates did not explain it well.",
      },
      {
        id: "feng-junior-senior",
        title:
          "From Junior to Senior: Allocating Agency and Navigating Professional Growth in Agentic AI-Mediated Software Engineering",
        author: "Dana Feng, Bhada Yun, April Yi Wang",
        publication: "CHI 2026",
        date: "31 January 2026",
        url: "https://arxiv.org/abs/2602.00496",
        took: "10 juniors and 10 seniors. Seniors keep control through detailed delegation built on pre-AI foundations. Juniors swing between over-reliance and avoidance. Organisational policy sets how much agency people have.",
      },
      {
        id: "leaddev-2025",
        title: "Junior devs still have a path to senior roles",
        author: "LeadDev",
        publication: "LeadDev (AI Impact Report 2025)",
        date: "2025",
        url: "https://leaddev.com/hiring/junior-devs-still-have-path-senior-roles",
        took: "38% of respondents agreed AI tools have reduced the direct mentoring juniors get from seniors. A survey, so directional.",
      },
      {
        id: "metr-2025",
        title:
          "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity",
        author: "METR",
        publication: "metr.org",
        date: "10 July 2025",
        url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
        took: "16 experienced developers, 246 real tasks. They took 19% longer with AI and still believed it had made them about 20% faster. METR now marks it out of date.",
      },
      {
        id: "metr-2026",
        title: "We are Changing our Developer Productivity Experiment Design",
        author: "METR",
        publication: "metr.org",
        date: "24 February 2026",
        url: "https://metr.org/blog/2026-02-24-uplift-update/",
        took: "The follow-up could not measure the effect reliably, because developers declined to work without AI. METR thinks gains are probably larger now, on very weak evidence.",
      },
      {
        id: "so-2025",
        title: "2025 Stack Overflow Developer Survey: AI",
        author: "Stack Overflow",
        publication: "survey.stackoverflow.co",
        date: "July 2025",
        url: "https://survey.stackoverflow.co/2025/ai",
        took: "46% distrust the accuracy of AI tools against 33% who trust it. 66% name answers that are almost right, but not quite, as their top frustration.",
      },
      {
        id: "sonar-2026",
        title: "State of Code Developer Survey report: the current reality of AI coding",
        author: "Sonar",
        publication: "sonarsource.com",
        date: "January 2026",
        url: "https://www.sonarsource.com/blog/state-of-code-developer-survey-report-the-current-reality-of-ai-coding/",
        took: "Over 1,100 developers. 96% do not fully trust AI code to be correct, yet only 48% say they always check it before committing. Vendor survey, self-reported.",
      },
    ],
  },
  {
    heading: "Asking good questions",
    refs: [
      {
        id: "adesope",
        title: "Rethinking the Use of Tests: A Meta-Analysis of Practice Testing",
        author: "Olusola O. Adesope, Dominic A. Trevisan, Narayankripa Sundararajan",
        publication: "Review of Educational Research",
        date: "2017",
        url: "https://doi.org/10.3102/0034654316689306",
        took: "Practice tests beat restudying, with a medium average effect. Multiple choice worked well as a format, though many studies used simple material.",
      },
      {
        id: "sparck-cwt",
        title: "On the learning benefits of confidence-weighted testing",
        author: "Erin M. Sparck, Elizabeth Ligon Bjork, Robert A. Bjork",
        publication: "Cognitive Research: Principles and Implications",
        date: "2016",
        url: "https://doi.org/10.1186/s41235-016-0003-x",
        took: "Confidence-weighted multiple choice helped people answer new, related questions more than standard multiple choice. Builds on Little and Bjork's work on competitive wrong options.",
      },
      {
        id: "bisra",
        title: "Inducing Self-Explanation: a Meta-Analysis",
        author: "Kiran Bisra, Qing Liu, John C. Nesbit, Farimah Salimi, Philip H. Winne",
        publication: "Educational Psychology Review",
        date: "2018",
        url: "https://doi.org/10.1007/s10648-018-9434-x",
        took: "64 studies. Prompting people to explain what they are learning had a medium effect (g = 0.55). Mostly undergraduates.",
      },
      {
        id: "automcq",
        title: "AutoMCQ: Automatically Generate Code Comprehension Questions using GenAI",
        author: "Martin Goodfellow, Robbie Booth, Andrew Fagan, Alasdair Lambert",
        publication: "ITiCSE 2025",
        date: "May 2025",
        url: "https://arxiv.org/abs/2505.16430",
        took: "Generated questions about each student's own code. The authors say generated questions are not reliably correct, add a button to flag bad ones, and use them for formative work only.",
      },
      {
        id: "barba-exam",
        title: "The Conversational Exam: A Scalable Assessment Design for the AI Era",
        author: "Lorena A. Barba, Laura Stegner",
        publication: "arXiv, and IEEE Computer",
        date: "15 January 2026",
        url: "https://arxiv.org/abs/2601.10691",
        took: "Students code live and explain as they go, with documentation and supervised AI. 58 students examined in small groups over two days. Validity comes from the format, not from banning tools.",
      },
      {
        id: "explyt-gate",
        title: "Comprehension debt and the quiz gate",
        author: "Explyt Team",
        publication: "Explyt Blog",
        date: "15 October 2026",
        url: "https://explyt.ai/en/blog/comprehension-debt-quiz-gate",
        took: "A design, not a study. Three change-specific questions, depth by risk tier, a wrong answer triggers investigation not failure, and a waiver recorded on the PR. Warns against ranking people by fluency.",
      },
    ],
  },
  {
    heading: "Software factories",
    refs: [
      {
        id: "oreilly-cheap-review",
        title: "Code Review After Code Gets Cheap",
        author: "Markus Eisele",
        publication: "O'Reilly Radar",
        date: "16 October 2026",
        url: "https://www.oreilly.com/radar/code-review-after-code-gets-cheap/",
        took: "Start review from a short record tying agreed behaviour to the checks that ran on this revision, and flag behaviour nobody asked for.",
      },
      {
        id: "spec-sign-off",
        title: "Who Holds the Pen? Let Specifications, Not Agents, Sign Off",
        author: "Haiqing Li and others",
        publication: "arXiv",
        date: "24 September 2026",
        url: "https://arxiv.org/abs/2609.29921",
        took: "Agents claim success more often than they pass. Checks drawn from the spec, outside the agent, should sign off.",
      },
      {
        id: "faster-than-review",
        title:
          "AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate",
        author: "Hao He, Shyam Agarwal, Yegor Denisov-Blanch and others",
        publication: "arXiv",
        date: "2 July 2026",
        url: "https://arxiv.org/abs/2607.01904",
        took: "802 developers, 196,212 PRs. Merged PRs per engineer doubled by month ten. Load per reviewer doubled, and automated review overtook human review in coverage.",
      },
      {
        id: "aidev-human-review",
        title:
          "These Aren't the Reviews You're Looking For: How Humans Review AI-Generated Pull Requests",
        author: "Kacper Duma, Patryk Wróblewski, Jagoda Bobińska, Julia Winiarska, Piotr Przymus",
        publication: "EASE 2026 (arXiv)",
        date: "4 May 2026",
        url: "https://arxiv.org/abs/2605.02273",
        took: "Most AI-generated PRs in the AIDev dataset get no review. When they are reviewed, AI agents dominate, and human involvement often shows up as steering the agent rather than judging the change.",
      },
      {
        id: "less-reuse",
        title:
          "More Code, Less Reuse: Investigating Code Quality and Reviewer Sentiment towards AI-generated Pull Requests",
        author:
          "Haoming Huang, Pongchai Jaisri, Shota Shimizu, Lingfeng Chen, Sota Nakashima, Gema Rodríguez-Pérez",
        publication: "MSR 2026 (arXiv)",
        date: "29 January 2026",
        url: "https://arxiv.org/abs/2601.21276",
        took: "Agent PRs skipped reuse and added redundancy, yet reviewers reacted more neutrally or positively to them than to human PRs.",
      },
      {
        id: "agents-review-behaviour",
        title: "Does Working with AI Agents Change How Developers Code, Test, and Review?",
        author: "Muhammad Hamza, Dominik Siemon, Wardah Naeem Awan",
        publication: "ESEM 2026 (LIPIcs)",
        date: "5 October 2026",
        url: "https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ESEM.2026.67",
        took: "669 developers with a control group. After agent adoption, reviews got faster, less detailed and more permissive, but control repositories showed the same trend, so it may not be the agents.",
      },
      {
        id: "agentstepper",
        title: "AgentStepper: Interactive Debugging of Software Development Agents",
        author: "Robert Hutter, Michael Pradel",
        publication: "arXiv",
        date: "6 February 2026",
        url: "https://arxiv.org/abs/2602.06593",
        took: "12 developers. Reading raw agent logs, they found bugs in the agent's implementation 17% of the time. With a stepping tool, 60%. Interpretation of the trajectory was about two thirds right either way. Debugging, not PR review.",
      },
    ],
  },
  {
    heading: "Alternatives and spreading knowledge",
    refs: [
      {
        id: "rigby-bird",
        title: "Convergent Contemporary Software Peer Review Practices",
        author: "Peter C. Rigby, Christian Bird",
        publication: "ESEC/FSE 2013",
        date: "August 2013",
        url: "https://www.microsoft.com/en-us/research/publication/convergent-software-peer-review-practices/",
        took: "Review at Google, Microsoft, AMD and in open source converged on similar practices, and spreads knowledge of the system: developers come to know files they review but never edit.",
      },
      {
        id: "ram-reviewability",
        title:
          "What Makes a Code Change Easier to Review? An Empirical Investigation on Code Change Reviewability",
        author: "Achyudh Ram, Anand Ashok Sawant, Marco Castelluccio, Alberto Bacchelli",
        publication: "ESEC/FSE 2018",
        date: "November 2018",
        url: "https://zenodo.org/records/1323659",
        took: "Interviews and 98 rated changes. The description, the size, and a coherent commit history make a change easier to review.",
      },
      {
        id: "myers-walkthrough",
        title: "A controlled experiment in program testing and code walkthroughs/inspections",
        author: "Glenford J. Myers",
        publication: "Communications of the ACM",
        date: "September 1978",
        url: "https://doi.org/10.1145/359588.359602",
        took: "59 professionals. Walkthroughs and inspections found errors about as well as testing, pairs did best, and people varied enormously. About finding errors, not understanding.",
      },
      {
        id: "palmer-journal",
        title: "The learning outcomes of an online reflective journal in engineering",
        author: "Stuart Palmer, Dale Holt, Sharyn Bray",
        publication: "ascilite 2008",
        date: "December 2008",
        url: "https://ascilite.org/conferences/melbourne08/procs/palmer.pdf",
        took: "Students valued a reflective journal, and the number of entries predicted the final mark alongside prior performance. One course, correlational.",
      },
      {
        id: "plonka-pairing",
        title: "Knowledge transfer in pair programming: An in-depth analysis",
        author: "Laura Plonka, Helen Sharp, Janet van der Linden, Yvonne Dittrich",
        publication: "International Journal of Human-Computer Studies",
        date: "2015",
        url: "https://doi.org/10.1016/j.ijhcs.2014.09.001",
        took: "Video of expert-novice pairs in industry. Experts used six teaching strategies, but novices rarely articulated, reflected or explored. Delivery pressure shaped what was taught.",
      },
      {
        id: "hannay-pairing",
        title: "The effectiveness of pair programming: A meta-analysis",
        author: "Jo E. Hannay, Tore Dybå, Erik Arisholm, Dag I. K. Sjøberg",
        publication: "Information and Software Technology",
        date: "2009",
        url: "https://doi.org/10.1016/j.infsof.2009.02.001",
        took: "A small gain in quality, mostly on complex tasks, at a medium cost in effort. Wide variation between studies, and signs of publication bias.",
      },
      {
        id: "avelino-truck",
        title: "A novel approach for estimating Truck Factors",
        author: "Guilherme Avelino, Leonardo Passos, Andre Hora, Marco Tulio Valente",
        publication: "ICPC 2016",
        date: "May 2016",
        url: "https://doi.org/10.1109/ICPC.2016.7503718",
        took: "Of 133 popular GitHub projects, 46% would be crippled by losing one developer and 28% by losing two. Knowledge of code concentrates in few people.",
      },
      {
        id: "rigby-turnover",
        title:
          "Quantifying and mitigating turnover-induced knowledge loss: case studies of Chrome and a project at Avaya",
        author: "Peter C. Rigby, Yue Cai Zhu, Samuel M. Donadelli, Audris Mockus",
        publication: "ICSE 2016",
        date: "May 2016",
        url: "https://doi.org/10.1145/2884781.2884851",
        took: "Losses from people leaving can exceed three times the expected loss. Naming successors for at-risk files cut expected loss by up to 15%. Knowledge measured from who edits files, not who understands them.",
      },
    ],
  },
  {
    heading: "Policy, privacy and tools",
    refs: [
      {
        id: "kernel-assistants",
        title: "AI Coding Assistants",
        author: "The Linux kernel community",
        publication: "docs.kernel.org",
        date: "Checked 25 November 2026",
        url: "https://docs.kernel.org/process/coding-assistants.html",
        took: "AI agents must not add Signed-off-by. The human submitter reviews all AI-generated code and takes full responsibility. Its linked guidelines for tool-generated content ask contributors to be transparent about where content came from in cover letters and changelogs; the page no longer names an Assisted-by tag.",
      },
      {
        id: "gnome-review",
        title: "Review Guidelines (GNOME Shell extensions)",
        author: "GNOME",
        publication: "gjs.guide",
        date: "Checked 30 October 2026",
        url: "https://gjs.guide/extensions/review-guidelines/review-guidelines.html",
        took: "AI-generated extensions are rejected. AI as a learning aid or tool is allowed, but developers must be able to justify and explain what they submit.",
      },
      {
        id: "ravid-epm",
        title:
          "A meta-analysis of the effects of electronic performance monitoring on work outcomes",
        author:
          "Daniel M. Ravid, Jerod C. White, David L. Tomczak, Ahleah F. Miles, Tara S. Behrend",
        publication: "Personnel Psychology",
        date: "2023 (online April 2022)",
        url: "https://doi.org/10.1111/peps.12514",
        took: "Monitoring with no explicit purpose was not linked to better performance. More transparent, less invasive monitoring went with better attitudes. Monitoring went with more stress.",
      },
      {
        id: "eu-ai-act",
        title: "Regulation (EU) 2024/1689 (the AI Act), Annex III",
        author: "European Union",
        publication: "Official Journal of the EU",
        date: "12 July 2024",
        url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
        took: "AI used to monitor and evaluate the performance and behaviour of workers is high risk. The Annex III obligations were due on 2 August 2026, and a deferral to December 2027 has been proposed. Check the current status.",
      },
      {
        id: "sphinx",
        title: "Sphinx",
        author: "parthh01",
        publication: "GitHub",
        date: "October 2026",
        url: "https://github.com/parthh01/sphinx",
        took: "A git hook that pauses a push and asks a scenario question about the diff. Disputes fix bad questions, skips are logged, and the README calls it practice, not a security control.",
      },
      {
        id: "pr-quiz",
        title: "PR Quiz Gate",
        author: "Michael Beutler",
        publication: "GitHub",
        date: "2026",
        url: "https://github.com/michaelbeutler/pr-quiz",
        took: "Quizzes reviewers before their approval counts, and lets a reviewer challenge the author. A second model pass drops questions it cannot answer. Its README says the quiz is open book.",
      },
    ],
  },
];

export const ALL_REFERENCES: Reference[] = [...BUILT_ON, ...FURTHER_READING.flatMap((g) => g.refs)];

export function referenceById(id: ReferenceId): Reference {
  const ref = ALL_REFERENCES.find((r) => r.id === id);
  if (!ref) throw new Error(`Unknown reference: ${id}`);
  return ref;
}

// The evidence, labelled by strength.

export type Strength = "Strong" | "Moderate" | "Weak" | "Opinion" | "Gap";

export const STRENGTH: Record<Strength, string> = {
  Strong: "Large sample or controlled trial, primary source.",
  Moderate: "Reasonable data but a single study, a preprint, or notable confounders.",
  Weak: "Vendor reports, surveys, or a single blog. Directional only.",
  Opinion: "Practitioner argument with no data.",
  Gap: "Nothing solid found.",
};

export interface Claim {
  id: string;
  topic: ClaimTopic;
  text: string;
  strength: Strength;
  caveat?: string;
  sources: ReferenceId[];
}

export const CLAIM_TOPICS = [
  "AI in code review",
  "Understanding",
  "Juniors",
  "Seniors",
  "Asking questions",
  "Privacy",
  "Software factories",
  "Alternatives",
] as const;

export type ClaimTopic = (typeof CLAIM_TOPICS)[number];

export const CLAIMS: Claim[] = [
  {
    id: "bot-acceptance",
    topic: "AI in code review",
    text: "Developers accepted 36.4% of one review bot's comments, discussed 7.3%, and rejected 56.3%.",
    strength: "Moderate",
    caveat: "One bot, 239 repos. A preprint.",
    sources: ["coderabbit-wild"],
  },
  {
    id: "agent-only-merge",
    topic: "AI in code review",
    text: "PRs reviewed only by agents merged at 45%, against 68% for human-only review. 12 of 13 agents had an average signal ratio below 60%.",
    strength: "Moderate",
    caveat: "Observational. Agent-only PRs may differ in kind.",
    sources: ["cra-empirical"],
  },
  {
    id: "habituation",
    topic: "AI in code review",
    text: "Reviewers' approval of agent PRs rose from 30.5% to 36.6% over their history, while simple comment-effort measures stayed flat.",
    strength: "Weak",
    caveat: "Agents may simply have improved. No defect data. Unreplicated.",
    sources: ["habituation"],
  },
  {
    id: "review-understanding",
    topic: "AI in code review",
    text: "Understanding the change is the core of code review, and knowledge transfer is one of its main outcomes.",
    strength: "Strong",
    caveat: "Pre-AI, one company. Observation, interviews and surveys.",
    sources: ["bacchelli-bird"],
  },
  {
    id: "automation-bias",
    topic: "AI in code review",
    text: "People with an AI assistant wrote less secure code and were more confident it was secure.",
    strength: "Moderate",
    caveat: "47 participants, 2022 tools, writing not reviewing.",
    sources: ["perry"],
  },
  {
    id: "rct-skills",
    topic: "Understanding",
    text: "In a randomized trial, the AI group scored 50% on a comprehension quiz against 67% for people who coded by hand. The speed gain was not significant.",
    strength: "Strong",
    caveat: "52 people, one session, a chat assistant not an agent. Tested straight after.",
    sources: ["shen-tamkin"],
  },
  {
    id: "rct-patterns",
    topic: "Understanding",
    text: "How people used AI mattered. Delegation, progressive reliance and iterative AI debugging scored 24% to 39%. Conceptual inquiry, hybrid code explanation and generate-then-understand scored 65% to 86%.",
    strength: "Moderate",
    caveat: "Groups of 2 to 7 people. Correlation, not cause.",
    sources: ["shen-tamkin"],
  },
  {
    id: "agents-understanding",
    topic: "Understanding",
    text: "Coding agents helped students finish faster but hurt their comprehension of their own code. Low-effort use, like auto-accepting edits, went with the lowest understanding.",
    strength: "Moderate",
    caveat: "54 students, a preprint.",
    sources: ["impaired"],
  },
  {
    id: "cognitive-debt",
    topic: "Understanding",
    text: "People who wrote essays with an LLM showed weaker brain connectivity and most could not quote what they had written.",
    strength: "Weak",
    caveat:
      "Essays, not code. 54 people, 18 in the crossover. Unreviewed preprint, widely overstated.",
    sources: ["kosmyna"],
  },
  {
    id: "confidence-thinking",
    topic: "Understanding",
    text: "Knowledge workers who trusted the AI more reported less critical thinking. Those who trusted themselves more reported more.",
    strength: "Moderate",
    caveat: "Self-reported survey of 319 people.",
    sources: ["lee-critical"],
  },
  {
    id: "explain-own-code",
    topic: "Understanding",
    text: "About a third of students struggled to explain code they had just written. Answering questions about it tracked course success better than a correct submission did.",
    strength: "Moderate",
    caveat: "Pre-AI students, one course.",
    sources: ["lehtinen-struggle"],
  },
  {
    id: "junior-employment",
    topic: "Juniors",
    text: "Employment of software developers aged 22 to 25 fell nearly 20% from its late-2022 peak, while older workers held steady.",
    strength: "Strong",
    caveat:
      "Payroll data, causes debated. Under stricter controls the drop is significant only after 2024.",
    sources: ["canaries", "canaries-timing"],
  },
  {
    id: "mentoring-down",
    topic: "Juniors",
    text: "38% of engineering leaders surveyed agreed AI tools have reduced the direct mentoring juniors get from seniors.",
    strength: "Weak",
    caveat: "One survey, figures reported in articles rather than the full report.",
    sources: ["leaddev-2025"],
  },
  {
    id: "junior-agency",
    topic: "Juniors",
    text: "Juniors swing between over-reliance and avoidance. Seniors keep control through detailed delegation built on pre-AI foundations.",
    strength: "Moderate",
    caveat: "Qualitative, 20 people.",
    sources: ["feng-junior-senior"],
  },
  {
    id: "review-mentoring",
    topic: "Juniors",
    text: "Review is losing its mentoring function as bots take the first pass.",
    strength: "Opinion",
    sources: ["osmani-debt"],
  },
  {
    id: "senior-slower",
    topic: "Seniors",
    text: "Experienced developers took 19% longer with early-2025 AI tools but believed they were about 20% faster.",
    strength: "Strong",
    caveat: "For early-2025 tools only. METR now marks it out of date.",
    sources: ["metr-2025"],
  },
  {
    id: "metr-follow-up",
    topic: "Seniors",
    text: "METR's follow-up could not measure the effect reliably, because developers declined to work without AI. It thinks gains are probably larger now.",
    strength: "Moderate",
    caveat: "METR calls its own evidence very weak.",
    sources: ["metr-2026"],
  },
  {
    id: "almost-right",
    topic: "Seniors",
    text: "Most developers name almost-right AI output as their top frustration, and fewer than half always check AI code before committing.",
    strength: "Weak",
    caveat: "Surveys, one from a vendor.",
    sources: ["so-2025", "sonar-2026"],
  },
  {
    id: "senior-deskilling",
    topic: "Seniors",
    text: "Experienced developers lose skill when AI does the work.",
    strength: "Gap",
    caveat: "Predicted since 1983 for automation in general. No study of senior engineers found.",
    sources: ["bainbridge"],
  },
  {
    id: "testing-effect",
    topic: "Asking questions",
    text: "Practice tests improve later recall more than restudying, and multiple choice works well as a format.",
    strength: "Strong",
    caveat: "Many studies used simple material, not code.",
    sources: ["adesope"],
  },
  {
    id: "confidence-weighted",
    topic: "Asking questions",
    text: "Confidence-weighted multiple choice improved answers to new, related questions more than standard multiple choice.",
    strength: "Moderate",
    caveat: "Lab studies, not workplace.",
    sources: ["sparck-cwt"],
  },
  {
    id: "self-explanation",
    topic: "Asking questions",
    text: "Prompting people to explain what they are learning has a medium effect on learning.",
    strength: "Strong",
    caveat: "Mostly undergraduates.",
    sources: ["bisra"],
  },
  {
    id: "llm-questions-wrong",
    topic: "Asking questions",
    text: "LLM-written questions about code are not reliably correct, so the authors use them for formative work only.",
    strength: "Moderate",
    caveat: "A two-page tool paper.",
    sources: ["automcq"],
  },
  {
    id: "llm-answers",
    topic: "Asking questions",
    text: "GPT-4 answered 88% of questions about code correctly. A question alone cannot tell a person from a model.",
    strength: "Moderate",
    caveat: "2024 models. Today's do better.",
    sources: ["lehtinen-ai-qlc"],
  },
  {
    id: "oral-exam",
    topic: "Asking questions",
    text: "Live, conversational oral exams can scale to a class of 58 and keep their validity with AI allowed.",
    strength: "Weak",
    caveat: "One course, no outcome data.",
    sources: ["barba-exam"],
  },
  {
    id: "gate-works",
    topic: "Asking questions",
    text: "A comprehension gate on PRs changes defects, learning, or review quality.",
    strength: "Gap",
    caveat: "No tool found publishes an evaluation.",
    sources: ["explyt-gate", "sphinx", "pr-quiz"],
  },
  {
    id: "epm",
    topic: "Privacy",
    text: "Monitoring with no explicit purpose was not linked to better performance. Transparent, less invasive monitoring went with better attitudes.",
    strength: "Strong",
    caveat: "Meta-analysis of workplace monitoring in general, not code.",
    sources: ["ravid-epm"],
  },
  {
    id: "ai-act",
    topic: "Privacy",
    text: "In the EU, AI used to monitor or evaluate workers' performance and behaviour is classed as high risk.",
    strength: "Strong",
    caveat: "The date the obligations apply may have moved. Check before relying on it.",
    sources: ["eu-ai-act"],
  },
  {
    id: "map-reception",
    topic: "Privacy",
    text: "A private map of understanding is received as growth feedback rather than surveillance.",
    strength: "Gap",
    caveat: "This is Viva's open question.",
    sources: ["ravid-epm"],
  },
  {
    id: "agent-prs-unreviewed",
    topic: "Software factories",
    text: "Most AI-generated PRs get no review. When they are reviewed, AI agents dominate, and people mostly steer the agent rather than judge the change.",
    strength: "Moderate",
    caveat: "Open-source PRs in one dataset. Qualitative summary, numbers in the paper.",
    sources: ["aidev-human-review"],
  },
  {
    id: "reviewer-load-doubled",
    topic: "Software factories",
    text: "Under a mandate to double merged PRs with AI, load per reviewer doubled and automated review overtook human review in coverage.",
    strength: "Moderate",
    caveat: "One company, 802 developers, not randomized.",
    sources: ["faster-than-review"],
  },
  {
    id: "agents-overclaim",
    topic: "Software factories",
    text: "Agents claimed completion 28.7 to 37.9 points more often than an evaluator confirmed it.",
    strength: "Moderate",
    caveat: "A preprint on general agent tasks, not coding PRs.",
    sources: ["spec-sign-off"],
  },
  {
    id: "reviewers-warmer",
    topic: "Software factories",
    text: "Reviewers reacted more neutrally or positively to agent PRs than to human ones, though agent PRs carried more redundancy.",
    strength: "Moderate",
    caveat: "Sentiment analysis of review comments, not approval decisions.",
    sources: ["less-reuse"],
  },
  {
    id: "reviews-loosen",
    topic: "Software factories",
    text: "After teams adopted agents, reviews got faster, less detailed and more permissive, but repositories without agents changed the same way.",
    strength: "Moderate",
    caveat: "Difference-in-differences design. Cuts against blaming agents for looser review.",
    sources: ["agents-review-behaviour"],
  },
  {
    id: "session-reading",
    topic: "Software factories",
    text: "Reading an agent's session helps a person understand the change.",
    strength: "Gap",
    caveat:
      "Untested for review. In one small study, developers reading raw agent logs found the agent's bugs 17% of the time, and 60% with a stepping tool.",
    sources: ["agentstepper"],
  },
  {
    id: "knowledge-concentrates",
    topic: "Software factories",
    text: "Knowledge of code concentrates in few people: 46% of 133 popular GitHub projects would be crippled by losing one developer.",
    strength: "Moderate",
    caveat: "Measured from who edits files, before agents wrote much code.",
    sources: ["avelino-truck"],
  },
  {
    id: "successors",
    topic: "Software factories",
    text: "Losses when people leave can exceed three times the expected loss. Naming successors for at-risk files cut expected loss by up to 15%.",
    strength: "Moderate",
    caveat: "Two case studies, Chrome and one Avaya project.",
    sources: ["rigby-turnover"],
  },
  {
    id: "review-spreads-knowledge",
    topic: "Alternatives",
    text: "Code review spreads knowledge of the system: developers come to know files they review but never edit.",
    strength: "Moderate",
    caveat: "Google, Microsoft, AMD and open source, pre-AI.",
    sources: ["rigby-bird"],
  },
  {
    id: "reviewability",
    topic: "Alternatives",
    text: "A clear description, a small size and a coherent commit history make a change easier to review.",
    strength: "Moderate",
    caveat: "Ten interviews and 98 rated changes, pre-AI.",
    sources: ["ram-reviewability"],
  },
  {
    id: "walkthroughs",
    topic: "Alternatives",
    text: "Walkthroughs and inspections found errors about as well as testing, pairs did best, and people varied enormously.",
    strength: "Moderate",
    caveat: "1978, about finding errors, not checking understanding.",
    sources: ["myers-walkthrough"],
  },
  {
    id: "walkthrough-checks",
    topic: "Alternatives",
    text: "A short walkthrough checks whether the author understands an AI-assisted change.",
    strength: "Gap",
    caveat: "Untested. Closest is a live oral exam in one course.",
    sources: ["barba-exam"],
  },
  {
    id: "journals",
    topic: "Alternatives",
    text: "A reflective learning journal helps people learn.",
    strength: "Weak",
    caveat:
      "Engineering students value it, and entries predicted marks in one course. Correlational, self-reported.",
    sources: ["palmer-journal"],
  },
  {
    id: "pairing-transfer",
    topic: "Alternatives",
    text: "Expert-novice pairing transfers knowledge in industry, but novices rarely articulate, reflect or explore, and delivery pressure shapes what is taught.",
    strength: "Moderate",
    caveat: "Qualitative video analysis.",
    sources: ["plonka-pairing"],
  },
  {
    id: "pairing-quality",
    topic: "Alternatives",
    text: "Pair programming gives a small gain in quality, mostly on complex tasks, at a medium cost in effort.",
    strength: "Moderate",
    caveat:
      "Meta-analysis with wide variation and signs of publication bias. Measures quality, not learning.",
    sources: ["hannay-pairing"],
  },
];

// Bringing checks in.

export type AdoptionStage = "Start" | "Next" | "Later";

export const ADOPTION_STAGES: { stage: AdoptionStage; summary: string; sources: ReferenceId[] }[] =
  [
    {
      stage: "Start",
      summary:
        "Ownership, before any quiz. Authors review AI output first, write their own descriptions, disclose AI help, and triage bot comments before acting on them. Reviewers approve only what they could explain.",
      sources: ["llvm-policy", "kernel-assistants", "bacchelli-bird"],
    },
    {
      stage: "Next",
      summary:
        "One small question on AI-assisted PRs, with a confidence rating, private to the person. A wrong answer starts a conversation. Questions can be disputed.",
      sources: ["lehtinen-qlc", "sparck-cwt", "explyt-gate"],
    },
    {
      stage: "Later",
      summary:
        "A private map built from many answers, gaps turned into pairing, and a real evaluation of whether any of it changes defects, learning, or how people feel.",
      sources: ["ravid-epm", "feng-junior-senior"],
    },
  ];

export interface Guide {
  stage: AdoptionStage;
  ai: string;
  human: string;
  sources: ReferenceId[];
}

export const GUIDE: Record<StationId, Guide> = {
  draft: {
    stage: "Start",
    ai: "An assistant or agent drafts the change. Asked well, it also explains: why this approach, what the concept is, what would break.",
    human:
      "The author. They choose how to use the AI, and read what it wrote before anyone else has to.",
    sources: ["shen-tamkin", "impaired"],
  },
  post: {
    stage: "Start",
    ai: "None for the description. An AI can check that the description matches the diff.",
    human:
      "The author writes why, what, and the decision they are least sure of, and discloses AI help.",
    sources: ["llvm-policy", "kernel-assistants", "explyt-gate"],
  },
  bot: {
    stage: "Start",
    ai: "A review bot comments on the diff. A second check can confirm each comment points at code that exists.",
    human: "The author and reviewer triage each comment. Whoever forwards one owns it.",
    sources: ["coderabbit-wild", "cra-empirical", "llvm-policy"],
  },
  review: {
    stage: "Start",
    ai: "Summaries and a first pass. Read as claims.",
    human: "The reviewer approves only what they could explain to someone else.",
    sources: ["bacchelli-bird", "habituation", "owasp-ai"],
  },
  viva: {
    stage: "Next",
    ai: "A model writes one scenario question from the diff. A second pass drops questions it cannot answer itself.",
    human: "The author answers with a confidence rating. Either side can dispute a bad question.",
    sources: ["lehtinen-qlc", "automcq", "pr-quiz"],
  },
  merge: {
    stage: "Next",
    ai: "None. The answer is shown to the reviewer.",
    human:
      "The reviewer decides. A wrong answer opens a short conversation. Anyone can waive with a reason.",
    sources: ["explyt-gate", "sphinx"],
  },
  map: {
    stage: "Later",
    ai: "Groups answers by topic over time.",
    human: "The person owns their map and chooses what to share. Nobody ranks it.",
    sources: ["ravid-epm", "eu-ai-act"],
  },
  loop: {
    stage: "Later",
    ai: "Suggests a next step for a thin area.",
    human: "The person and a mentor pick the next step. Seniors teach, and get asked too.",
    sources: ["feng-junior-senior", "leaddev-2025"],
  },
};

// Recommendations, labelled.

export type Maturity = "Best practice" | "Cutting edge";

export const MATURITY: Record<Maturity, string> = {
  "Best practice":
    "Well established. Several independent sources say it, and projects already do it.",
  "Cutting edge":
    "Newer. The evidence is one or two small studies, a design proposal, or early tooling.",
};

export interface Recommendation {
  id: string;
  station: StationId;
  stage: AdoptionStage;
  maturity: Maturity;
  text: string;
  sources: ReferenceId[];
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "self-review-first",
    station: "draft",
    stage: "Start",
    maturity: "Best practice",
    text: "Read every AI-written line before asking anyone else to. Unreviewed output moves the work onto the reviewer.",
    sources: ["llvm-policy", "kernel-assistants", "gnome-review"],
  },
  {
    id: "use-ai-to-understand",
    station: "draft",
    stage: "Start",
    maturity: "Cutting edge",
    text: "Use AI to explain, not only to produce. Ask why, ask about the concept, or generate and then make sure you could rewrite it. Handing over the whole task scored lowest on understanding.",
    sources: ["shen-tamkin", "impaired"],
  },
  {
    id: "keep-learning-work",
    station: "draft",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Keep some work AI-free on purpose for people learning an area. LLVM forbids AI on good first issues for this reason.",
    sources: ["llvm-policy", "shen-tamkin"],
  },
  {
    id: "own-description",
    station: "post",
    stage: "Start",
    maturity: "Best practice",
    text: "Write the PR description yourself: why, what, and the decision you are least sure of. Be ready to answer questions about it.",
    sources: ["llvm-policy", "gnome-review", "explyt-gate"],
  },
  {
    id: "disclose",
    station: "post",
    stage: "Start",
    maturity: "Best practice",
    text: "Disclose AI help in the PR or commit, for example with an Assisted-by trailer. It tells the reviewer where to look harder. The human still signs off.",
    sources: ["llvm-policy", "kernel-assistants"],
  },
  {
    id: "bot-comments-are-claims",
    station: "bot",
    stage: "Start",
    maturity: "Best practice",
    text: "Treat each bot comment as a claim to check. In the largest study, more were rejected than accepted.",
    sources: ["coderabbit-wild", "cra-empirical", "owasp-ai"],
  },
  {
    id: "repost-owns",
    station: "bot",
    stage: "Next",
    maturity: "Cutting edge",
    text: "If you forward or repost an AI comment, you own it. Ask the people who post AI comments the same small question you ask authors.",
    sources: ["llvm-policy", "coderabbit-wild"],
  },
  {
    id: "track-acceptance",
    station: "bot",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Track how often bot comments are accepted, and re-test when the model changes. A bot nobody listens to trains people to skim.",
    sources: ["coderabbit-wild", "cra-empirical"],
  },
  {
    id: "approve-what-you-can-explain",
    station: "review",
    stage: "Start",
    maturity: "Best practice",
    text: "Approve only what you could explain to someone else. A named person approves, and AI review does not replace it.",
    sources: ["bacchelli-bird", "owasp-ai", "osmani-debt"],
  },
  {
    id: "watch-habituation",
    station: "review",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Watch for drift: approval of agent PRs rising while review comments thin out. Sample approved PRs for a second read.",
    sources: ["habituation", "perry", "bainbridge"],
  },
  {
    id: "quiz-reviewers",
    station: "review",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Ask reviewers a question too, before their approval counts. Approval is a claim of understanding.",
    sources: ["pr-quiz", "habituation"],
  },
  {
    id: "one-small-question",
    station: "viva",
    stage: "Next",
    maturity: "Cutting edge",
    text: "After an AI-assisted PR, ask the author one small scenario question about their own change. A minute, not an exam.",
    sources: ["lehtinen-qlc", "lehtinen-struggle", "sphinx", "explyt-gate"],
  },
  {
    id: "ask-confidence",
    station: "viva",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Ask for a confidence rating with the answer. A confident wrong answer is the signal that matters most.",
    sources: ["sparck-cwt", "lee-critical"],
  },
  {
    id: "teach-with-the-answer",
    station: "viva",
    stage: "Next",
    maturity: "Best practice",
    text: "Show the answer and the reason straight after. Practice questions with plausible wrong options improve later recall, and explaining helps learning.",
    sources: ["adesope", "sparck-cwt", "bisra"],
  },
  {
    id: "dispute-questions",
    station: "viva",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Let people dispute a question. Model-written questions are sometimes wrong, and a bad question is fixed before it counts.",
    sources: ["automcq", "sphinx", "pr-quiz"],
  },
  {
    id: "practice-not-security",
    station: "viva",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Treat the question as practice, not a security control. A model answers most questions about code, so a pass alone proves little.",
    sources: ["lehtinen-ai-qlc", "pr-quiz", "sphinx"],
  },
  {
    id: "talk-not-block",
    station: "merge",
    stage: "Next",
    maturity: "Cutting edge",
    text: "A wrong answer opens a short conversation, not a block. Block only when a critical behaviour stays unexplained.",
    sources: ["explyt-gate", "sphinx"],
  },
  {
    id: "waiver-recorded",
    station: "merge",
    stage: "Next",
    maturity: "Cutting edge",
    text: "Let anyone waive the check, with a reason that stays on the PR.",
    sources: ["explyt-gate", "sphinx"],
  },
  {
    id: "private-by-default",
    station: "map",
    stage: "Later",
    maturity: "Best practice",
    text: "Keep each person's answers private to them. They choose what to share. Never rank people by it or use it in performance review.",
    sources: ["ravid-epm", "eu-ai-act", "explyt-gate"],
  },
  {
    id: "say-why-first",
    station: "map",
    stage: "Later",
    maturity: "Best practice",
    text: "Say what is collected, why, and for how long before the first question is asked.",
    sources: ["ravid-epm", "eu-ai-act"],
  },
  {
    id: "topics-not-people",
    station: "map",
    stage: "Later",
    maturity: "Cutting edge",
    text: "If a team looks at anything, look at topics, not people: which areas of the code few people can explain.",
    sources: ["ravid-epm", "osmani-debt"],
  },
  {
    id: "gaps-to-pairing",
    station: "loop",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Turn a thin area into the next step: pair with someone strong in it, or write the next change there by hand.",
    sources: ["feng-junior-senior", "leaddev-2025", "shen-tamkin"],
  },
  {
    id: "evaluate-it",
    station: "loop",
    stage: "Later",
    maturity: "Cutting edge",
    text: "Measure whether the checks change anything: defects that escape review, how well people explain changes later, and how the checks feel. Nobody has published this yet.",
    sources: ["explyt-gate", "ravid-epm"],
  },
];

export function recommendationById(id: string): Recommendation {
  const r = RECOMMENDATIONS.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown recommendation: ${id}`);
  return r;
}

// Prior art: tools that already exist, and what they leave open.

export const TOOLS_CHECKED = "30 October 2026";

export type Fit = "Full" | "Partial";

export interface Tool {
  name: string;
  url: string;
  what: string;
  evidence: string;
  fits: { rec: string; fit: Fit; note: string }[];
}

export const TOOLS: Tool[] = [
  {
    name: "Sphinx",
    url: "https://github.com/parthh01/sphinx",
    what: "A git hook. Pauses a push to a protected branch and asks a scenario question about the diff in a local page.",
    evidence: "None published. The README calls it practice, not a security control.",
    fits: [
      { rec: "one-small-question", fit: "Full", note: "One scenario question per push." },
      {
        rec: "dispute-questions",
        fit: "Full",
        note: "A disputed question is fixed before it counts.",
      },
      { rec: "waiver-recorded", fit: "Partial", note: "Skips are logged locally, not on the PR." },
    ],
  },
  {
    name: "PR Quiz Gate",
    url: "https://github.com/michaelbeutler/pr-quiz",
    what: "A GitHub Action. Reviewers answer multiple-choice questions written from the diff before their approval counts. A reviewer can challenge the author.",
    evidence: "None published. Notes the quiz is open book.",
    fits: [
      { rec: "quiz-reviewers", fit: "Full", note: "Approval counts only after a pass." },
      {
        rec: "one-small-question",
        fit: "Partial",
        note: "Authors only when a reviewer challenges them.",
      },
      {
        rec: "dispute-questions",
        fit: "Partial",
        note: "A second model pass drops questions it gets wrong.",
      },
    ],
  },
  {
    name: "pr-quiz (Revodata)",
    url: "https://github.com/revodatanl/pr-quiz",
    what: "A GitHub merge gate backed by Databricks. A multiple-choice quiz from the diff, and a perfect score unlocks merge.",
    evidence: "None published.",
    fits: [
      {
        rec: "one-small-question",
        fit: "Partial",
        note: "Several questions and a hard block, not one and a conversation.",
      },
    ],
  },
  {
    name: "Gater",
    url: "https://usegater.app/",
    what: "A GitHub App. Generates a quiz from the PR diff. Passing unblocks the merge check.",
    evidence: "None published.",
    fits: [
      {
        rec: "one-small-question",
        fit: "Partial",
        note: "A quiz gate, with team performance tracking.",
      },
      { rec: "quiz-reviewers", fit: "Partial", note: "Pitched against rubber-stamp reviews." },
    ],
  },
  {
    name: "Commit Comprehension Gate",
    url: "https://dev.to/islandbytes/i-built-a-merge-gate-that-quizzes-developers-on-their-own-code-changes-heres-why-and-how-5460",
    what: "A write-up and build. Claude writes three multiple-choice questions per PR. Merge waits until the author answers.",
    evidence: "None published.",
    fits: [{ rec: "one-small-question", fit: "Partial", note: "Three questions and a block." }],
  },
  {
    name: "Moodle certainty-based marking",
    url: "https://docs.moodle.org/501/en/Using_certainty-based_marking",
    what: "A quiz mode that asks for certainty with each answer and penalises confident wrong answers.",
    evidence: "Higher reliability in UCL medical exams. Built for courses, not PRs.",
    fits: [
      { rec: "ask-confidence", fit: "Partial", note: "The scoring model, outside code review." },
    ],
  },
  {
    name: "validate-pr skill",
    url: "https://www.skills.sh/arraydude/agent-skills/validate-pr",
    what: "An agent skill that checks bot review comments against the diff for hallucinations.",
    evidence: "None published.",
    fits: [
      {
        rec: "bot-comments-are-claims",
        fit: "Partial",
        note: "Checks the comment, not the person who forwards it.",
      },
    ],
  },
  {
    name: "CodeRabbit dashboard",
    url: "https://docs.coderabbit.ai/guides/dashboard",
    what: "Review bot analytics, including how comments were received.",
    evidence: "Vendor feature.",
    fits: [{ rec: "track-acceptance", fit: "Partial", note: "For one bot only." }],
  },
  {
    name: "Assisted-by trailer",
    url: "https://llvm.org/docs/AIToolPolicy.html",
    what: "A commit trailer naming the AI tool used, suggested by LLVM's AI tool policy. The Linux kernel asks for the same transparency in the changelog instead of a tag.",
    evidence: "A convention, not a tool.",
    fits: [{ rec: "disclose", fit: "Full", note: "Plain git, no setup." }],
  },
];

/** What no tool found does yet, by recommendation. */
export const GAPS: Record<string, string> = {
  "repost-owns": "No tool found asks the people who post AI review comments a question.",
  "private-by-default":
    "No tool found builds a private, longitudinal map from many small checks. Gater tracks team performance, the opposite.",
  "topics-not-people": "No tool found reports understanding by area of code rather than by person.",
  "evaluate-it":
    "No comprehension gate has published evidence that it changes defects, learning, or review quality.",
  "watch-habituation": "Approval drift is measured in research only.",
  "gaps-to-pairing": "No tool found turns a thin area into a next step.",
};

export function toolsForRecommendation(id: string): { tool: Tool; fit: Fit; note: string }[] {
  return TOOLS.flatMap((tool) =>
    tool.fits.filter((f) => f.rec === id).map((f) => ({ tool, fit: f.fit, note: f.note })),
  );
}

// What is still open.

export const OPEN_GROUND = [
  "Quiz gates at merge time are crowded. Five tools were found, and none has published evidence.",
  "Not found: a private, longitudinal map of understanding built from many small checks.",
  "Not found: quizzing the people who post AI review comments, rather than PR authors.",
  "Not found: any evaluation showing a comprehension gate changes defects, learning, or review quality.",
];

export const OPEN_QUESTIONS = [
  "Do one-question follow-ups on a PR tell people who understood apart from people who guessed or asked an AI?",
  "Does a confidence rating, rather than just right or wrong, improve the signal?",
  "Does the check change behaviour, like more reading and better comments, or just add friction?",
  "How is a map of gaps received: as growth feedback or as surveillance?",
  "Do confident wrong answers predict later review misses or incidents?",
  "Does asking seniors too keep the check from reading as a junior test?",
  "Does reading an agent's session help an approver understand the change, or is it too long to read?",
  "Is a short walkthrough harder to fake than a written question, and worth the reviewer's time?",
  "In a factory, does a topic view of what nobody can explain lead to better work orders?",
  "Do decision questions (why this approach, what must stay true, what breaks) separate understanding from a model's answer better than scenario questions, and does asking only on riskier changes keep the signal while cutting the friction?",
];

export type ExperimentStatus = "Planned" | "Running" | "Done";

export const EXPERIMENTS: { id: number; text: string; status: ExperimentStatus; result: string }[] =
  [
    {
      id: 1,
      text: "For 20 of my own merged PRs, generate one scenario question each. Rate how often I had to think rather than recall. Run it with “/viva practice” (viva skill 0.6.2+); viva-assess summarises the ratings.",
      status: "Planned",
      result: "",
    },
    {
      id: 2,
      text: "Answer the same 20 with and without an AI open. Compare.",
      status: "Planned",
      result: "",
    },
    {
      id: 3,
      text: "Compare answers with and without a confidence rating. Does confidence separate guesses from knowledge?",
      status: "Planned",
      result: "",
    },
    {
      id: 4,
      text: "Run on a small team, private output only, for two weeks. Ask what felt useful or intrusive.",
      status: "Planned",
      result: "",
    },
    {
      id: 5,
      text: "Ask reviewers who forward bot comments one question about each. How often can they defend it?",
      status: "Planned",
      result: "",
    },
    {
      id: 6,
      text: "On the same PRs, compare a written question with a five-minute walkthrough. Which one separates people who understood from people who did not, and at what cost?",
      status: "Planned",
      result: "",
    },
    {
      id: 7,
      text: "Give approvers an agent PR with and without its session. Ask the same question after each. Does the session help?",
      status: "Planned",
      result: "",
    },
    {
      id: 8,
      text: "Turn on the viva skill's options (0.7.0+): decision questions, and risk tiers that skip low-risk changes and add an optional second question on high-risk ones. Run them beside the defaults for a few weeks. The log records which style and tier each check used, so the copied summary splits grades by both. Compare the grades, confidence and disputes, and note which questions a model could answer without the person.",
      status: "Planned",
      result: "",
    },
  ];
