import { ArrowUpRightIcon } from "lucide-react"

import { FlagshipSticker } from "@/components/docs/flagship-sticker"
import { LibraryTabs } from "@/components/docs/library-tabs"
import { CATALOG, findCategory, type CatalogEntry } from "@/lib/catalog"
import {
  registryItemPath,
  type PrimitiveLibrary,
} from "@/lib/primitive-library"

export function ComponentHeader({
  entry,
  library,
  sourceUrl,
}: {
  entry: CatalogEntry
  library: PrimitiveLibrary
  sourceUrl: string
}) {
  const category = findCategory(entry.category)
  const position = CATALOG.indexOf(entry) + 1

  return (
    <header className="flex flex-col gap-5">
      <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
        <span>
          <span className="text-brand">
            {String(position).padStart(2, "0")}
          </span>{" "}
          / {CATALOG.length}
        </span>
        <span aria-hidden>·</span>
        <span>{category?.label}</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-5xl leading-[0.95] font-semibold tracking-[-0.045em] md:text-6xl">
          {entry.name}
        </h1>
        {entry.isFlagship && <FlagshipSticker className="text-sm" />}
      </div>
      <p className="max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
        {entry.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
        <code className="text-foreground">@drift-ui/{entry.slug}</code>
        {entry.category === "primitives" && <span>Same API as shadcn/ui</span>}
        <a
          href={registryItemPath(entry.slug, library)}
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          Registry JSON
          <ArrowUpRightIcon className="size-3" />
        </a>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          View on GitHub
          <ArrowUpRightIcon className="size-3" />
        </a>
      </div>
      <LibraryTabs slug={entry.slug} library={library} />
    </header>
  )
}
