<!-- Generated from src/viva/model.ts by `npm run docs`. Edit the model, not this file. -->

# Claims

What the evidence says, labelled by strength.

- **Strong**: Large sample or controlled trial, primary source.
- **Moderate**: Reasonable data but a single study, a preprint, or notable confounders.
- **Weak**: Vendor reports, surveys, or a single blog. Directional only.
- **Opinion**: Practitioner argument with no data.
- **Gap**: Nothing solid found.

## AI in code review

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Developers accepted 36.4% of one review bot's comments, discussed 7.3%, and rejected 56.3%. | Moderate | One bot, 239 repos. A preprint. | [Is Agentic Code Review Helpful? Mining Developers' Feedback to CodeRabbit Reviews in the Wild](https://arxiv.org/abs/2607.03316) (3 July 2026) |
| PRs reviewed only by agents merged at 45%, against 68% for human-only review. 12 of 13 agents had an average signal ratio below 60%. | Moderate | Observational. Agent-only PRs may differ in kind. | [From Industry Claims to Empirical Reality: An Empirical Study of Code Review Agents in Pull Requests](https://arxiv.org/abs/2604.03196) (3 April 2026) |
| Reviewers' approval of agent PRs rose from 30.5% to 36.6% over their history, while simple comment-effort measures stayed flat. | Weak | Agents may simply have improved. No defect data. Unreplicated. | [Beyond Lexical Metrics: Sentence-Embedding Detection of Reviewer Habituation in AI Code Review](https://arxiv.org/abs/2609.06213) (5 September 2026) |
| Understanding the change is the core of code review, and knowledge transfer is one of its main outcomes. | Strong | Pre-AI, one company. Observation, interviews and surveys. | [Expectations, Outcomes, and Challenges of Modern Code Review](https://web.eecs.umich.edu/~weimerw/2018-481/readings/codereview.pdf) (May 2013) |
| People with an AI assistant wrote less secure code and were more confident it was secure. | Moderate | 47 participants, 2022 tools, writing not reviewing. | [Do Users Write More Insecure Code with AI Assistants?](https://arxiv.org/abs/2211.03622) (November 2023) |

## Understanding

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| In a randomized trial, the AI group scored 50% on a comprehension quiz against 67% for people who coded by hand. The speed gain was not significant. | Strong | 52 people, one session, a chat assistant not an agent. Tested straight after. | [How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills) (29 January 2026) |
| How people used AI mattered. Delegation, progressive reliance and iterative AI debugging scored 24% to 39%. Conceptual inquiry, hybrid code explanation and generate-then-understand scored 65% to 86%. | Moderate | Groups of 2 to 7 people. Correlation, not cause. | [How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills) (29 January 2026) |
| Coding agents helped students finish faster but hurt their comprehension of their own code. Low-effort use, like auto-accepting edits, went with the lowest understanding. | Moderate | 54 students, a preprint. | [(Im)Paired Programming: Coding Agents Improve Productivity but Harm Understanding](https://arxiv.org/abs/2607.26375) (29 July 2026) |
| People who wrote essays with an LLM showed weaker brain connectivity and most could not quote what they had written. | Weak | Essays, not code. 54 people, 18 in the crossover. Unreviewed preprint, widely overstated. | [Your Brain on ChatGPT: Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task](https://arxiv.org/abs/2506.08872) (June 2025) |
| Knowledge workers who trusted the AI more reported less critical thinking. Those who trusted themselves more reported more. | Moderate | Self-reported survey of 319 people. | [The Impact of Generative AI on Critical Thinking: Self-Reported Reductions in Cognitive Effort and Confidence Effects From a Survey of Knowledge Workers](https://doi.org/10.1145/3706598.3713778) (April 2025) |
| About a third of students struggled to explain code they had just written. Answering questions about it tracked course success better than a correct submission did. | Moderate | Pre-AI students, one course. | [Students Struggle to Explain Their Own Program Code](https://arxiv.org/abs/2104.06710) (June 2021) |

## Juniors

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Employment of software developers aged 22 to 25 fell nearly 20% from its late-2022 peak, while older workers held steady. | Strong | Payroll data, causes debated. Under stricter controls the drop is significant only after 2024. | [Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence](https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf) (November 2025 revision)<br>[Canaries, interest rates and timing: more on recent drivers of employment changes for young workers](https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers) (9 February 2026) |
| 38% of engineering leaders surveyed agreed AI tools have reduced the direct mentoring juniors get from seniors. | Weak | One survey, figures reported in articles rather than the full report. | [Junior devs still have a path to senior roles](https://leaddev.com/hiring/junior-devs-still-have-path-senior-roles) (2025) |
| Juniors swing between over-reliance and avoidance. Seniors keep control through detailed delegation built on pre-AI foundations. | Moderate | Qualitative, 20 people. | [From Junior to Senior: Allocating Agency and Navigating Professional Growth in Agentic AI-Mediated Software Engineering](https://arxiv.org/abs/2602.00496) (31 January 2026) |
| Review is losing its mentoring function as bots take the first pass. | Opinion |  | [Comprehension Debt: the hidden cost of AI generated code](https://addyosmani.com/blog/comprehension-debt/) (14 March 2026) |

## Seniors

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Experienced developers took 19% longer with early-2025 AI tools but believed they were about 20% faster. | Strong | For early-2025 tools only. METR now marks it out of date. | [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) (10 July 2025) |
| METR's follow-up could not measure the effect reliably, because developers declined to work without AI. It thinks gains are probably larger now. | Moderate | METR calls its own evidence very weak. | [We are Changing our Developer Productivity Experiment Design](https://metr.org/blog/2026-02-24-uplift-update/) (24 February 2026) |
| Most developers name almost-right AI output as their top frustration, and fewer than half always check AI code before committing. | Weak | Surveys, one from a vendor. | [2025 Stack Overflow Developer Survey: AI](https://survey.stackoverflow.co/2025/ai) (July 2025)<br>[State of Code Developer Survey report: the current reality of AI coding](https://www.sonarsource.com/blog/state-of-code-developer-survey-report-the-current-reality-of-ai-coding/) (January 2026) |
| Experienced developers lose skill when AI does the work. | Gap | Predicted since 1983 for automation in general. No study of senior engineers found. | [Ironies of Automation](https://doi.org/10.1016/0005-1098(83)90046-8) (1983) |

## Asking questions

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Practice tests improve later recall more than restudying, and multiple choice works well as a format. | Strong | Many studies used simple material, not code. | [Rethinking the Use of Tests: A Meta-Analysis of Practice Testing](https://doi.org/10.3102/0034654316689306) (2017) |
| Confidence-weighted multiple choice improved answers to new, related questions more than standard multiple choice. | Moderate | Lab studies, not workplace. | [On the learning benefits of confidence-weighted testing](https://doi.org/10.1186/s41235-016-0003-x) (2016) |
| Prompting people to explain what they are learning has a medium effect on learning. | Strong | Mostly undergraduates. | [Inducing Self-Explanation: a Meta-Analysis](https://doi.org/10.1007/s10648-018-9434-x) (2018) |
| LLM-written questions about code are not reliably correct, so the authors use them for formative work only. | Moderate | A two-page tool paper. | [AutoMCQ: Automatically Generate Code Comprehension Questions using GenAI](https://arxiv.org/abs/2505.16430) (May 2025) |
| GPT-4 answered 88% of questions about code correctly. A question alone cannot tell a person from a model. | Moderate | 2024 models. Today's do better. | [Let's Ask AI About Their Programs: Exploring ChatGPT's Answers To Program Comprehension Questions](https://arxiv.org/abs/2404.11734) (April 2024) |
| Live, conversational oral exams can scale to a class of 58 and keep their validity with AI allowed. | Weak | One course, no outcome data. | [The Conversational Exam: A Scalable Assessment Design for the AI Era](https://arxiv.org/abs/2601.10691) (15 January 2026) |
| A comprehension gate on PRs changes defects, learning, or review quality. | Gap | No tool found publishes an evaluation. | [Comprehension debt and the quiz gate](https://explyt.ai/en/blog/comprehension-debt-quiz-gate) (15 October 2026)<br>[Sphinx](https://github.com/parthh01/sphinx) (October 2026)<br>[PR Quiz Gate](https://github.com/michaelbeutler/pr-quiz) (2026) |

## Privacy

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Monitoring with no explicit purpose was not linked to better performance. Transparent, less invasive monitoring went with better attitudes. | Strong | Meta-analysis of workplace monitoring in general, not code. | [A meta-analysis of the effects of electronic performance monitoring on work outcomes](https://doi.org/10.1111/peps.12514) (2023 (online April 2022)) |
| In the EU, AI used to monitor or evaluate workers' performance and behaviour is classed as high risk. | Strong | The date the obligations apply may have moved. Check before relying on it. | [Regulation (EU) 2024/1689 (the AI Act), Annex III](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) (12 July 2024) |
| A private map of understanding is received as growth feedback rather than surveillance. | Gap | This is Viva's open question. | [A meta-analysis of the effects of electronic performance monitoring on work outcomes](https://doi.org/10.1111/peps.12514) (2023 (online April 2022)) |

## Software factories

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Most AI-generated PRs get no review. When they are reviewed, AI agents dominate, and people mostly steer the agent rather than judge the change. | Moderate | Open-source PRs in one dataset. Qualitative summary, numbers in the paper. | [These Aren't the Reviews You're Looking For: How Humans Review AI-Generated Pull Requests](https://arxiv.org/abs/2605.02273) (4 May 2026) |
| Under a mandate to double merged PRs with AI, load per reviewer doubled and automated review overtook human review in coverage. | Moderate | One company, 802 developers, not randomized. | [AI Writes Faster Than Humans Can Review: A Longitudinal Study of an Enterprise 2x Mandate](https://arxiv.org/abs/2607.01904) (2 July 2026) |
| Agents claimed completion 28.7 to 37.9 points more often than an evaluator confirmed it. | Moderate | A preprint on general agent tasks, not coding PRs. | [Who Holds the Pen? Let Specifications, Not Agents, Sign Off](https://arxiv.org/abs/2609.29921) (24 September 2026) |
| Reviewers reacted more neutrally or positively to agent PRs than to human ones, though agent PRs carried more redundancy. | Moderate | Sentiment analysis of review comments, not approval decisions. | [More Code, Less Reuse: Investigating Code Quality and Reviewer Sentiment towards AI-generated Pull Requests](https://arxiv.org/abs/2601.21276) (29 January 2026) |
| After teams adopted agents, reviews got faster, less detailed and more permissive, but repositories without agents changed the same way. | Moderate | Difference-in-differences design. Cuts against blaming agents for looser review. | [Does Working with AI Agents Change How Developers Code, Test, and Review?](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ESEM.2026.67) (5 October 2026) |
| Reading an agent's session helps a person understand the change. | Gap | Untested for review. In one small study, developers reading raw agent logs found the agent's bugs 17% of the time, and 60% with a stepping tool. | [AgentStepper: Interactive Debugging of Software Development Agents](https://arxiv.org/abs/2602.06593) (6 February 2026) |
| Knowledge of code concentrates in few people: 46% of 133 popular GitHub projects would be crippled by losing one developer. | Moderate | Measured from who edits files, before agents wrote much code. | [A novel approach for estimating Truck Factors](https://doi.org/10.1109/ICPC.2016.7503718) (May 2016) |
| Losses when people leave can exceed three times the expected loss. Naming successors for at-risk files cut expected loss by up to 15%. | Moderate | Two case studies, Chrome and one Avaya project. | [Quantifying and mitigating turnover-induced knowledge loss: case studies of Chrome and a project at Avaya](https://doi.org/10.1145/2884781.2884851) (May 2016) |

## Alternatives

| Claim | Label | Caveat | Sources |
|---|---|---|---|
| Code review spreads knowledge of the system: developers come to know files they review but never edit. | Moderate | Google, Microsoft, AMD and open source, pre-AI. | [Convergent Contemporary Software Peer Review Practices](https://www.microsoft.com/en-us/research/publication/convergent-software-peer-review-practices/) (August 2013) |
| A clear description, a small size and a coherent commit history make a change easier to review. | Moderate | Ten interviews and 98 rated changes, pre-AI. | [What Makes a Code Change Easier to Review? An Empirical Investigation on Code Change Reviewability](https://zenodo.org/records/1323659) (November 2018) |
| Walkthroughs and inspections found errors about as well as testing, pairs did best, and people varied enormously. | Moderate | 1978, about finding errors, not checking understanding. | [A controlled experiment in program testing and code walkthroughs/inspections](https://doi.org/10.1145/359588.359602) (September 1978) |
| A short walkthrough checks whether the author understands an AI-assisted change. | Gap | Untested. Closest is a live oral exam in one course. | [The Conversational Exam: A Scalable Assessment Design for the AI Era](https://arxiv.org/abs/2601.10691) (15 January 2026) |
| A reflective learning journal helps people learn. | Weak | Engineering students value it, and entries predicted marks in one course. Correlational, self-reported. | [The learning outcomes of an online reflective journal in engineering](https://ascilite.org/conferences/melbourne08/procs/palmer.pdf) (December 2008) |
| Expert-novice pairing transfers knowledge in industry, but novices rarely articulate, reflect or explore, and delivery pressure shapes what is taught. | Moderate | Qualitative video analysis. | [Knowledge transfer in pair programming: An in-depth analysis](https://doi.org/10.1016/j.ijhcs.2014.09.001) (2015) |
| Pair programming gives a small gain in quality, mostly on complex tasks, at a medium cost in effort. | Moderate | Meta-analysis with wide variation and signs of publication bias. Measures quality, not learning. | [The effectiveness of pair programming: A meta-analysis](https://doi.org/10.1016/j.infsof.2009.02.001) (2009) |
