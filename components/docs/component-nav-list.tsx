import Link from "next/link"
import { useParams } from "next/navigation"

import { cn } from "@/registry/default/lib/utils"
import { ActivePill } from "@/components/docs/active-pill"
import {
  componentPath,
  isPrimitiveLibrary,
  type PrimitiveLibrary,
} from "@/lib/primitive-library"

export type NavGroup = {
  id: string
  label: string
  entries: { slug: string; name: string }[]
}

export function useActiveComponent() {
  const { library, slug } = useParams<{ library?: string; slug?: string }>()

  return {
    library: isPrimitiveLibrary(library) ? library : undefined,
    activeSlug: slug ?? null,
  }
}

function NavLink({
  href,
  isActive,
  pillId,
  onNavigate,
  children,
}: {
  href: string
  isActive: boolean
  pillId: string
  onNavigate?: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative isolate flex h-8 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isActive && "font-medium text-brand hover:text-brand"
      )}
    >
      {isActive && <ActivePill layoutId={pillId} className="bg-brand/10" />}
      {children}
    </Link>
  )
}

export function ComponentNavList({
  groups,
  activeSlug,
  library,
  pillId,
  onNavigate,
  className,
}: {
  groups: NavGroup[]
  activeSlug: string | null
  library?: PrimitiveLibrary
  pillId: string
  onNavigate?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <NavLink
        href="/components"
        isActive={activeSlug === null}
        pillId={pillId}
        onNavigate={onNavigate}
      >
        All components
      </NavLink>
      {groups.map((group) => {
        const labelId = `${pillId}-${group.id}`

        return (
          <div key={group.id} className="flex flex-col gap-2.5">
            <p
              id={labelId}
              className="flex items-baseline justify-between px-3 font-mono text-[11px] tracking-widest text-foreground uppercase"
            >
              {group.label}
              <span aria-hidden className="text-muted-foreground tabular-nums">
                {group.entries.length}
              </span>
            </p>
            <ul
              aria-labelledby={labelId}
              className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2"
            >
              {group.entries.map((entry) => (
                <li key={entry.slug}>
                  <NavLink
                    href={componentPath(entry.slug, library)}
                    isActive={activeSlug === entry.slug}
                    pillId={pillId}
                    onNavigate={onNavigate}
                  >
                    {entry.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
