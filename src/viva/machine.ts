// guide.json, llms.txt and llms-full.txt, built from the same data as the page.
// vite.config.ts emits them at build time, versioned by the newest CHANGELOG.md date.

import { parseChangelog } from "./changelog.ts";
import {
  ALL_REFERENCES,
  CLAIMS,
  EXPERIMENTS,
  GAPS,
  GUIDE,
  MATURITY,
  OPEN_GROUND,
  OPEN_QUESTIONS,
  RECOMMENDATIONS,
  STATIONS,
  STRENGTH,
  TOOLS,
  TOOLS_CHECKED,
  referenceById,
  toolsForRecommendation,
  type ReferenceId,
} from "./model.ts";

export const SITE_URL = "https://adamsuk.github.io/viva/";
export const GUIDE_JSON_URL = `${SITE_URL}guide.json`;
export const LLMS_TXT_URL = `${SITE_URL}llms.txt`;
export const LLMS_FULL_URL = `${SITE_URL}llms-full.txt`;
export const REPO_URL = "https://github.com/adamsuk/viva";

export function guideVersion(changelog: string): string {
  return parseChangelog(changelog).releases[0]?.date ?? "unversioned";
}

/** Where an agent can look, read-only, for evidence of each station in a real team. */
export const AUDIT_EVIDENCE: Record<string, string[]> = {
  draft: [
    "a written AI policy in CONTRIBUTING.md or AGENTS.md",
    "starter issues marked as AI-free",
  ],
  post: [
    "a PR template that asks why, what, and the riskiest decision",
    "Assisted-by trailers or AI disclosure in recent PRs",
  ],
  bot: [
    "the review bot's config",
    "how often its comments were resolved, replied to, or ignored in recent PRs",
  ],
  review: [
    "required approvals in branch rules",
    "time from opening to approval on large agent PRs",
  ],
  viva: ["any comprehension check, quiz gate or push hook, and its config"],
  merge: ["whether that check blocks merge, and where waivers are recorded"],
  map: [
    "where answers are stored and who can read them",
    "a written note on what is collected and why",
  ],
  loop: ["any link from a thin area to pairing, training or follow-up work"],
};

export const SCORES = {
  met: "The practice is in place and you found evidence.",
  partial: "Some of it is in place, or only for some changes.",
  missing: "You looked and found nothing.",
  unknown: "You could not see enough to say.",
};

function ref(id: ReferenceId): string {
  const r = referenceById(id);
  return `[${r.title}](${r.url}) (${r.date})`;
}

/** The whole guide as data. */
export function buildGuideJson(changelog: string) {
  return {
    name: "Viva",
    description:
      "AI in code review, its effect on juniors and seniors, and checking that people understand what they post and merge.",
    url: SITE_URL,
    repo: REPO_URL,
    version: guideVersion(changelog),
    changelog: `${REPO_URL}/blob/main/CHANGELOG.md`,
    maturity: MATURITY,
    strength: STRENGTH,
    toolsChecked: TOOLS_CHECKED,
    stations: STATIONS.map((s) => ({
      id: s.id,
      index: s.index,
      name: s.name,
      part: s.part,
      owner: s.owner,
      thesis: s.thesis,
      lesson: s.lesson,
      guide: GUIDE[s.id],
      auditEvidence: AUDIT_EVIDENCE[s.id],
      recommendations: RECOMMENDATIONS.filter((r) => r.station === s.id).map((r) => ({
        id: r.id,
        stage: r.stage,
        maturity: r.maturity,
        text: r.text,
        sources: r.sources,
        tools: toolsForRecommendation(r.id).map((t) => ({
          name: t.tool.name,
          fit: t.fit,
          note: t.note,
        })),
        gap: GAPS[r.id] ?? null,
      })),
    })),
    claims: CLAIMS,
    tools: TOOLS,
    openGround: OPEN_GROUND,
    openQuestions: OPEN_QUESTIONS,
    experiments: EXPERIMENTS,
    sources: ALL_REFERENCES.map(({ took: _took, ...r }) => r),
    audit: { prompt: auditPrompt(guideVersion(changelog)), scores: SCORES },
  };
}

