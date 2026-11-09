"use client"

import { SegmentedControl } from "@/components/docs/segmented-control"
import { CopyCommand } from "@/components/landing/copy-command"
import { usePackageManager } from "@/hooks/use-package-manager"
import { PACKAGE_MANAGERS, shadcnCommand } from "@/lib/package-manager"

const PACKAGE_MANAGER_ITEMS = PACKAGE_MANAGERS.map((value) => ({
  value,
  label: value,
}))

export function HandInstallSteps() {
  const { packageManager, setPackageManager } = usePackageManager()

  const steps = [
    {
      title: "Set up shadcn",
      note: "Skip this if the project already has a components.json.",
      body: (
        <CopyCommand
          command={shadcnCommand(packageManager, "init")}
          className="w-full"
        />
      ),
    },
    {
      title: "Add a component",
      note: "Use any name from the catalog. Its dependencies come with it.",
      body: (
        <CopyCommand
          command={shadcnCommand(packageManager, "add @drift-ui/tags-input")}
          className="w-full"
        />
      ),
    },
    {
      title: "Import it",
      note: "The source is now yours, in your ui folder.",
      body: (
        <code className="block rounded-md border bg-card/60 px-3.5 py-2.5 font-mono text-[13px] text-muted-foreground">
          <span className="text-brand">import</span>
          <span className="text-foreground">{" { TagsInput } "}</span>
          <span className="text-brand">from</span>
          <span className="text-foreground">
            {' "@/components/ui/tags-input"'}
          </span>
        </code>
      ),
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium">By hand</span>
          <span className="text-xs text-muted-foreground">
            Three commands in a project you already have
          </span>
        </div>
        <SegmentedControl
          items={PACKAGE_MANAGER_ITEMS}
          value={packageManager}
          onValueChange={setPackageManager}
          label="Package manager"
          className="overflow-x-auto font-mono [&>*]:text-xs"
        />
      </div>
      <ol className="flex flex-1 flex-col px-5 py-6">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 pb-8 last:pb-0"
          >
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-7 bottom-1 left-[0.95rem] w-px bg-border"
              />
            )}
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-full border bg-background font-mono text-[11px] text-brand tabular-nums"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="flex min-w-0 flex-col gap-2.5 pt-1">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.note}</p>
              </div>
              {step.body}
            </div>
          </li>
        ))}
      </ol>
      <p className="border-t px-5 py-3 text-xs text-muted-foreground">
        The @drift-ui namespace is built into the shadcn CLI, so there is
        nothing to register.
      </p>
    </div>
  )
}
