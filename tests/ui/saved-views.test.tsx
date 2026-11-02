import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SavedViews, type SavedView } from "@/registry/default/ui/saved-views"

const SAMPLE_VIEWS: SavedView[] = [
  { id: "all", name: "All Issues", isDefault: true },
  { id: "active", name: "Active Sprint" },
  { id: "high", name: "High Priority" },
]

describe("SavedViews", () => {
  it("renders views as tabs with the default view active", () => {
    render(<SavedViews defaultViews={SAMPLE_VIEWS} />)

    const tabs = screen.getAllByRole("tab")
    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveAttribute("aria-selected", "true")
    expect(tabs[1]).toHaveAttribute("aria-selected", "false")
    expect(tabs[2]).toHaveAttribute("aria-selected", "false")
  })

  it("switches active view on click and calls onActiveChange", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()

    render(
      <SavedViews defaultViews={SAMPLE_VIEWS} onActiveChange={onActiveChange} />
    )

    const activeSprintTab = screen.getByRole("tab", { name: "Active Sprint" })
    await user.click(activeSprintTab)

    expect(activeSprintTab).toHaveAttribute("aria-selected", "true")
    expect(onActiveChange).toHaveBeenCalledWith("active")
  })

  it("supports keyboard navigation across tabs with Arrow keys", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()

    render(
      <SavedViews defaultViews={SAMPLE_VIEWS} onActiveChange={onActiveChange} />
    )

    const firstTab = screen.getByRole("tab", { name: "All Issues" })
    firstTab.focus()

    // ArrowRight -> Active Sprint
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Active Sprint" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(onActiveChange).toHaveBeenCalledWith("active")

    // ArrowRight -> High Priority
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "High Priority" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(onActiveChange).toHaveBeenCalledWith("high")

    // ArrowLeft -> Active Sprint
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: "Active Sprint" })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    // Home -> All Issues
    await user.keyboard("{Home}")
    expect(screen.getByRole("tab", { name: "All Issues" })).toHaveAttribute(
      "aria-selected",
      "true"
    )

    // End -> High Priority
    await user.keyboard("{End}")
    expect(screen.getByRole("tab", { name: "High Priority" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("displays unsaved changes actions and calls onSave and onReset", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onReset = vi.fn()

    const { rerender } = render(
      <SavedViews
        defaultViews={SAMPLE_VIEWS}
        isDirty={false}
        onSave={onSave}
        onReset={onReset}
      />
    )

    expect(screen.queryByText("Unsaved")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument()

    // Turn dirty state on
    rerender(
      <SavedViews
        defaultViews={SAMPLE_VIEWS}
        isDirty={true}
        onSave={onSave}
        onReset={onReset}
      />
    )

    expect(screen.getByText("Unsaved")).toBeInTheDocument()
    const saveButton = screen.getByRole("button", { name: "Save" })
    const discardButton = screen.getByRole("button", { name: "Discard" })

    await user.click(saveButton)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "all", name: "All Issues" })
    )

    await user.click(discardButton)
    expect(onReset).toHaveBeenCalledWith(
      expect.objectContaining({ id: "all", name: "All Issues" })
    )
  })

  it("creates a new view via the add button popover", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()
    const onViewsChange = vi.fn()

    render(
      <SavedViews
        defaultViews={SAMPLE_VIEWS}
        onCreate={onCreate}
        onViewsChange={onViewsChange}
      />
    )

    const addButton = screen.getByRole("button", { name: "Create new view" })
    await user.click(addButton)

    const input = screen.getByPlaceholderText("New view name...")
    await user.type(input, "My Custom View")

    const submitButton = screen.getByRole("button", { name: "Create view" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "My Custom View" })
      ).toBeInTheDocument()
    })
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "My Custom View" })
    )
    expect(onViewsChange).toHaveBeenCalled()
  })

  it("renames a view via the options menu", async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()

    render(<SavedViews defaultViews={SAMPLE_VIEWS} onRename={onRename} />)

    // Make Active Sprint the active view
    const tab = screen.getByRole("tab", { name: "Active Sprint" })
    await user.click(tab)

    const optionsButton = screen.getByRole("button", {
      name: "Options for Active Sprint",
    })
    await user.click(optionsButton)

    const renameOption = screen.getByRole("menuitem", { name: "Rename" })
    await user.click(renameOption)

    const renameInput = screen.getByRole("textbox", { name: "Rename view" })
    await user.clear(renameInput)
    await user.type(renameInput, "Current Sprint{Enter}")

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "Current Sprint" })
      ).toBeInTheDocument()
    })
    expect(onRename).toHaveBeenCalledWith(
      expect.objectContaining({ id: "active", name: "Current Sprint" }),
      "Current Sprint"
    )
  })

  it("renames a view using the F2 keyboard shortcut", async () => {
    const user = userEvent.setup()

    render(<SavedViews defaultViews={SAMPLE_VIEWS} />)

    const tab = screen.getByRole("tab", { name: "Active Sprint" })
    tab.focus()
    await user.keyboard("{F2}")

    const renameInput = screen.getByRole("textbox", { name: "Rename view" })
    expect(renameInput).toBeInTheDocument()
    await user.clear(renameInput)
    await user.type(renameInput, "Sprint 42{Enter}")

    const renamedTab = screen.getByRole("tab", { name: "Sprint 42" })
    expect(renamedTab).toBeInTheDocument()
    expect(renamedTab).toHaveFocus()
  })

  it("duplicates a view via the options menu", async () => {
    const user = userEvent.setup()
    const onDuplicate = vi.fn()

    render(<SavedViews defaultViews={SAMPLE_VIEWS} onDuplicate={onDuplicate} />)

    const tab = screen.getByRole("tab", { name: "Active Sprint" })
    await user.click(tab)

    const optionsButton = screen.getByRole("button", {
      name: "Options for Active Sprint",
    })
    await user.click(optionsButton)

    const duplicateOption = screen.getByRole("menuitem", { name: "Duplicate" })
    await user.click(duplicateOption)

    await waitFor(() => {
      expect(
        screen.getByRole("tab", { name: "Active Sprint (Copy)" })
      ).toBeInTheDocument()
    })
    expect(onDuplicate).toHaveBeenCalled()
  })

  it("sets a view as default via the options menu", async () => {
    const user = userEvent.setup()
    const onSetDefault = vi.fn()

    render(
      <SavedViews defaultViews={SAMPLE_VIEWS} onSetDefault={onSetDefault} />
    )

    const tab = screen.getByRole("tab", { name: "Active Sprint" })
    await user.click(tab)

    const optionsButton = screen.getByRole("button", {
      name: "Options for Active Sprint",
    })
    await user.click(optionsButton)

    const setDefaultOption = screen.getByRole("menuitem", {
      name: "Set as default",
    })
    await user.click(setDefaultOption)

    expect(onSetDefault).toHaveBeenCalledWith("active")
  })

  it("deletes a view and activates the fallback view", async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(<SavedViews defaultViews={SAMPLE_VIEWS} onDelete={onDelete} />)

    // Switch to High Priority first
    const highTab = screen.getByRole("tab", { name: "High Priority" })
    await user.click(highTab)
    expect(highTab).toHaveAttribute("aria-selected", "true")

    // Delete High Priority
    const optionsButton = screen.getByRole("button", {
      name: "Options for High Priority",
    })
    await user.click(optionsButton)

    const deleteOption = screen.getByRole("menuitem", { name: "Delete" })
    await user.click(deleteOption)

    expect(onDelete).toHaveBeenCalledWith("high")
    expect(
      screen.queryByRole("tab", { name: "High Priority" })
    ).not.toBeInTheDocument()
    // Fallback activates default view "All Issues"
    expect(screen.getByRole("tab", { name: "All Issues" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("renders the select variant as a compact dropdown", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()

    render(
      <SavedViews
        variant="select"
        defaultViews={SAMPLE_VIEWS}
        onActiveChange={onActiveChange}
        isDirty={true}
      />
    )

    const trigger = screen.getByRole("button", {
      name: /Saved views: All Issues/i,
    })
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText("Unsaved")).toBeInTheDocument()

    await user.click(trigger)
    const activeOption = screen.getByRole("button", { name: "Active Sprint" })
    await user.click(activeOption)

    expect(onActiveChange).toHaveBeenCalledWith("active")
  })

  it("renames a view in select mode", async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()

    render(
      <SavedViews
        variant="select"
        defaultViews={SAMPLE_VIEWS}
        onRename={onRename}
      />
    )

    const trigger = screen.getByRole("button", {
      name: /Saved views: All Issues/i,
    })
    await user.click(trigger)

    const optionsButton = screen.getByRole("button", {
      name: "Options for Active Sprint",
    })
    await user.click(optionsButton)

    const renameOption = screen.getByRole("menuitem", { name: "Rename" })
    await user.click(renameOption)

    const renameInput = screen.getByRole("textbox", { name: "Rename view" })
    expect(renameInput).toBeInTheDocument()
    await user.clear(renameInput)
    await user.type(renameInput, "Current Sprint{Enter}")

    expect(onRename).toHaveBeenCalledWith(
      expect.objectContaining({ id: "active", name: "Current Sprint" }),
      "Current Sprint"
    )
  })

  it("closes select popover on view selection and creation", async () => {
    const user = userEvent.setup()

    render(<SavedViews variant="select" defaultViews={SAMPLE_VIEWS} />)

    const trigger = screen.getByRole("button", {
      name: /Saved views: All Issues/i,
    })
    await user.click(trigger)

    expect(screen.getByRole("listbox")).toBeInTheDocument()

    // Click a view -> popover closes
    const option = screen.getByRole("button", { name: "Active Sprint" })
    await user.click(option)

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })

    // Open again and create a view -> popover closes
    await user.click(trigger)
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    const input = screen.getByPlaceholderText("New view name...")
    await user.type(input, "Brand New View")
    const addButton = screen.getByRole("button", { name: "Add" })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    })
  })

  it("falls back to default view when activeId does not match any view", () => {
    render(<SavedViews defaultViews={SAMPLE_VIEWS} activeId="non-existent" />)

    const defaultTab = screen.getByRole("tab", { name: "All Issues" })
    expect(defaultTab).toHaveAttribute("aria-selected", "true")
    expect(defaultTab).toHaveAttribute("tabindex", "0")
  })

  it("returns focus to the tab after completing or cancelling rename", async () => {
    const user = userEvent.setup()

    render(<SavedViews defaultViews={SAMPLE_VIEWS} />)

    const tab = screen.getByRole("tab", { name: "Active Sprint" })
    tab.focus()
    await user.keyboard("{F2}")

    const input = screen.getByRole("textbox", { name: "Rename view" })
    expect(input).toHaveFocus()

    // Cancel with Escape
    await user.keyboard("{Escape}")
    expect(screen.getByRole("tab", { name: "Active Sprint" })).toHaveFocus()

    // Enter again and commit
    await user.keyboard("{F2}")
    const input2 = screen.getByRole("textbox", { name: "Rename view" })
    await user.type(input2, " 2{Enter}")
    expect(screen.getByRole("tab", { name: "Active Sprint 2" })).toHaveFocus()
  })

  it("does not call onRename or update views when rename name is unchanged", async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    const onViewsChange = vi.fn()

    render(
      <SavedViews
        defaultViews={SAMPLE_VIEWS}
        onRename={onRename}
        onViewsChange={onViewsChange}
      />
    )

    const tab = screen.getByRole("tab", { name: "Active Sprint" })
    tab.focus()
    await user.keyboard("{F2}")

    const input = screen.getByRole("textbox", { name: "Rename view" })
    expect(input).toBeInTheDocument()
    await user.keyboard("{Enter}")

    expect(onRename).not.toHaveBeenCalled()
    expect(onViewsChange).not.toHaveBeenCalled()
  })

  it("does not show delete option for locked views", async () => {
    const user = userEvent.setup()
    const viewsWithLocked: SavedView[] = [
      { id: "all", name: "All Issues", isDefault: true, isLocked: true },
      { id: "custom", name: "Custom View" },
    ]

    render(<SavedViews defaultViews={viewsWithLocked} />)

    // All Issues is locked and active
    const optionsButton = screen.getByRole("button", {
      name: "Options for All Issues",
    })
    await user.click(optionsButton)

    expect(
      screen.queryByRole("menuitem", { name: "Delete" })
    ).not.toBeInTheDocument()
  })

  it("does not show delete option when only one view exists", async () => {
    const user = userEvent.setup()
    const singleView: SavedView[] = [{ id: "solo", name: "Solo View" }]

    render(<SavedViews defaultViews={singleView} />)

    const optionsButton = screen.getByRole("button", {
      name: "Options for Solo View",
    })
    await user.click(optionsButton)

    expect(
      screen.queryByRole("menuitem", { name: "Delete" })
    ).not.toBeInTheDocument()
  })

  it("supports arrow key navigation in the options menu", async () => {
    const user = userEvent.setup()

    render(<SavedViews defaultViews={SAMPLE_VIEWS} />)

    const optionsButton = screen.getByRole("button", {
      name: "Options for All Issues",
    })
    await user.click(optionsButton)

    const menu = screen.getByRole("menu")
    expect(menu).toBeInTheDocument()

    const menuItems = screen.getAllByRole("menuitem")
    menuItems[0].focus()
    expect(menuItems[0]).toHaveFocus()

    // ArrowDown -> next item
    await user.keyboard("{ArrowDown}")
    expect(menuItems[1]).toHaveFocus()

    // ArrowUp -> back to first item
    await user.keyboard("{ArrowUp}")
    expect(menuItems[0]).toHaveFocus()
  })
})
