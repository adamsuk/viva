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

Current schema (0.3.1):

```
YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live
```

Example:

```
2026-11-20 17:25 | 0.3.1 | adamsuk/viva-skills | pr-42 | a1b2c3d | skill logging path | 4 | understood | session | live
```

The parser reads each line, looks at the version field, and applies the matching schema. Mixed versions in one file are fine. Unknown versions fall back to the oldest known schema and are still displayed.

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
