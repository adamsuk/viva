// The agent skills the Skills page describes (https://github.com/adamsuk/viva-skills).
// One source so the page and its tests agree; update it when a skill gains a feature.

export interface SkillFeature {
  name: string;
  text: string;
}

export interface SkillInfo {
  name: string;
  description: string;
  invoke: string;
  features: SkillFeature[];
}

export const SKILLS_REPO = "adamsuk/viva-skills";

export const SKILLS: SkillInfo[] = [
  {
    name: "viva",
    description:
      "One small scenario question about your recent change, with a confidence rating. Practice, not a gate.",
    invoke: "/viva or “check my last commit”",
    features: [
      {
        name: "Dispute a question",
        text: "If the question itself was wrong, say “dispute”. The agent re-checks the code and, if you are right, logs it as disputed so it never counts against you.",
      },
      {
        name: "Check a bot review comment",
        text: "Point it at a CodeRabbit or other bot comment before you forward or act on it. It checks the claim against the code, then asks whether you could defend or refute it.",
      },
      {
        name: "How the change was made",
        text: "It records whether you wrote the change by hand, asked AI why, generated then understood it, delegated it, or an agent built it, so the map can show whether that tracks your understanding.",
      },
    ],
  },
  {
    name: "viva-assess",
    description:
      "Interpret and assess multiple answers or a log excerpt. Flags confident-wrong cases and suggests next steps.",
    invoke: "/viva-assess or paste a log",
    features: [
      {
        name: "Leaves disputes out",
        text: "Disputed checks are a note about question quality, never a gap.",
      },
      {
        name: "Grades by how the change was made",
        text: "When the log records it, compares understood, partial and missed by how each change was made.",
      },
    ],
  },
];

export interface AgentInfo {
  name: string;
  flag: string;
  note: string;
}

export const AGENTS: AgentInfo[] = [
  { name: "Claude Code", flag: "claude-code", note: "Also works for Grok in many setups." },
  { name: "Cursor", flag: "cursor", note: "" },
  { name: "Codex", flag: "codex", note: "" },
  { name: "Grok", flag: "grok", note: "Reads Claude Code skills too." },
];

export function installCommand(skill: string, agentFlag?: string): string {
  const base = `npx skills add ${SKILLS_REPO} --skill ${skill}`;
  return agentFlag ? `${base} --agent ${agentFlag} -g` : base;
}

/** One global install command per skill for an agent. */
export function agentCommands(agentFlag: string): string[] {
  return SKILLS.map((s) => installCommand(s.name, agentFlag));
}
