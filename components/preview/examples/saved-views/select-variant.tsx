"use client"

import * as React from "react"

import { SavedViews, type SavedView } from "@/registry/default/ui/saved-views"

const VIEWS: SavedView[] = [
  { id: "v1", name: "Backlog", isDefault: true },
  { id: "v2", name: "In Progress" },
  { id: "v3", name: "Review Queue" },
  { id: "v4", name: "Completed" },
]

export function SavedViewsSelectVariantPreview() {
  const [activeId, setActiveId] = React.useState("v1")
  const [isDirty, setIsDirty] = React.useState(true)

  return (
    <div className="flex w-full flex-col gap-4">
      <SavedViews
        variant="select"
        defaultViews={VIEWS}
        activeId={activeId}
        onActiveChange={setActiveId}
        isDirty={isDirty}
        onSave={() => setIsDirty(false)}
        onReset={() => setIsDirty(false)}
      />

      <p className="text-xs text-muted-foreground">
        Dense view switcher using a dropdown trigger, suitable for compact table
        headers.
      </p>
    </div>
  )
}
