"use client"

import * as React from "react"

import { SavedViews, type SavedView } from "@/registry/default/ui/saved-views"

const INITIAL_VIEWS: SavedView[] = [
  { id: "all", name: "All Issues", isDefault: true },
  { id: "assigned", name: "Assigned to Me" },
  { id: "priority", name: "High Priority" },
]

export function SavedViewsControlledPreview() {
  const [views, setViews] = React.useState<SavedView[]>(INITIAL_VIEWS)
  const [activeId, setActiveId] = React.useState("all")
  const [isDirty, setIsDirty] = React.useState(false)

  return (
    <div className="flex w-full flex-col gap-4">
      <SavedViews
        views={views}
        onViewsChange={setViews}
        activeId={activeId}
        onActiveChange={setActiveId}
        isDirty={isDirty}
        onSave={() => setIsDirty(false)}
        onReset={() => setIsDirty(false)}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsDirty((prev) => !prev)}
          className="rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
        >
          Toggle unsaved state (currently {isDirty ? "dirty" : "clean"})
        </button>
      </div>

      <div className="font-mono text-xs text-muted-foreground">
        Active View: {activeId} | Views: {views.map((v) => v.name).join(", ")}
      </div>
    </div>
  )
}
