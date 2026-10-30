// The Markdown docs in the repo, built from the same data as the site.
// `npm run docs` writes them. A test fails if they drift from model.ts.

import {
  CLAIMS,
  CLAIM_TOPICS,
  EXPERIMENTS,
  GAPS,
  MATURITY,
  OPEN_GROUND,
  OPEN_QUESTIONS,
  RECOMMENDATIONS,
  STATIONS,
  STRENGTH,
  TOOLS,
  TOOLS_CHECKED,
  referenceById,
  stationById,
  type ReferenceId,
} from "./model.ts";

const HEADER =
  "<!-- Generated from src/viva/model.ts by `npm run docs`. Edit the model, not this file. -->\n\n";

const cell = (s: string) => s.replace(/\|/g, "\\|");
const link = (id: ReferenceId) => {
  const r = referenceById(id);
  return `[${cell(r.title)}](${r.url}) (${r.date})`;
};

export function claimsMd(): string {
  const legend = Object.entries(STRENGTH)
    .map(([k, v]) => `- **${k}**: ${v}`)
    .join("\n");
  const sections = CLAIM_TOPICS.map((topic) => {
    const rows = CLAIMS.filter((c) => c.topic === topic)
      .map(
        (c) =>
          `| ${cell(c.text)} | ${c.strength} | ${cell(c.caveat ?? "")} | ${c.sources.map(link).join("<br>")} |`,
      )
      .join("\n");
    return `## ${topic}\n\n| Claim | Label | Caveat | Sources |\n|---|---|---|---|\n${rows}`;
  }).join("\n\n");
  return `${HEADER}# Claims\n\nWhat the evidence says, labelled by strength.\n\n${legend}\n\n${sections}\n`;
}

export function recommendationsMd(): string {
  const legend = Object.entries(MATURITY)
    .map(([k, v]) => `- **${k}**: ${v}`)
    .join("\n");
  const rows = RECOMMENDATIONS.map(
    (r) =>
      `| ${r.maturity} | ${stationById(r.station).name} | ${r.stage} | ${cell(r.text)} | ${r.sources.map(link).join("<br>")} |`,
  ).join("\n");
  return `${HEADER}# Recommendations\n\n${legend}\n\n| Label | Station | Stage | Recommendation | Sources |\n|---|---|---|---|---|\n${rows}\n`;
}

export function priorArtMd(): string {
  const rows = TOOLS.map(
    (t) =>
      `| [${t.name}](${t.url}) | ${cell(t.what)} | ${cell(t.evidence)} | ${t.fits
        .map((f) => `\`${f.rec}\` ${f.fit}`)
        .join("<br>")} |`,
  ).join("\n");
  const gaps = Object.entries(GAPS)
    .map(([id, g]) => `- \`${id}\`: ${g}`)
    .join("\n");
  const ground = OPEN_GROUND.map((g) => `- ${g}`).join("\n");
  return `${HEADER}# Prior art\n\nChecked ${TOOLS_CHECKED}. Not an endorsement.\n\n| Tool | What it does | Evidence it works | Recommendations it meets |\n|---|---|---|---|\n${rows}\n\n## Gaps\n\n${gaps}\n\n## Where the open ground is\n\n${ground}\n`;
}

export function experimentsMd(): string {
  const questions = OPEN_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const rows = EXPERIMENTS.map(
    (e) => `| ${e.id} | ${cell(e.text)} | ${e.status} | ${cell(e.result)} |`,
  ).join("\n");
  return `${HEADER}# Experiments\n\n## Open questions\n\n${questions}\n\n## Log\n\n| # | Experiment | Status | Result |\n|---|---|---|---|\n${rows}\n`;
}

export function stationsMd(): string {
  return STATIONS.map((s) => `${Number(s.index)}. **${s.name}**: ${s.thesis}`).join("\n");
}

export function docFiles(): Record<string, string> {
  return {
    "docs/claims.md": claimsMd(),
    "docs/recommendations.md": recommendationsMd(),
    "docs/prior-art.md": priorArtMd(),
    "EXPERIMENTS.md": experimentsMd(),
  };
}
