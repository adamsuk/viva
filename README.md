# Viva

Research notes and a guide on AI in code review, its effect on juniors and seniors, and checking that people understand what they post and merge. You can walk it. One AI-assisted pull request, #212, moves through eight stations. Last checked 30 October 2026.

The working idea: if you post it or merge it, you can defend it. One small question after an AI-assisted PR or review comment checks understanding. Many such answers build a private picture of where someone's understanding is solid or thin.

Live at https://adamsuk.github.io/viva/ once GitHub Pages is turned on for the repo (Settings, Pages, Source: GitHub Actions).

What changed and why: [CHANGELOG.md](CHANGELOG.md). Every PR adds an entry; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Where to read

| File | What it is |
|---|---|
| [docs/claims.md](docs/claims.md) | What the evidence says, labelled by strength |
| [docs/recommendations.md](docs/recommendations.md) | What to do, labelled Best practice or Cutting edge |
| [docs/prior-art.md](docs/prior-art.md) | Tools that already exist, and the gaps they leave |
| [EXPERIMENTS.md](EXPERIMENTS.md) | Open questions and the log of tests to run |
| [src/viva/model.ts](src/viva/model.ts) | The source for all of the above: stations, the PR, sources, claims, recommendations, tools |
| [src/viva/store.ts](src/viva/store.ts) | How the PR advances, and what gets sent back |
| [src/viva/self-audit.ts](src/viva/self-audit.ts) | Audit your team: the questions, their covered, partial and gap rules, and the scoring |
| [src/viva/machine.ts](src/viva/machine.ts) | guide.json, llms.txt and llms-full.txt, and the read-only audit prompt |
| [src/components/viva/stage.tsx](src/components/viva/stage.tsx) | What you do at each station |
| [src/components/viva/guide.tsx](src/components/viva/guide.tsx) | The guide: stages, the loop table, recommendations, evidence, prior art |

The docs are generated from the model by `npm run docs`, and a test fails if they drift.

## The eight stations

1. **Draft**: The author writes the change with an AI assistant. How they use it matters more than whether they use it.
2. **Post**: The description is the author's first defence: why, what, the decision they are least sure of, and where AI helped.
3. **Bot review**: A review bot's comments are claims to check. Whoever forwards one owns it.
4. **Review**: Approval means the reviewer could explain the change, not that the bot was quiet.
5. **Viva**: One small scenario question about the author's own change, with a confidence rating.
6. **Merge**: A wrong answer starts a conversation, not a block. Anyone can waive it with a reason on the PR.
7. **Map**: Many answers add up to a private picture of solid and thin areas. It belongs to the person.
8. **Return**: A thin area becomes the next thing to learn: pairing, a change by hand, a short read.

Try forwarding the bot comment that describes a loop that never ends. It does end. That is the point.

## Bringing checks in

| Stage | What to add |
|---|---|
| Start | Ownership, before any quiz. Authors review AI output first, write their own descriptions, disclose AI help, and triage bot comments. Reviewers approve only what they could explain. |
| Next | One small question on AI-assisted PRs, with a confidence rating, private to the person. A wrong answer starts a conversation. Questions can be disputed. |
| Later | A private map built from many answers, gaps turned into pairing, and a real evaluation of whether any of it changes defects, learning, or how people feel. |

## What the evidence says, in short

- **Understanding drops when AI does the work, depending on how it is used.** In a randomized trial, the AI group scored 50% on a comprehension quiz against 67%, with no significant speed gain. Delegation scored lowest. Asking conceptual questions, or generating and then understanding, scored as well as hand-coding. Strong, with caveats: 52 people, one session. ([Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills))
- **Review bots are noisy.** Developers accepted 36% of one bot's comments and rejected 56%. ([arXiv 2607.03316](https://arxiv.org/abs/2607.03316))
- **Juniors are squeezed.** Employment of developers aged 22 to 25 fell nearly 20% from late 2022, and survey respondents say mentoring has dropped. Causes debated. ([Stanford](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf))
- **Seniors misjudge their own speed.** Experienced developers were 19% slower with early-2025 tools and believed they were faster. METR's follow-up could not measure today's effect reliably. ([METR](https://metr.org/blog/2026-02-24-uplift-update/))
- **Asking works, as learning.** Practice tests and self-explanation have medium, well-replicated effects. Confidence-weighted questions help transfer. But a model answers 88% of questions about code, so a question is practice, not proof.
- **Monitoring backfires.** Monitoring with no clear purpose has not been linked to better performance. In the EU, AI that evaluates workers is high risk.
- **Senior deskilling, and whether comprehension gates work at all, are gaps.** Nothing solid found.

The full list, with every caveat, is in [docs/claims.md](docs/claims.md).

## Evidence labels

- **Strong**: large sample or controlled trial, primary source.
- **Moderate**: reasonable data but a single study, a preprint, or notable confounders.
- **Weak**: vendor reports, surveys, or a single blog. Directional only.
- **Opinion**: practitioner argument with no data.
- **Gap**: nothing solid found.

Recommendations carry a second pair of labels, as in [Line](https://github.com/adamsuk/line): **Best practice** (several independent sources, and projects already do it) and **Cutting edge** (one or two small studies, a design proposal, or early tooling).

## Where the open ground is

- Quiz gates at merge time are crowded. Five tools were found, and none has published evidence.
- Not found: a private, longitudinal map of understanding built from many small checks.
- Not found: quizzing the people who post AI review comments, rather than PR authors.
- Not found: any evaluation showing a comprehension gate changes defects, learning, or review quality.

## Built on

| Piece | What Viva took from it |
|---|---|
| [How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills). Judy Hanwen Shen, Alex Tamkin, Anthropic, 29 January 2026 | How people use AI matters more than whether they do. The Draft station. |
| [Let's Ask Students About Their Programs, Automatically](https://arxiv.org/abs/2103.11138). Teemu Lehtinen, André L. Santos, Juha Sorva, ICPC 2021 | Ask authors questions about their own code once it passes its tests. The Viva station. |
| [LLVM AI Tool Use Policy](https://llvm.org/docs/AIToolPolicy.html). LLVM Project, January 2026 | A human reads AI output first and can answer questions about it in review. The Post station. |
| [Comprehension Debt](https://addyosmani.com/blog/comprehension-debt/). Addy Osmani, 14 March 2026 | The name for the gap between the code a team has and the code it understands. |

Every other source is listed, dated, in Further reading on the site and in the docs.

## Assess your team with an LLM

Cutting edge. Give an agent read-only access to your repos and paste the audit prompt from the guide. It scores each recommendation from policies, templates and configs, and is told not to look at individuals.

- [guide.json](https://adamsuk.github.io/viva/guide.json): stations, recommendations, claims, tools, dated sources and the prompt
- [llms.txt](https://adamsuk.github.io/viva/llms.txt) and [llms-full.txt](https://adamsuk.github.io/viva/llms-full.txt)

All three are built from the page's data and CHANGELOG.md by `npm run build:pages`.

## Run it

```bash
npm install
npm run dev
```

The dev server listens on port 8080. `npm test` runs the tests, including the docs drift check.
