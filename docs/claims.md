# Claims

Labels are defined in the [README](../README.md). Last checked 30 October 2026.

## 1. AI in code review

| Claim | Label | Source |
|---|---|---|
| Developers accepted 36.4% of one review bot's comments, discussed 7.3%, rejected 56.3% (31,073 pairs, 239 repos). | Moderate | [CodeRabbit in the wild, arXiv 2607.03316](https://agentpatterns.ai/code-review/agentic-review-comment-acceptance/) |
| 12 of 13 review agents average below 60% actionable comments. Human comments were addressed far more often than bot comments. | Moderate | [arXiv 2604.03196](https://arxiv.org/html/2604.03196v1) |
| Reviewers' approval of agent PRs rose from 30.5% to 36.6% over their history, but comment-effort measures did not fall. Agents may simply have improved. No defect data. Unreplicated. | Weak | [arXiv 2609.06213, summary](https://usethinkr.com/news/reviewer-approval-drift-ai-code) |
| Polished AI output disarms reviewer scepticism (automation bias). | Opinion | [Codacy](https://blog.codacy.com/automation-bias-in-ai-generated-code-review-why-clean-code-still-ships-broken) |
| Under high AI adoption, more PRs merge with no review. | Weak (vendor) | [Faros](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) |

## 2. Juniors

| Claim | Label | Source |
|---|---|---|
| In an RCT of 52 mostly junior developers, the AI group scored 50% on a comprehension quiz against 67% for hand-coders. The speed gain was not significant. | Strong, with caveats: small, immediate test, chat tool not an agent | [Anthropic](https://www.anthropic.com/research/AI-assistance-coding-skills) |
| How people used AI mattered. Delegation, progressive reliance and iterative AI debugging scored about 24-39%. Conceptual inquiry, code explanation, and generate-then-understand scored about 65-86%. Pattern groups were n=2 to 7. | Moderate | Same |
| Employment of developers aged 22-25 fell nearly 20% from late 2022. | Strong, interest rates a confounder (authors test for it) | [Stanford AI Index coverage](https://news.outsourceaccelerator.com/?p=83095) |
| Review is losing its mentoring function. | Opinion | [Structify](https://structify.ai/blog/we-stopped-hiring-juniors) |

Note: one secondary blog quotes 42% vs 57% for the Anthropic study. The primary source says 50% vs 67%.

## 3. Seniors

| Claim | Label | Source |
|---|---|---|
| Experienced developers were 19% slower with AI in 2025 but believed they were 20% faster. | Strong for early-2025 tools only | [METR](https://scienceblog.com/?p=582102) |
| METR's 2026 follow-up leaned towards a speedup but METR flagged it unreliable due to selection effects. | Moderate | Same |
| Senior review load is rising, and "almost right" AI code is costlier to review. | Weak | [Faros](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) |
| Senior deskilling from AI use. | Gap | None found |
| A senior shortage in 5-10 years if juniors are squeezed out. | Opinion | [ai2.work](https://ai2.work/blog/stanford-index-junior-coder-jobs-fall-20-as-ai-reshapes-hiring) |

## 4. Assessment techniques

| Claim | Label | Source |
|---|---|---|
| Multiple-choice practice tests with competitive wrong options can improve answers to related, untested questions. | Strong (cognitive psychology) | [Little et al. line of work](https://link.springer.com/10.1186/s41235-016-0003-x) |
| Confidence-weighted multiple choice improved transfer to related questions more than standard multiple choice. | Moderate | Same |
| LLM-generated code-comprehension questions are not reliably correct, so the authors use them for formative assessment only. | Moderate | [AutoMCQ](https://arxiv.org/pdf/2505.16430) |
| GPT-4 answered 88% of questions about its own code. Answering such questions with AI is easy. | Moderate | [arXiv 2404.11734](https://arxiv.org/html/2404.11734v1) |
