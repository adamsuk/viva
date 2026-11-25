<!-- Generated from src/viva/model.ts by `npm run docs`. Edit the model, not this file. -->

# Prior art

Checked 30 October 2026. Not an endorsement.

| Tool | What it does | Evidence it works | Recommendations it meets |
|---|---|---|---|
| [Sphinx](https://github.com/parthh01/sphinx) | A git hook. Pauses a push to a protected branch and asks a scenario question about the diff in a local page. | None published. The README calls it practice, not a security control. | `one-small-question` Full<br>`dispute-questions` Full<br>`waiver-recorded` Partial |
| [PR Quiz Gate](https://github.com/michaelbeutler/pr-quiz) | A GitHub Action. Reviewers answer multiple-choice questions written from the diff before their approval counts. A reviewer can challenge the author. | None published. Notes the quiz is open book. | `quiz-reviewers` Full<br>`one-small-question` Partial<br>`dispute-questions` Partial |
| [pr-quiz (Revodata)](https://github.com/revodatanl/pr-quiz) | A GitHub merge gate backed by Databricks. A multiple-choice quiz from the diff, and a perfect score unlocks merge. | None published. | `one-small-question` Partial |
| [Gater](https://usegater.app/) | A GitHub App. Generates a quiz from the PR diff. Passing unblocks the merge check. | None published. | `one-small-question` Partial<br>`quiz-reviewers` Partial |
| [Commit Comprehension Gate](https://dev.to/islandbytes/i-built-a-merge-gate-that-quizzes-developers-on-their-own-code-changes-heres-why-and-how-5460) | A write-up and build. Claude writes three multiple-choice questions per PR. Merge waits until the author answers. | None published. | `one-small-question` Partial |
| [Moodle certainty-based marking](https://docs.moodle.org/501/en/Using_certainty-based_marking) | A quiz mode that asks for certainty with each answer and penalises confident wrong answers. | Higher reliability in UCL medical exams. Built for courses, not PRs. | `ask-confidence` Partial |
| [validate-pr skill](https://www.skills.sh/arraydude/agent-skills/validate-pr) | An agent skill that checks bot review comments against the diff for hallucinations. | None published. | `bot-comments-are-claims` Partial |
| [CodeRabbit dashboard](https://docs.coderabbit.ai/guides/dashboard) | Review bot analytics, including how comments were received. | Vendor feature. | `track-acceptance` Partial |
| [Assisted-by trailer](https://llvm.org/docs/AIToolPolicy.html) | A commit trailer naming the AI tool used, suggested by LLVM's AI tool policy. The Linux kernel asks for the same transparency in the changelog instead of a tag. | A convention, not a tool. | `disclose` Full |

## Gaps

- `repost-owns`: No tool found asks the people who post AI review comments a question.
- `private-by-default`: No tool found builds a private, longitudinal map from many small checks. Gater tracks team performance, the opposite.
- `topics-not-people`: No tool found reports understanding by area of code rather than by person.
- `evaluate-it`: No comprehension gate has published evidence that it changes defects, learning, or review quality.
- `watch-habituation`: Approval drift is measured in research only.
- `gaps-to-pairing`: No tool found turns a thin area into a next step.

## Where the open ground is

- Quiz gates at merge time are crowded. Five tools were found, and none has published evidence.
- Not found: a private, longitudinal map of understanding built from many small checks.
- Not found: quizzing the people who post AI review comments, rather than PR authors.
- Not found: any evaluation showing a comprehension gate changes defects, learning, or review quality.
