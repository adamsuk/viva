# Viva Platform MVP

Personal practice companion for single users who want to upskill, maintain skills, build good AI habits, and identify knowledge gaps — with almost zero friction.

Linked to the working skill: [adamsuk/viva-skills](https://github.com/adamsuk/viva-skills) (`/viva` skill, currently 0.3.1).

## Why this MVP

The research (see [docs/recommendations.md](recommendations.md) and [docs/prior-art.md](prior-art.md)) shows:

- Quiz gates at merge are crowded and unevidenced.
- The open ground is a **private, longitudinal map** of understanding from many small checks, plus turning gaps into next learning steps.
- The `/viva` skill already implements the core practice loop (one scenario question + confidence + grade + local log) and is soft/private by design.
- Remaining friction: the check is still manual (`/viva` or phrase), and there is no place that accumulates the answers into a usable personal picture or habit prompts.

This MVP closes that gap for individuals without adding process, dashboards of people, or hard gates.

## What the MVP is

A local-first personal view that sits on top of the existing skill log.

### Core loops

1. **Check** (already done by the skill): one scenario question on a recent change, confidence, grade, logged to `~/.agents/viva-log.md`.
2. **See** (new): open the platform, drop or point at the log, see your private map.
3. **Act** (new): thin areas surface as concrete next steps (hand-code the next change in that topic, pair, short read, or just "do another viva").

### Friction-free onboarding

- Install the skill once: `npx skills add adamsuk/viva-skills --skill viva`
- Use it as you already do (in Claude, Grok, Codex, etc.).
- Open the platform (static site or local page) and drop the log file — or, later, a tiny local watcher.
- No accounts, no cloud by default, no team features.

### Explicit links to viva-skills

- Platform always points at the skill repo and the exact log format the skill writes.
- Skill README points at the platform for the map view.
- Shared log format is the contract.

## MVP scope (what ships first)

| Piece | Included | Deferred |
|-------|----------|----------|
| Log parser (skill format) | Yes | |
| Personal map: topics / areas, confidence vs grade, recent entries | Yes | |
| Gap signals (confident-wrong, repeated partial/miss on same topic) | Yes | |
| Next-step suggestions drawn from research recommendations | Yes | |
| Local file drop / paste of log | Yes | |
| Zero-account, local-first | Yes | |
| Auto-trigger after commit | | Later (git hook or agent reminder) |
| Browser extension / GitHub button | | Later |
| Topic taxonomy / auto-tagging | | Later (start with free-text topics from log) |
| Team / shared views | | Never for MVP (privacy) |
| Hard gates or PR comments | | Out of scope |

## Log contract (from skill)

One line per check:

```
YYYY-MM-DD HH:MM | skill-version | repo | branch-or-pr | commit-or-ref | short-topic | confidence | grade | scope | live
```

Example:

```
2026-11-20 17:25 | 0.3.1 | adamsuk/viva-skills | pr-42 | a1b2c3d | skill logging path | 4 | understood | session | live
```

Platform reads this, groups by topic (and later by file/area if we enrich the skill), and surfaces patterns.

## Tech approach (matches existing stack)

- Same React + Vite + TypeScript + Tailwind + Zustand as the research site.
- New route or page: `/map` or a personal view.
- Pure client-side parser; no backend for MVP.
- Generated from the same model style where useful.

## Success for MVP

- A user who has run `/viva` a handful of times can open the platform, drop the log, and immediately see where they are solid vs thin and one suggested next habit.
- Onboarding is "install skill + open page + drop file".
- Nothing leaves the machine by default.

See the implementation starting in this branch.
