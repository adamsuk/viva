// Versioned log formats. The platform owns these so the skill can fetch the current schema
// and the parser can handle mixed versions in one file.

export interface LogField {
  name: string;
  description: string;
  example: string;
}

export interface LogSchema {
  version: string;
  /** Skill versions that write this format, as an exact version or `major.minor.x`. */
  skillVersions: string;
  description: string;
  delimiter: string;
  fields: LogField[];
  notes?: string;
}

/** How the change was made. The research says this predicts understanding more than AI use itself. */
export const AI_USE_VALUES = [
  "hand",
  "explained",
  "generated-then-understood",
  "delegated",
  "agent",
  "unknown",
] as const;

export type AiUse = (typeof AI_USE_VALUES)[number];

/** For a review-comment check: whether the bot's claim held when the agent verified it. */
export const BOT_CLAIM_VALUES = ["held", "partly", "wrong", "n/a"] as const;

export type BotClaim = (typeof BOT_CLAIM_VALUES)[number];

const FIELDS_0_3: LogField[] = [
  { name: "timestamp", description: "YYYY-MM-DD HH:MM", example: "2026-11-20 17:25" },
  { name: "skillVersion", description: "Skill version that wrote the line", example: "0.3.1" },
  { name: "repo", description: "owner/repo", example: "adamsuk/viva-skills" },
  { name: "branchOrPr", description: "branch name or pr-N", example: "pr-42" },
  { name: "commitOrRef", description: "commit SHA or ref", example: "a1b2c3d" },
  { name: "topic", description: "short topic of the check", example: "skill logging path" },
  { name: "confidence", description: "1-5 or high/medium/low", example: "4" },
  {
    name: "grade",
    description: "understood / partial / missed / disputed (or free text)",
    example: "understood",
  },
  {
    name: "scope",
    description:
      "session | checkout | last-commit | uncommitted | named | review-comment | review | practice",
    example: "session",
  },
  { name: "live", description: "live | partly-live | hazard", example: "live" },
];

const FIELDS_0_4: LogField[] = [
  ...FIELDS_0_3,
  {
    name: "aiUse",
    description: `How the change was made: ${AI_USE_VALUES.join(" | ")}`,
    example: "generated-then-understood",
  },
];

const FIELDS_0_5: LogField[] = [
  ...FIELDS_0_4,
  {
    name: "botClaim",
    description: `For scope review-comment, whether the bot's claim held: ${BOT_CLAIM_VALUES.join(" | ")}`,
    example: "n/a",
  },
];

export const LOG_SCHEMAS: LogSchema[] = [
  {
    version: "0.3.1",
    skillVersions: "0.3.x",
    description: "Current viva skill log line (skill 0.3.x)",
    delimiter: " | ",
    fields: FIELDS_0_3,
    notes: "One line per check. Version is always the second field so the parser can dispatch.",
  },
  {
    version: "0.4.0",
    skillVersions: "0.4.x",
    description: "Viva skill log line (skill 0.4.x): the 0.3 fields plus how the change was made",
    delimiter: " | ",
    fields: FIELDS_0_4,
    notes:
      "One line per check. Version is always the second field so the parser can dispatch. aiUse: hand (written without AI), explained (AI used to ask why or about concepts), generated-then-understood (AI wrote it, then the author made sure they could rewrite it), delegated (AI wrote it from a short ask and it was accepted), agent (an agent built it from a work order), unknown.",
  },
  {
    version: "0.5.0",
    skillVersions: "0.5.x",
    description:
      "Viva skill log line (skill 0.5.x): the 0.4 fields plus whether a checked bot comment's claim held",
    delimiter: " | ",
    fields: FIELDS_0_5,
    notes:
      "One line per check. Version is always the second field so the parser can dispatch. botClaim: held (the claim was right), partly, wrong (the claim did not hold), n/a (not a review-comment check). aiUse as in 0.4.0. Lines are never rewritten: to correct a check (a dispute that stands, a changed verdict), append it again with every field copied except the skill version and the corrected grade or botClaim; the last line for a timestamp, repo, branchOrPr, commitOrRef, topic and scope wins.",
  },
  {
    version: "0.6.0",
    skillVersions: "0.6.x",
    description:
      "Viva skill log line (skill 0.6.x): the 0.5 fields plus which bot made a checked review comment",
    delimiter: " | ",
    fields: [
      ...FIELDS_0_5,
      {
        name: "bot",
        description:
          "For scope review-comment, the bot that made the comment: a short lowercase name such as coderabbit or copilot; n/a otherwise",
        example: "n/a",
      },
    ],
    notes:
      "One line per check. Version is always the second field so the parser can dispatch. bot: short lowercase name of the bot whose comment was checked (letters, digits, hyphens), for scope review-comment; n/a otherwise. botClaim and aiUse as in 0.5.0. Lines are never rewritten: to correct a check, append it again in the current format with every field copied except the skill version and the corrected grade or botClaim, filling fields the older line lacks with their defaults (aiUse unknown, botClaim n/a, bot unknown for review-comment or n/a); the last line for a timestamp, repo, branchOrPr, commitOrRef, topic and scope wins.",
  },
];

export const CURRENT_LOG_SCHEMA = LOG_SCHEMAS[LOG_SCHEMAS.length - 1];

/** True when `version` is covered by `pattern` (an exact version, or `major.minor.x`). */
export function coversVersion(pattern: string, version: string): boolean {
  if (pattern === version) return true;
  const m = /^(\d+)\.(\d+)\.x$/.exec(pattern);
  if (!m) return false;
  return new RegExp(`^${m[1]}\\.${m[2]}\\.\\d+$`).test(version);
}

/** The schema for a line's version: an exact schema version first, then a covered skill version. */
export function schemaFor(version: string): LogSchema | undefined {
  return (
    LOG_SCHEMAS.find((s) => s.version === version) ??
    LOG_SCHEMAS.find((s) => coversVersion(s.skillVersions, version))
  );
}

/** Stable URL the skill (or any agent) can fetch. Emitted at build time. */
export const LOG_SCHEMAS_URL = "https://adamsuk.github.io/viva/log-schemas.json";