/** The prompt someone pastes into an agent with read-only access to their repos. */
export function auditPrompt(version: string): string {
  const stations = STATIONS.map(
    (s) => `- ${s.index} ${s.name}: look for ${AUDIT_EVIDENCE[s.id].join("; ")}.`,
  ).join("\n");
  const scores = Object.entries(SCORES)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join("\n");
  return `You are auditing how my team checks understanding of AI-assisted code, against Viva (version ${version}).

1. Fetch ${GUIDE_JSON_URL}. It lists eight stations, each with recommendations labelled "Best practice" or "Cutting edge", the tools that meet them, and dated sources.
2. Work read-only. Do not comment, approve, merge, change settings, or open issues. Never print secret values.
3. Do not read, score, or report on any individual person. Look at policies, templates, configs and patterns across PRs only.
4. Gather evidence station by station:
${stations}
   If you lack access to something, score it unknown. Do not guess.
5. Score every recommendation in guide.json:
${scores}
   Cite evidence for each score: file paths, URLs, or settings names.

Reply with:
(a) Scorecard: one table per station. Columns: recommendation id, label, score, evidence.
(b) Best practice gaps first, then Cutting edge gaps under their own heading. Cutting edge items are options, not failures.
(c) Unknowns: what you could not see, and which access would let you check it.`;
}

/** llms.txt per the llms.txt convention (https://llmstxt.org/). */
export function buildLlmsTxt(changelog: string): string {
  const version = guideVersion(changelog);
  return `# Viva

> Research notes and a guide on AI in code review, its effect on juniors and seniors, and checking that people understand what they post and merge. Eight stations, labelled recommendations, evidence graded by strength, and dated sources. Version ${version}.

## Guide data

- [guide.json](${GUIDE_JSON_URL}): Stations, recommendations, claims with strength labels, tools, sources, and an audit prompt
- [llms-full.txt](${LLMS_FULL_URL}): The guide in Markdown

## Optional

- [Changelog](${REPO_URL}/blob/main/CHANGELOG.md): What changed and why, by date
- [Site](${SITE_URL}): The walkable page for people
`;
}

/** The whole guide in Markdown, for agents that want one file. */
export function buildLlmsFull(changelog: string): string {
  const version = guideVersion(changelog);
  const stations = STATIONS.map((s) => {
    const recs = RECOMMENDATIONS.filter((r) => r.station === s.id)
      .map((r) => {
        const tools = toolsForRecommendation(r.id)
          .map((t) => `[${t.tool.name}](${t.tool.url}) ${t.fit}`)
          .join(", ");
        return `- **${r.maturity}** \`${r.id}\` (${r.stage}): ${r.text}\n  Sources: ${r.sources.map(ref).join("; ")}${
          tools ? `\n  Tools: ${tools}` : ""
        }${GAPS[r.id] ? `\n  Gap: ${GAPS[r.id]}` : ""}`;
      })
      .join("\n");
    return `## ${s.index} ${s.name}\n\n${s.thesis}\n\n${s.lesson}\n\nAI: ${GUIDE[s.id].ai}\n\nHuman: ${GUIDE[s.id].human}\n\n${recs}`;
  }).join("\n\n");
  const claims = CLAIMS.map(
    (c) =>
      `- **${c.strength}** (${c.topic}): ${c.text}${c.caveat ? ` Caveat: ${c.caveat}` : ""} Sources: ${c.sources.map(ref).join("; ")}`,
  ).join("\n");
  return `# Viva, full guide

> Version ${version}. Generated from the same data as ${SITE_URL}. Structured data: ${GUIDE_JSON_URL}

${stations}

## Evidence

${claims}

## Open questions

${OPEN_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## Audit prompt

\`\`\`text
${auditPrompt(version)}
\`\`\`
`;
}

export function machineFiles(changelog: string): Record<string, string> {
  return {
    "guide.json": JSON.stringify(buildGuideJson(changelog), null, 2) + "\n",
    "llms.txt": buildLlmsTxt(changelog),
    "llms-full.txt": buildLlmsFull(changelog),
  };
}
