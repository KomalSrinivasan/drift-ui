"use client"

import { useEffect, useRef, useState } from "react"
import { LayoutGroup } from "motion/react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/registry/default/lib/utils"
import { ActivePill } from "@/components/docs/active-pill"
import {
  ComponentNavList,
  useActiveComponent,
  type NavGroup,
} from "@/components/docs/component-nav-list"
import {
  useActiveSection,
  type PageSection,
} from "@/components/docs/on-this-page"

export function DocsBar({
  groups,
  sections,
}: {
  groups: NavGroup[]
  sections: PageSection[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const { library, activeSlug } = useActiveComponent()
  const activeSectionId = useActiveSection(sections)
  const activeName = groups
    .flatMap((group) => group.entries)
    .find((entry) => entry.slug === activeSlug)?.name
  const topSections = sections.filter((section) => !section.isNested)

  useEffect(() => {
    if (!isOpen) return

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!barRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer)
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer)
  }, [isOpen])

  return (
    <div
      ref={barRef}
      onKeyDown={(event) => event.key === "Escape" && setIsOpen(false)}
      className="sticky top-16 z-30 -mx-4 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md md:-mx-10 md:px-10"
    >
      <div className="flex h-12 items-center gap-6">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="docs-component-menu"
          onClick={() => setIsOpen((open) => !open)}
          className="-ml-2 flex h-9 min-w-0 shrink-0 items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="text-muted-foreground max-sm:sr-only">
            Components
          </span>
          {activeName && (
            <>
              <span
                aria-hidden
                className="text-muted-foreground/50 max-sm:hidden"
              >
                /
              </span>
              <span className="max-w-[40vw] truncate font-medium">
                {activeName}
              </span>
            </>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </button>
        <LayoutGroup id="docs-bar-sections">
          <nav
            aria-label="On this page"
            className="-mr-4 flex min-w-0 flex-1 [scrollbar-width:none] items-center gap-1 overflow-x-auto pr-4 md:justify-end [&::-webkit-scrollbar]:hidden"
          >
            {topSections.map((section) => {
              const isActive = section.id === activeSectionId

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative isolate flex h-8 shrink-0 items-center rounded-md px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    isActive && "text-brand hover:text-brand"
                  )}
                >
                  {isActive && (
                    <ActivePill
                      layoutId="docs-bar-section"
                      className="bg-brand/10"
                    />
                  )}
                  {section.label}
                </a>
              )
            })}
          </nav>
        </LayoutGroup>
      </div>
      <nav
        id="docs-component-menu"
        aria-label="Components"
        hidden={!isOpen}
        className="absolute inset-x-0 top-full max-h-[min(70dvh,40rem)] overflow-y-auto border-b border-border/60 bg-background px-4 py-6 shadow-[0_24px_48px_-32px] shadow-foreground/20 md:px-10"
      >
        <ComponentNavList
          groups={groups}
          activeSlug={activeSlug}
          library={library}
          pillId="docs-menu-active"
          onNavigate={() => setIsOpen(false)}
          className="sm:grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 sm:[&>a:first-child]:col-span-full"
        />
      </nav>
    </div>
  )
}
