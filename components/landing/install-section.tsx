import { AgentInstallPanel } from "@/components/landing/agent-install-panel"
import { HandInstallSteps } from "@/components/landing/hand-install-steps"
import { SectionHeading } from "@/components/landing/section-heading"

export function InstallSection() {
  return (
    <section
      id="install"
      className="mx-auto max-w-7xl scroll-mt-16 px-4 pt-14 pb-20 md:px-10 md:pt-16 md:pb-28"
    >
      <SectionHeading
        eyebrow="Install"
        title="One prompt, or three commands"
        lead="Paste the prompt into your coding agent and it reads llms.txt and installs only what the task needs. Or run the shadcn CLI yourself."
      />
      <div className="mt-12 grid reveal gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <AgentInstallPanel />
        <HandInstallSteps />
      </div>
    </section>
  )
}
