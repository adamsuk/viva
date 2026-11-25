# Viva Platform MVP

Personal practice companion for single users who want to upskill, maintain skills, build good AI habits, and identify knowledge gaps — with almost zero friction.

Linked to the working skills: [adamsuk/viva-skills](https://github.com/adamsuk/viva-skills) (`viva` and `viva-assess`).

## Why this MVP

The research (see [docs/recommendations.md](recommendations.md) and [docs/prior-art.md](prior-art.md)) shows:

- Quiz gates at merge are crowded and unevidenced.
- The open ground is a **private, longitudinal map** of understanding from many small checks, plus turning gaps into next learning steps.
- The skills already implement the core practice loop (one scenario question + confidence + grade + local log) and a batch assess step, and are soft/private by design.
- Remaining friction: the check is still manual, and there is no place that accumulates the answers into a usable personal picture or habit prompts.

This MVP closes that gap for individuals without adding process, dashboards of people, or hard gates.

## What the MVP is

A local-first personal view that sits on top of the existing skill log, plus a skills page with install instructions.

### Core loops

1. **Check** (skill): one scenario question on a recent change, confidence, grade, logged to `~/.agents/viva-log.md`.
2. **See** (platform): open the site, drop or paste the log, see your private map.
3. **Act** (platform + skill): thin areas surface as concrete next steps; `viva-assess` can interpret a batch of answers.
4. **Install** (platform): copy-paste commands for Claude Code, Cursor, Codex, Grok, and a note on MCP.

### Friction-free onboarding

- Install the skill once: `npx skills add adamsuk/viva-skills --skill viva` (or the assess skill).
- Use it as you already do (in Claude, Grok, Codex, etc.).
- Open the platform and drop the log file — or paste. No accounts, no cloud by default.
- Skills page lists the exact commands and how to keep them updated.

### Explicit links to viva-skills

- Platform owns the versioned log schemas. The skill can fetch them.
- Skills page on the site gives install commands for household agents and an MCP note.
- Shared log format is the contract; versions are handled row by row.

## MVP scope (what ships first)

| Piece | Included | Deferred |
|-------|----------|----------|
| Versioned log schemas (platform is source of truth) | Yes | |
| Version-aware parser (row by row) | Yes | |
| Personal map: topics / areas, confidence vs grade, recent entries | Yes | |
| Gap signals (confident-wrong, repeated partial/miss on same topic) | Yes | |
| Next-step suggestions drawn from research recommendations | Yes | |
| Local file drop / paste of log | Yes | |
| Skills page with install instructions (Claude Code, Cursor, Codex, Grok) | Yes | |
| viva-assess skill for batch interpretation | Yes | |
| MCP note / Skills-over-MCP path | Yes | |
| Zero-account, local-first | Yes | |
| Auto-trigger after commit | | Later (git hook or agent reminder) |
| Browser extension / GitHub button | | Later |
| Topic taxonomy / auto-tagging | | Later (start with free-text topics from log) |
| Team / shared views | | Never for MVP (privacy) |
| Hard gates or PR comments | | Out of scope |

## Log contract

The platform publishes the schemas at:

https://adamsuk.github.io/viva/log-schemas.json

Current schema (0.3.1), written by skill versions 0.3.x (the `viva` skill is at 0.3.3):

```
YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live
```

Example:

```
2026-11-20 17:25 | 0.3.3 | adamsuk/viva-skills | pr-42 | a1b2c3d | skill logging path | 4 | understood | session | live
```

The parser reads each line and looks at the version field (always field 2). It picks the schema whose `version` matches exactly, else the schema whose `skillVersions` covers it (an exact version or `major.minor.x`, so `0.3.x` covers 0.3.3). Mixed versions in one file are fine. Unknown versions fall back to the oldest known schema, are still displayed, and are counted on the map. Lines that cannot be read are skipped and counted, never silently dropped. Topics are grouped ignoring case and repeated spaces.

Schema 0.4.0, written by skill versions 0.4.x, adds an 11th field, `ai-use`: how the change was made.

```
YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live | ai-use
```

`ai-use` is one of `hand` (written without AI), `explained` (AI used to ask why or about concepts), `generated-then-understood` (AI wrote it, then the author made sure they could rewrite it), `delegated` (AI wrote it from a short ask and it was accepted), `agent` (an agent built it from a work order), or `unknown`. 0.3 lines read as `unknown`. Why this field: in a randomized trial, how people used AI predicted understanding more than whether they used it ([Anthropic, 2026](https://www.anthropic.com/research/AI-assistance-coding-skills)). The map shows grades by `ai-use` once any line records it.

Schema 0.5.0, written by skill versions 0.5.x, adds a 12th field, `bot-claim`: for a `review-comment` check, whether the bot's claim held when the agent verified it against the code.

```
YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live | ai-use | bot-claim
```

`bot-claim` is one of `held`, `partly`, `wrong`, or `n/a` (every other scope). Older lines read as `n/a`. Why this field: the guide recommends tracking how often bot comments hold up, because a bot nobody listens to trains people to ignore it. The map counts the verdicts once any line records one.

`grade` can also be `disputed` (the user disputed the question and the agent agreed it was faulty); the map leaves disputed checks out of its signals. `scope` can also be `review-comment` (a check on a bot review comment before forwarding it), `review` (a check before approving someone else's PR), or `practice` (a check on one of the user's own past merged PRs, from `/viva practice`).

Schema 0.6.0, written by skill versions 0.6.x, adds a 13th field, `bot`: for a `review-comment` check, the bot that made the comment, as a short lowercase name such as `coderabbit` or `copilot` (letters, digits and hyphens). Every other scope writes `n/a`. Older review-comment lines read as `unknown`. The map breaks the bot-comment counts down per bot once more than one appears, because the guide recommends tracking each bot and re-testing it when its model changes.

```
YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live | ai-use | bot-claim | bot
```

Lines are never rewritten. When a dispute stands after the line was written, or a bot comment's verdict is re-checked, the skill appends the same check again in the current format (every field copied except the skill version and the corrected grade or `bot-claim`; fields an older line lacks take their defaults: `ai-use` `unknown`, `bot-claim` `n/a`, `bot` `unknown` for a review comment or `n/a`; the map matches on timestamp, repo, branch-or-pr, commit-or-ref, topic and scope). The map keeps the last line for each check and says how many checks were corrected. Pasting a log merges line by line, so re-pasting adds nothing.

A skill change that alters the line format must add a new schema version here, then bump the skill to a new minor version. Existing versions never change, so old lines keep parsing.

The skill is told to fetch the schema from the platform (or fall back to the known format) before logging.

## Tech approach (matches existing stack)

- Same React + Vite + TypeScript + Tailwind + Zustand as the research site.
- Routes: `#map` (personal map), `#skills` (install instructions).
- Pure client-side parser; no backend for MVP.
- Schemas emitted as a static asset at build time so the skill can fetch them.

## Success for MVP

- A user who has run `/viva` a handful of times can open the platform, drop the log, and immediately see where they are solid vs thin and one suggested next habit.
- Onboarding is “install skill + open page + drop file”.
- Nothing leaves the machine by default.
- Future skill versions can change the log format by adding a schema here; old lines still parse.
- Skills are discoverable on the site with copy-paste install commands for common agents.

See the implementation on this branch.
