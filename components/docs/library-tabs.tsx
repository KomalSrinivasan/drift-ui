"use client"

import Link from "next/link"
import { siBaseui, siRadixui } from "simple-icons"

import { cn } from "@/registry/default/lib/utils"
import {
  componentPath,
  PRIMITIVE_LIBRARIES,
  PRIMITIVE_LIBRARY_COOKIE,
  type PrimitiveLibrary,
} from "@/lib/primitive-library"

const LIBRARY_ICONS: Record<PrimitiveLibrary, { path: string }> = {
  base: siBaseui,
  radix: siRadixui,
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function rememberLibrary(library: PrimitiveLibrary) {
  document.cookie = `${PRIMITIVE_LIBRARY_COOKIE}=${library}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
}

export function LibraryTabs({
  slug,
  library,
}: {
  slug: string
  library: PrimitiveLibrary
}) {
  return (
    <nav aria-label="Primitive library" className="flex items-center gap-6">
      {PRIMITIVE_LIBRARIES.map((item) => {
        const isActive = item.value === library

        return (
          <Link
            key={item.value}
            href={componentPath(slug, item.value)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            onClick={() => rememberLibrary(item.value)}
            className={cn(
              "flex h-9 items-center gap-2 border-b-2 border-transparent text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive && "border-brand font-medium text-foreground"
            )}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3.5 shrink-0"
            >
              <path d={LIBRARY_ICONS[item.value].path} />
            </svg>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
