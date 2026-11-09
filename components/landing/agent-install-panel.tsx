import { ArrowUpRightIcon, BotIcon } from "lucide-react"

import { buildAgentPrompt } from "@/lib/agent-docs/build-docs"
import { CopyTextButton } from "@/components/landing/copy-text-button"

const AGENT_FILES = [
  { href: "/llms.txt", label: "llms.txt", detail: "component index" },
  {
    href: "/llms-full.txt",
    label: "llms-full.txt",
    detail: "props and examples",
  },
  {
    href: "/r/registry.json",
    label: "registry.json",
    detail: "every item, machine readable",
  },
]

function InlineCode({ text }: { text: string }) {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="text-foreground">
        {part}
      </span>
    ) : (
      part
    )
  )
}

function PromptLines({ prompt }: { prompt: string }) {
  return prompt.split("\n").map((line, index) => {
    const step = /^(\d+)\. (.*)$/.exec(line)
    if (!line) return <span key={index} className="block h-3" />
    if (step)
      return (
        <span key={index} className="grid grid-cols-[1.75rem_1fr] py-1">
          <span className="text-brand tabular-nums">
            {step[1].padStart(2, "0")}
          </span>
          <span>
            <InlineCode text={step[2]} />
          </span>
        </span>
      )
    return (
      <span key={index} className="block">
        <InlineCode text={line} />
      </span>
    )
  })
}

export function AgentInstallPanel() {
  const prompt = buildAgentPrompt()

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card/40 shadow-[0_40px_80px_-48px] shadow-brand-solid/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand-solid text-brand-solid-foreground [&_svg]:size-3.5">
            <BotIcon />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              Prompt for your coding agent
            </span>
            <span className="text-xs text-muted-foreground">
              Paste into Claude Code, Cursor, Codex or any agent with a terminal
            </span>
          </div>
        </div>
        <CopyTextButton
          text={prompt}
          label="Copy prompt"
          copiedLabel="Prompt copied"
        />
      </div>
      <div className="relative flex-1">
        <pre className="max-h-[24rem] overflow-auto p-5 pb-10 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground sm:text-[13px]">
          <code>
            <PromptLines prompt={prompt} />
          </code>
        </pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
      </div>
      <ul className="grid border-t sm:grid-cols-3 sm:divide-x">
        {AGENT_FILES.map((file) => (
          <li
            key={file.href}
            className="border-b last:border-b-0 sm:border-b-0"
          >
            <a
              href={file.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-3 px-5 py-3 transition-colors outline-none hover:bg-accent/40 focus-visible:bg-accent/40"
            >
              <span className="flex flex-col">
                <span className="font-mono text-xs text-foreground">
                  {file.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file.detail}
                </span>
              </span>
              <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
