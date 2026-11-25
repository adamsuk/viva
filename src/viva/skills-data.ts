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
        text: "Point it at a CodeRabbit or other bot comment before you forward or act on it. It checks the claim against the code, then asks whether you could defend or refute it. Whether the claim held, and which bot made it, is logged, so the map can show how often each bot was right.",
      },
      {
        name: "Before you approve",
        text: "Reviewing someone else’s or an agent’s PR? Ask for one question on it before you approve. Anything you couldn’t explain is worth asking the author about first.",
      },
      {
        name: "Re-checks what you missed",
        text: "When your log shows a topic you missed a week or more ago and the change touches it, the question is a re-check on that area.",
      },
      {
        name: "Before you post",
        text: "Optionally helps you write the PR description in your own words (why, what, and the decision you’re least sure of) and suggests an Assisted-by trailer from how the change was made. Nothing is posted or committed without you.",
      },
      {
        name: "Practice mode",
        text: "Say /viva practice to work through your own past merged PRs, one question each, and note whether you had to think or just recalled. That rating stays in a separate file on your device, for Viva’s experiment 1.",
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
        name: "Confidence and drift",
        text: "Says whether your sure answers were understood more often than unsure ones, and flags it when your latest checks slipped against earlier ones.",
      },
      {
        name: "How the bots fared",
        text: "When the log records it, says how many of the bot comments you checked held, partly held, or were wrong, per bot.",
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
