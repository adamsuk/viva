<!-- Generated from src/viva/model.ts by `npm run docs`. Edit the model, not this file. -->

# Experiments

## Open questions

1. Do one-question follow-ups on a PR tell people who understood apart from people who guessed or asked an AI?
2. Does a confidence rating, rather than just right or wrong, improve the signal?
3. Does the check change behaviour, like more reading and better comments, or just add friction?
4. How is a map of gaps received: as growth feedback or as surveillance?
5. Do confident wrong answers predict later review misses or incidents?
6. Does asking seniors too keep the check from reading as a junior test?
7. Does reading an agent's session help an approver understand the change, or is it too long to read?
8. Is a short walkthrough harder to fake than a written question, and worth the reviewer's time?
9. In a factory, does a topic view of what nobody can explain lead to better work orders?
10. Do decision questions (why this approach, what must stay true, what breaks) separate understanding from a model's answer better than scenario questions, and does asking only on riskier changes keep the signal while cutting the friction?

## Log

| # | Experiment | Status | Result |
|---|---|---|---|
| 1 | For 20 of my own merged PRs, generate one scenario question each. Rate how often I had to think rather than recall. Run it with “/viva practice” (viva skill 0.6.2+); viva-assess summarises the ratings. | Planned |  |
| 2 | Answer the same 20 with and without an AI open. Compare. Run the second pass with “/viva practice with-ai” (viva skill 0.7.2+): a new question on each PR already practised, answered with your usual AI open elsewhere. It goes only to the experiment file, never the log, and viva-assess pairs the two passes. The unaided pass always comes first, so some of any rise is from having seen the PR before. | Planned |  |
| 3 | Compare answers with and without a confidence rating. Does confidence separate guesses from knowledge? | Planned |  |
| 4 | Run on a small team, private output only, for two weeks. Ask what felt useful or intrusive. | Planned |  |
| 5 | Ask reviewers who forward bot comments one question about each. How often can they defend it? | Planned |  |
| 6 | On the same PRs, compare a written question with a five-minute walkthrough. Which one separates people who understood from people who did not, and at what cost? | Planned |  |
| 7 | Give approvers an agent PR with and without its session. Ask the same question after each. Does the session help? | Planned |  |
| 8 | Turn on the viva skill's options (0.7.0+): decision questions, and risk tiers that skip low-risk changes and add an optional second question on high-risk ones. Run them beside the defaults for a few weeks. The log records which style and tier each check used, so the copied summary splits grades by both. Compare the grades, confidence and disputes, and note which questions a model could answer without the person. | Planned |  |
