# Viva

Research notes and a guide on AI in code review, its effect on juniors and seniors, and checking that people understand what they post and merge. You can walk it. One AI-assisted pull request, #212, moves through eight stations. Last checked 30 October 2026.

The working idea: if you post it or merge it, you can defend it. One small question after an AI-assisted PR or review comment checks understanding. Many such answers build a private picture of where someone's understanding is solid or thin.

Live at https://adamsuk.github.io/viva/ once GitHub Pages is turned on for the repo (Settings, Pages, Source: GitHub Actions).

What changed and why: [CHANGELOG.md](CHANGELOG.md). Every PR adds an entry; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Personal map and skills (MVP)

A local-first view for single users. Install the [viva skills](https://github.com/adamsuk/viva-skills) (`viva` for one check, `viva-assess` for a batch), run them, then open the site and drop `~/.agents/viva-log.md` (or paste it). See thin areas and the next practice step. No account. Nothing leaves the machine.

The site also has a Skills page with copy-paste install commands for Claude Code, Cursor, Codex and Grok, plus a note on serving the skills over MCP.

Details: [docs/mvp-platform.md](docs/mvp-platform.md).

## Where to read

| File | What it is |
|---|---|
| [docs/claims.md](docs/claims.md) | What the evidence says, labelled by strength |
| [docs/recommendations.md](docs/recommendations.md) | What to do, labelled Best practice or Cutting edge |
| [docs/prior-art.md](docs/prior-art.md) | Tools that already exist, and the gaps they leave |
| [docs/mvp-platform.md](docs/mvp-platform.md) | Personal map MVP: scope, log contract, what is deferred |
| [EXPERIMENTS.md](EXPERIMENTS.md) | Open questions and the log of tests to run |
| [src/viva/model.ts](src/viva/model.ts) | The source for all of the above: stations, the PR, sources, claims, recommendations, tools, the setup options and the factory notes |
| [src/viva/store.ts](src/viva/store.ts) | How the PR advances, and what gets sent back |
| [src/viva/self-audit.ts](src/viva/self-audit.ts) | Audit your team: the questions, their covered, partial and gap rules, and the scoring |
| [src/viva/machine.ts](src/viva/machine.ts) | guide.json, llms.txt and llms-full.txt, and the read-only audit prompt |
| [src/components/viva/stage.tsx](src/components/viva/stage.tsx) | What you do at each station |
| [src/components/viva/guide.tsx](src/components/viva/guide.tsx) | The guide: stages, the loop table, recommendations, evidence, prior art |
| [src/components/viva/personal-map.tsx](src/components/viva/personal-map.tsx) | Local personal map that reads the skill log |
| [src/components/viva/skills.tsx](src/components/viva/skills.tsx) | Skills page with install commands for common agents |

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

## Without the product idea

The follow-up check (station 5) and the map (station 7) are Viva's own idea, and nothing has tested them yet. Set them at the top of the walk:

| Station | Option | Evidence |
|---|---|---|
| 5. Follow-up check | A viva question | **Gap.** No PR comprehension check has published evidence. Its parts are backed: questions about your own code track success, practice tests and confidence ratings help learning. A model answers most such questions. |
| | A five-minute walkthrough, no agent open | **Gap.** Untested as a check. Nearby: explaining aids learning (Strong, lab), a live oral exam in one course (Weak), walkthroughs found errors as well as testing in 1978 (Moderate, a different goal). |
| | None: the station is N/A | **Gap.** No study compares teams with and without a check. Review spreads knowledge and clear descriptions help review (Moderate). |
| 7. What is kept | A private map (needs a follow-up check) | **Gap.** Viva's idea. The case for privacy is Strong: monitoring without a clear purpose goes with more stress and no gain. |
| | A learning log the person writes | **Weak.** Students value reflective journals, and entries predicted marks in one engineering course. |
| | None: the station is N/A | **Gap.** No evidence either way. |

With both set to none, stations 1 to 4 and 8 still hold. Authors write their own descriptions, bot comments get checked, and approval means the reviewer could explain the change. That is the Start stage below. The team audit offers N/A on the questions about these two ideas, and N/A is left out of the score.

## Inside a software factory

The walk can run inside a factory as defined by [Line](https://github.com/adamsuk/line): agents build from work orders, and people plan and approve. The PR walks the same eight stations, but the author is an agent. The person who has to defend the change is whoever wrote the work order and whoever approves it.

Most of this is reasoning from Line's design and from evidence about AI review in general. Little research looks at understanding inside an agent factory.

| Station | Beside Line's | What changes | Evidence |
|---|---|---|---|
| 1. Draft | Backlog and Bench | No one learns at the keyboard. Understanding comes from writing the checks that mean done, and from reading the agent's session. A vague work order is sent back. | **Gap.** Agents overclaim done by 29 to 38 points (Moderate, one preprint). Reading the session is untested; developers reading raw agent logs found its bugs 17% of the time. |
| 2. Post | Gate | The agent's description must be an evidence record, not a claim of done. | **Moderate.** Agents overclaim, and clear descriptions help review. The record format is a practitioner proposal. |
| 3. Bot review | Review | Review-agent comments are staged after the gate. Sending one back to the agent still needs a person who could defend it. | **Opinion.** Staging is Line's design. Bot comments are often wrong (Moderate). |
| 4. Review | Review | Most agent PRs get no human review, and reviewers warm to agent code more than its quality warrants. The reviewer reads the session as well as the diff. | **Moderate.** Several 2026 studies, though one controlled study saw reviews loosen with or without agents. |
| 5. Follow-up | Review, before approval | The check goes to the approver and the work order owner, and is never a required gate check. | **Gap.** One tool, no evidence. A model answers most questions (Moderate). |
| 6. Merge | Gate and Artifact | Merge rests on the gate's checks and a named approval. | **Opinion.** |
| 7. Map | Return | A topic view of what nobody can explain, never a view of people. | **Gap.** Knowledge concentrates in few people (Moderate), measured by who edits code. |
| 8. Return | Return | Route a thin area to a person, or have a person build the next change there. | **Gap.** Naming successors cut expected knowledge loss by up to 15% (Moderate). Pairing transfers knowledge (Moderate, qualitative). |

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
