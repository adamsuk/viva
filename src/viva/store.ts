// How the pull request moves. Each station records one decision. A weak decision is sent back
// with a notice and the line does not move. Changing an earlier decision clears everything after it.

import { create } from "zustand";
import {
  BOT_COMMENTS,
  DEFAULT_SETUP,
  FACTORY_DRAFT_CHOICES,
  FACTORY_POST_SENT_BACK,
  notApplicable,
  type Setup,
  MAP_CHOICES,
  MERGE_CHOICES,
  QUESTION,
  STATION_IDS,
  nextStation,
  outcomeOf,
  stationIndex,
  type Confidence,
  type DraftChoice,
  type LoopChoice,
  type MapChoice,
  type MergeChoice,
  type Outcome,
  type PostChoice,
  type ReviewChoice,
  type StationId,
  type Triage,
  POST_SENT_BACK,
  REVIEW_SENT_BACK,
} from "./model.ts";
import type { Anchor, View } from "./routes.ts";

export interface WalkState {
  /** How the walk is set up. Kept when choices are cleared; changing it starts the walk again. */
  setup: Setup;
  draft: DraftChoice | null;
  post: PostChoice | null;
  triage: Record<string, Triage>;
  review: ReviewChoice | null;
  answer: string | null;
  confidence: Confidence | null;
  merge: MergeChoice | null;
  map: MapChoice | null;
  loop: LoopChoice | null;
}

export const EMPTY_WALK: WalkState = {
  setup: DEFAULT_SETUP,
  draft: null,
  post: null,
  triage: {},
  review: null,
  answer: null,
  confidence: null,
  merge: null,
  map: null,
  loop: null,
};

/** Fields owned by each station, cleared when an earlier station changes. */
const OWNS: Record<StationId, (keyof WalkState)[]> = {
  draft: ["draft"],
  post: ["post"],
  bot: ["triage"],
  review: ["review"],
  viva: ["answer", "confidence"],
  merge: ["merge"],
  map: ["map"],
  loop: ["loop"],
};

export function clearAfter(walk: WalkState, station: StationId): WalkState {
  const next = { ...walk };
  for (const id of STATION_IDS.slice(stationIndex(station) + 1)) {
    for (const key of OWNS[id]) (next as Record<string, unknown>)[key] = EMPTY_WALK[key];
  }
  return next;
}

export function stationDone(walk: WalkState, id: StationId): boolean {
  if (notApplicable(id, walk.setup)) return true;
  switch (id) {
    case "draft":
      return (
        walk.draft !== null && !FACTORY_DRAFT_CHOICES.find((c) => c.id === walk.draft)?.sentBack
      );
    case "post":
      return walk.post === "own" || walk.post === "record";
    case "bot":
      return BOT_COMMENTS.every((c) => walk.triage[c.id] === c.correct);
    case "review":
      return walk.review === "read";
    case "viva":
      return walk.answer !== null && walk.confidence !== null;
    case "merge":
      return walk.merge !== null && !MERGE_CHOICES.find((c) => c.id === walk.merge)?.sentBack;
    case "map":
      return walk.map !== null && !MAP_CHOICES.find((c) => c.id === walk.map)?.sentBack;
    case "loop":
      return walk.loop !== null;
  }
}

/** The furthest station the PR can reach: the first one not yet done. */
export function frontier(walk: WalkState): StationId {
  return STATION_IDS.find((id) => !stationDone(walk, id)) ?? "loop";
}

export function doneCount(walk: WalkState): number {
  return STATION_IDS.filter((id) => stationDone(walk, id)).length;
}

export function vivaOutcome(walk: WalkState): Outcome | null {
  if (walk.answer === null || walk.confidence === null) return null;
  return outcomeOf(walk.answer === QUESTION.answer, walk.confidence);
}

interface Store {
  view: View;
  anchor: Anchor;
  focus: StationId;
  walk: WalkState;
  notice: string | null;
  setView: (view: View, anchor?: Anchor) => void;
  focusStation: (id: StationId) => void;
  advance: () => void;
  choose: <K extends keyof WalkState>(station: StationId, key: K, value: WalkState[K]) => void;
  triage: (comment: string, value: Triage) => void;
  configure: (setup: Partial<Setup>) => void;
  clearNotice: () => void;
  reset: () => void;
}

function sentBackFor(station: StationId, walk: WalkState): string | null {
  if (station === "draft")
    return FACTORY_DRAFT_CHOICES.find((c) => c.id === walk.draft)?.sentBack ?? null;
  if (station === "post" && walk.post === "agent") return POST_SENT_BACK;
  if (station === "post" && walk.post === "claim") return FACTORY_POST_SENT_BACK;
  if (station === "review" && walk.review === "stamp") return REVIEW_SENT_BACK;
  if (station === "merge") return MERGE_CHOICES.find((c) => c.id === walk.merge)?.sentBack ?? null;
  if (station === "map") return MAP_CHOICES.find((c) => c.id === walk.map)?.sentBack ?? null;
  return null;
}

export const useViva = create<Store>((set, get) => ({
  view: "home",
  anchor: null,
  focus: "draft",
  walk: EMPTY_WALK,
  notice: null,
  setView: (view, anchor = null) => set({ view, anchor }),
  focusStation: (id) => {
    const { walk } = get();
    if (stationIndex(id) > stationIndex(frontier(walk))) return;
    set({ focus: id, notice: null });
  },
  advance: () => {
    const { focus, walk } = get();
    const next = nextStation(focus);
    if (next && stationDone(walk, focus)) set({ focus: next, notice: null });
  },
  choose: (station, key, value) => {
    const walk = { ...clearAfter(get().walk, station), [key]: value };
    set({ walk, notice: sentBackFor(station, walk) });
  },
  triage: (comment, value) => {
    const cleared = clearAfter(get().walk, "bot");
    set({ walk: { ...cleared, triage: { ...cleared.triage, [comment]: value } }, notice: null });
  },
  configure: (change) => {
    const setup = { ...get().walk.setup, ...change };
    // A map is built from answers, so it needs a follow-up check to feed it.
    if (setup.check === "none" && setup.record === "map") setup.record = "journal";
    set({ walk: { ...EMPTY_WALK, setup }, focus: "draft", notice: null });
  },
  clearNotice: () => set({ notice: null }),
  reset: () =>
    set((s) => ({
      view: "walk",
      anchor: null,
      focus: "draft",
      walk: { ...EMPTY_WALK, setup: s.walk.setup },
      notice: null,
    })),
}));
