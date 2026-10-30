# Contributing

## Where the content lives

Everything the site and the docs say comes from [src/viva/model.ts](src/viva/model.ts): stations, sources, claims, recommendations, tools, open questions and experiments. Edit the model, then run:

```bash
npm run docs
```

That rewrites `docs/claims.md`, `docs/recommendations.md`, `docs/prior-art.md` and `EXPERIMENTS.md`. A test fails if they drift from the model.

## Adding evidence

- Every claim carries a strength label (Strong, Moderate, Weak, Opinion, Gap) and at least one dated source.
- Every recommendation carries a maturity label (Best practice, Cutting edge) and at least one source.
- Prefer primary sources. If a secondary source disagrees with the primary one, use the primary figure and say so in the changelog.
- Re-check sources when you add one. Several figures in this area change within months.
- Never add anything that scores or ranks a named person.

## Changelog

Every change adds a dated entry to [CHANGELOG.md](CHANGELOG.md) in the same PR. Add it under today's date (YYYY-MM-DD), in Added, Changed, or Removed. Each entry covers:

- **What changed**: one or two short lines.
- **Why**: the reason, such as new evidence or a label moving between strengths.
- **Sources**: the articles or papers behind a research change, linked.
- **PR link**: for example `([#3](https://github.com/adamsuk/viva/pull/3))`.

CI fails a PR that does not touch CHANGELOG.md. For a change with nothing worth logging, such as a typo or a CI tweak, add the `skip-changelog` label.
