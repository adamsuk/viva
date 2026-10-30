# Prior art

Last checked 30 October 2026. None of the comprehension-gate tools below had published evidence that they work.

| Tool | What it does | Evidence it works |
|---|---|---|
| [Commit Comprehension Gate](https://dev.to/islandbytes/i-built-a-merge-gate-that-quizzes-developers-on-their-own-code-changes-heres-why-and-how-5460) | Claude writes 3 multiple-choice questions per PR. Merge blocked until the author answers. | None found |
| [Gater](https://usegater.app/) | GitHub App generating a quiz from the PR diff, pass to unblock merge. | None found |
| Sphinx (push gate) | Asks one question about the diff on push. Its own write-up flags grader false negatives. | None found |
| [Explyt quiz-gate design](https://explyt.ai/en/blog/comprehension-debt-quiz-gate) | Design guidance, question types, who can waive the gate. | None found |
| [CodeOwnership](https://towardsdatascience.com/do-you-still-own-the-code-your-ai-wrote-i-built-codeownership-to-measure-it/) | Separates confidence, unaided debugging, and explanation. | Pilot only |
| Reviewer quiz idea (Geoffrey Litt, via [Allstacks](https://www.allstacks.com/blog/comprehension-debt-the-hidden-cost-of-ai-generated-code)) | Quiz reviewers before they can approve. | Proposal only |
| [checkowners](https://pypi.org/project/checkowners/), [Reviewpad](https://aicodereview.cc/tool/reviewpad) | Expertise inferred from git history, used for routing. | n/a |

## Adjacent: validating AI review comments

- [validate-pr skill](https://www.skills.sh/arraydude/agent-skills/validate-pr): checks bot review comments against the diff for hallucinations.
- [DiffLens write-up](https://dev.to/shy_the_a91bfb236d4eeb5bb/why-ai-code-review-tools-keep-commenting-on-lines-that-dont-exist-ald): deterministic validation of comment positions.
