"use client"

import { useEffect, useState } from "react"
import { ArrowUpRightIcon, ChevronDownIcon } from "lucide-react"
import * as m from "motion/react-m"

import { cn } from "@/registry/default/lib/utils"

const ACTIVE_LINE_RATIO = 0.3

export type PageSection = { id: string; label: string; isNested?: boolean }

function findActiveSection(sections: PageSection[]) {
  const activeLine = window.innerHeight * ACTIVE_LINE_RATIO

  return sections.findLast(
    (section) =>
      (document.getElementById(section.id)?.getBoundingClientRect().top ??
        Infinity) <= activeLine
  )?.id
}

export function useActiveSection(sections: PageSection[]) {
  const [activeId, setActiveId] = useState<string | undefined>()

  useEffect(() => {
    function updateActiveId() {
      setActiveId(findActiveSection(sections))
    }

    const frameId = requestAnimationFrame(updateActiveId)
    window.addEventListener("scroll", updateActiveId, { passive: true })
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("scroll", updateActiveId)
    }
  }, [sections])

  return activeId
}

export function OnThisPage({
  sections,
  sourceUrl,
}: {
  sections: PageSection[]
  sourceUrl?: string
}) {
  const activeId = useActiveSection(sections)

  return (
    <div className="sticky top-28 flex flex-col gap-8 text-sm">
      <nav aria-label="On this page" className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          On this page
        </p>
        <ul className="flex flex-col border-l border-border/60">
          {sections.map((section) => {
            const isActive = section.id === activeId

            return (
              <li key={section.id} className="relative">
                {isActive && (
                  <m.span
                    aria-hidden
                    layoutId="on-this-page-marker"
                    transition={{ type: "spring", stiffness: 480, damping: 38 }}
                    className="absolute inset-y-1 -left-px w-0.5 rounded-full bg-brand"
                  />
                )}
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "block py-1.5 pl-4 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:underline",
                    section.isNested && "pl-7 text-[13px]",
                    isActive && "text-foreground"
                  )}
                >
                  {section.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View on GitHub
          <ArrowUpRightIcon className="size-3" />
        </a>
      )}
    </div>
  )
}

export function OnThisPageDisclosure({
  sections,
  className,
}: {
  sections: PageSection[]
  className?: string
}) {
  return (
    <details className={cn("group rounded-xl border", className)}>
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <ul className="flex flex-col border-t px-4 py-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                section.isNested && "pl-4"
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}
