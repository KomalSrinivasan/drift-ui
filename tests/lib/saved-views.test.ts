import { describe, expect, it } from "vitest"

import {
  createSavedView,
  deleteSavedView,
  duplicateSavedView,
  findUniqueViewName,
  generateViewId,
  getActiveSavedView,
  renameSavedView,
  setDefaultSavedView,
  type SavedView,
} from "@/registry/default/lib/saved-views"

describe("generateViewId", () => {
  it("generates unique string identifiers", () => {
    const id1 = generateViewId()
    const id2 = generateViewId()
    expect(id1).toMatch(/^view-[a-z0-9]+$/)
    expect(id1).not.toBe(id2)
  })
})

describe("findUniqueViewName", () => {
  it("returns baseName when not taken", () => {
    const existing = [{ name: "First View" }]
    expect(findUniqueViewName("Second View", existing)).toBe("Second View")
  })

  it("returns Untitled View when given an empty name", () => {
    expect(findUniqueViewName("   ", [])).toBe("Untitled View")
  })

  it("appends (Copy) when name is taken", () => {
    const existing = [{ name: "My View" }]
    expect(findUniqueViewName("My View", existing)).toBe("My View (Copy)")
  })

  it("increments copy index when (Copy) already exists", () => {
    const existing = [
      { name: "My View" },
      { name: "My View (Copy)" },
      { name: "My View (Copy 2)" },
    ]
    expect(findUniqueViewName("My View (Copy)", existing)).toBe(
      "My View (Copy 3)"
    )
  })

  it("handles case-insensitive duplicates", () => {
    const existing = [{ name: "my view" }]
    expect(findUniqueViewName("MY VIEW", existing)).toBe("MY VIEW (Copy)")
  })
})

describe("createSavedView", () => {
  it("creates a view with default properties", () => {
    const view = createSavedView("Open Tickets")
    expect(view.name).toBe("Open Tickets")
    expect(view.id).toMatch(/^view-/)
    expect(view.isDefault).toBeUndefined()
    expect(view.data).toBeUndefined()
  })

  it("attaches optional configuration", () => {
    const view = createSavedView("Default View", {
      id: "custom-id",
      isDefault: true,
      isLocked: true,
      data: { filter: "urgent" },
    })
    expect(view.id).toBe("custom-id")
    expect(view.isDefault).toBe(true)
    expect(view.isLocked).toBe(true)
    expect(view.data).toEqual({ filter: "urgent" })
  })
})

describe("duplicateSavedView", () => {
  it("duplicates view data and sets isDefault to false", () => {
    const source: SavedView<{ status: string }> = {
      id: "v-1",
      name: "Urgent",
      isDefault: true,
      data: { status: "open" },
    }
    const duplicated = duplicateSavedView(source, [source])
    expect(duplicated.name).toBe("Urgent (Copy)")
    expect(duplicated.id).not.toBe("v-1")
    expect(duplicated.isDefault).toBe(false)
    expect(duplicated.data).toEqual({ status: "open" })
  })

  it("increments copy count when duplicating an existing copy", () => {
    const v1 = { id: "1", name: "My View" }
    const v2 = duplicateSavedView(v1, [v1])
    expect(v2.name).toBe("My View (Copy)")

    const v3 = duplicateSavedView(v2, [v1, v2])
    expect(v3.name).toBe("My View (Copy 2)")

    const v4 = duplicateSavedView(v3, [v1, v2, v3])
    expect(v4.name).toBe("My View (Copy 3)")
  })
})

describe("renameSavedView", () => {
  it("renames view with matching ID", () => {
    const views: SavedView[] = [
      { id: "1", name: "Old Name" },
      { id: "2", name: "Other" },
    ]
    const updated = renameSavedView(views, "1", "New Name")
    expect(updated[0].name).toBe("New Name")
    expect(updated[1].name).toBe("Other")
  })

  it("ignores empty whitespace names", () => {
    const views: SavedView[] = [{ id: "1", name: "Keep Me" }]
    const updated = renameSavedView(views, "1", "   ")
    expect(updated[0].name).toBe("Keep Me")
  })
})

describe("deleteSavedView", () => {
  it("removes the target view", () => {
    const views: SavedView[] = [
      { id: "1", name: "One", isDefault: true },
      { id: "2", name: "Two" },
    ]
    const { views: nextViews, nextActiveId } = deleteSavedView(views, "2", "1")
    expect(nextViews).toHaveLength(1)
    expect(nextViews[0].id).toBe("1")
    expect(nextActiveId).toBe("1")
  })

  it("falls back to default view if active view is deleted", () => {
    const views: SavedView[] = [
      { id: "1", name: "Default", isDefault: true },
      { id: "2", name: "Active" },
    ]
    const { nextActiveId } = deleteSavedView(views, "2", "2")
    expect(nextActiveId).toBe("1")
  })

  it("falls back to first remaining view if active view deleted and no default", () => {
    const views: SavedView[] = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" },
    ]
    const { nextActiveId } = deleteSavedView(views, "1", "1")
    expect(nextActiveId).toBe("2")
  })

  it("returns null nextActiveId when all views deleted", () => {
    const views: SavedView[] = [{ id: "1", name: "Solo" }]
    const { views: nextViews, nextActiveId } = deleteSavedView(views, "1", "1")
    expect(nextViews).toHaveLength(0)
    expect(nextActiveId).toBeNull()
  })
})

describe("setDefaultSavedView", () => {
  it("sets isDefault only on the target view", () => {
    const views: SavedView[] = [
      { id: "1", name: "One", isDefault: true },
      { id: "2", name: "Two" },
      { id: "3", name: "Three" },
    ]
    const updated = setDefaultSavedView(views, "2")
    expect(updated.find((v) => v.id === "1")?.isDefault).toBe(false)
    expect(updated.find((v) => v.id === "2")?.isDefault).toBe(true)
    expect(updated.find((v) => v.id === "3")?.isDefault).toBe(false)
  })
})

describe("getActiveSavedView", () => {
  it("finds view matching activeId", () => {
    const views: SavedView[] = [
      { id: "1", name: "One" },
      { id: "2", name: "Two" },
    ]
    expect(getActiveSavedView(views, "2")?.name).toBe("Two")
  })

  it("falls back to default view if activeId not found", () => {
    const views: SavedView[] = [
      { id: "1", name: "One" },
      { id: "2", name: "Two", isDefault: true },
    ]
    expect(getActiveSavedView(views, "999")?.name).toBe("Two")
  })

  it("falls back to first view if neither activeId nor default exists", () => {
    const views: SavedView[] = [
      { id: "1", name: "First" },
      { id: "2", name: "Second" },
    ]
    expect(getActiveSavedView(views, "999")?.name).toBe("First")
  })
})
