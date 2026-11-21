import { useState } from "react";

const SKILLS = [
  {
    name: "viva",
    description: "One small scenario question about your recent change, with a confidence rating. Practice, not a gate.",
    invoke: "/viva or “check my last commit”",
  },
  {
    name: "viva-assess",
    description: "Interpret and assess multiple answers or a log excerpt. Flags confident-wrong cases and suggests next steps.",
    invoke: "/viva-assess or paste a log",
  },
];

const AGENTS = [
  { name: "Claude Code", flag: "claude-code", note: "Also works for Grok in many setups." },
  { name: "Cursor", flag: "cursor", note: "" },
  { name: "Codex", flag: "codex", note: "" },
  { name: "Grok", flag: "grok", note: "Reads Claude Code skills too." },
];

export function Skills() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h2 className="font-display text-4xl italic sm:text-5xl">Skills</h2>
      <p className="mt-3 max-w-2xl text-muted">
        The practice loop lives in agent skills. Install once, keep updated, and use them in Claude
        Code, Cursor, Codex, Grok, or any compatible agent. The personal map stays local.
      </p>

      <div className="mt-8 space-y-6">
        {SKILLS.map((s) => (
          <article key={s.name} className="rounded-2xl border border-line bg-paper p-5">
            <h3 className="font-display text-2xl">{s.name}</h3>
            <p className="mt-1 text-sm text-muted">{s.description}</p>
            <p className="mt-2 font-mono text-xs text-faint">Invoke: {s.invoke}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <code className="rounded border border-line bg-paper-2 px-2 py-1 font-mono text-xs">
                npx skills add adamsuk/viva-skills --skill {s.name}
              </code>
              <button
                type="button"
                onClick={() => copy(`npx skills add adamsuk/viva-skills --skill ${s.name}`, s.name)}
                className="min-h-9 rounded-2xl border border-accent px-3 text-sm text-accent"
              >
                {copied === s.name ? "Copied" : "Copy"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <h3 className="mt-10 font-display text-2xl">Install for a specific agent</h3>
      <p className="mt-2 text-sm text-muted">
        Add <code className="font-mono text-xs">-a <agent></code> and optionally <code className="font-mono text-xs">-g</code> for global.
      </p>
      <ul className="mt-4 space-y-3">
        {AGENTS.map((a) => {
          const cmd = `npx skills add adamsuk/viva-skills --skill viva --agent ${a.flag} -g`;
          return (
            <li key={a.name} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-28 font-medium">{a.name}</span>
              <code className="flex-1 rounded border border-line bg-paper-2 px-2 py-1 font-mono text-xs">
                {cmd}
              </code>
              <button
                type="button"
                onClick={() => copy(cmd, a.name)}
                className="min-h-9 rounded-2xl border border-line px-3 text-xs"
              >
                {copied === a.name ? "Copied" : "Copy"}
              </button>
              {a.note && <span className="text-xs text-faint">{a.note}</span>}
            </li>
          );
        })}
      </ul>

      <h3 className="mt-10 font-display text-2xl">Keep updated</h3>
      <p className="mt-2 text-sm text-muted">
        Re-run the install command, or use <code className="font-mono text-xs">npx skills update</code> if your CLI supports it.
        Pin a tag with <code className="font-mono text-xs">--ref</code> when you want a frozen version.
      </p>

      <h3 className="mt-10 font-display text-2xl">MCP</h3>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The skills can be served over the Model Context Protocol Skills extension. Point an MCP client
        at a server that exposes the <a href="https://github.com/adamsuk/viva-skills" className="text-accent underline">viva-skills</a> repo
        (for example via a Skills-over-MCP host). The schema for the log lives at{" "}
        <a href="https://adamsuk.github.io/viva/log-schemas.json" className="text-accent underline">
          log-schemas.json
        </a>
        . The assess skill can interpret multiple answers without the single-check loop.
      </p>

      <p className="mt-8 text-sm text-muted">
        Source: <a href="https://github.com/adamsuk/viva-skills" className="text-accent underline">adamsuk/viva-skills</a>.
        The personal map reads the local log these skills write.
      </p>
    </section>
  );
}
