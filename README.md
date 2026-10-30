# Viva

Research notes on AI in code review, its effect on juniors and seniors, and techniques for checking that people understand what they post and merge. Last checked 30 October 2026.

The working idea: if you post or merge it, you can defend it. A small follow-up question after an AI-assisted comment or PR checks understanding, and many such checks build a private picture of where someone's knowledge is solid or thin.

## Contents

- [Claims](docs/claims.md): what the evidence says, labelled by strength
- [Prior art](docs/prior-art.md): tools that already exist, and what they leave open
- [Experiments](EXPERIMENTS.md): the log of tests to run

## Evidence labels

- **Strong**: large sample or controlled trial, primary source.
- **Moderate**: reasonable data but a single study, a preprint, or notable confounders.
- **Weak**: vendor reports, surveys, or a single blog. Directional only.
- **Opinion**: practitioner argument with no data.
- **Gap**: nothing solid found.

## Where the open ground is

- Quiz gates at merge time are crowded.
- Not found: a private, longitudinal map of understanding built from many small checks.
- Not found: quizzing the people who post AI review comments, rather than PR authors.
- Not found: any evaluation showing a comprehension gate changes defects, learning, or review quality.

## Open questions

1. Do multiple-choice follow-ups on a PR distinguish people who understood from people who guessed or asked an AI?
2. Does a confidence rating (instead of just "not sure") improve the signal?
3. Does the check change behaviour (more reading, better comments) or just add friction?
4. How is a map of gaps received: as growth feedback or as surveillance?
5. Do wrong answers predict later review misses or incidents?

## Method notes

- Add a row for every claim with a label and a dated source.
- Re-check sources when adding; several rankings and figures here change within months.
- Prefer primary sources. Record where a secondary source disagrees.
