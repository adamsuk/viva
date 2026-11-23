# AGENTS.md: Viva

Repo-specific rules for agents working here. They add to the software factory's
shared rules (adamsuk/software-factory `AGENTS.md`); where the two conflict, the
stricter one wins.

## What this repo is

- A research site on AI in code review (the guide, the walk through eight
  stations, the evidence) published to GitHub Pages.
- The personal-map MVP: a local-first page that reads the log written by the
  [viva skills](https://github.com/adamsuk/viva-skills) and shows a private
  picture of solid and thin areas. See `docs/mvp-platform.md`.

## Build and test

```bash
npm ci
npm run typecheck && npm run lint && npm test
```

That is `agents.test_command` in `.github/factory.yml` and what `test.yml`
runs. `npm run build:pages` builds the site into `dist-pages/`, including
`guide.json`, `llms.txt`, `llms-full.txt` and `log-schemas.json`.

## Content rules

- `src/viva/model.ts` is the source for stations, claims, recommendations,
  tools, open questions and experiments. Edit the model, then run
  `npm run docs`; never hand-edit `docs/claims.md`, `docs/recommendations.md`,
  `docs/prior-art.md` or `EXPERIMENTS.md`. `src/viva/docs.test.ts` fails on drift.
- Every claim carries a strength label (Strong, Moderate, Weak, Opinion, Gap)
  and at least one dated source. Every recommendation carries a maturity label
  (Best practice, Cutting edge). Prefer primary sources.
- Never add anything that scores, ranks or names a person's understanding.

## Personal map and log rules

- The platform owns the log schemas (`src/viva/log-schemas.ts`, published as
  `log-schemas.json`). A format change adds a new schema version; old versions
  stay so old lines keep parsing. Never break an existing version.
- The personal map is local-first: nothing a user drops, pastes or stores may
  be sent off the device. No analytics, no network calls from the map.
- Practice, not proof: never present a map result as a measure of competence.

## Changelog

Every PR adds a dated entry (`## YYYY-MM-DD`, Europe/London) to
`CHANGELOG.md` under Added, Changed or Removed, with what, why, sources for
research changes, and the PR link. See `CONTRIBUTING.md`.
