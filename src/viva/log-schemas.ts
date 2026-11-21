// Versioned log formats. The platform owns these so the skill can fetch the current schema
// and the parser can handle mixed versions in one file.

export interface LogField {
  name: string;
  description: string;
  example: string;
}

export interface LogSchema {
  version: string;
  description: string;
  delimiter: string;
  fields: LogField[];
  notes?: string;
}

export const LOG_SCHEMAS: LogSchema[] = [
  {
    version: "0.3.1",
    description: "Current viva skill log line (skill 0.3.x)",
    delimiter: " | ",
    fields: [
      { name: "timestamp", description: "YYYY-MM-DD HH:MM", example: "2026-11-20 17:25" },
      { name: "skillVersion", description: "Skill version that wrote the line", example: "0.3.1" },
      { name: "repo", description: "owner/repo", example: "adamsuk/viva-skills" },
      { name: "branchOrPr", description: "branch name or pr-N", example: "pr-42" },
      { name: "commitOrRef", description: "commit SHA or ref", example: "a1b2c3d" },
      { name: "topic", description: "short topic of the check", example: "skill logging path" },
      { name: "confidence", description: "1-5 or high/medium/low", example: "4" },
      { name: "grade", description: "understood / partial / missed (or free text)", example: "understood" },
      { name: "scope", description: "session | checkout | last-commit | uncommitted | named", example: "session" },
      { name: "live", description: "live | partly-live | hazard", example: "live" },
    ],
    notes: "One line per check. Version is always the second field so the parser can dispatch.",
  },
];

export const CURRENT_LOG_SCHEMA = LOG_SCHEMAS[LOG_SCHEMAS.length - 1];

export function schemaFor(version: string): LogSchema | undefined {
  return LOG_SCHEMAS.find((s) => s.version === version);
}

/** Stable URL the skill (or any agent) can fetch. Emitted at build time. */
export const LOG_SCHEMAS_URL = "https://adamsuk.github.io/viva/log-schemas.json";
