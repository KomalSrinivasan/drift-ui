import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TreeView, type TreeNode } from "@/registry/default/ui/tree-view"

const ITEMS: TreeNode[] = [
  {
    id: "app",
    label: "app",
    children: [
      { id: "app/page", label: "page.tsx" },
      { id: "app/layout", label: "layout.tsx" },
    ],
  },
  { id: "archive", label: "archive", isBranch: true },
  { id: "package", label: "package.json" },
]

function focusedLabel() {
  return document.activeElement?.textContent
}

describe("TreeView", () => {
  it("renders a tree with levels, set positions and one tab stop", () => {
    render(
      <TreeView aria-label="Files" items={ITEMS} defaultExpanded={["app"]} />
    )

    const rows = screen.getAllByRole("treeitem")
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument()
    expect(rows.map((row) => row.getAttribute("aria-level"))).toEqual([
      "1",
      "2",
      "2",
      "1",
      "1",
    ])
    expect(rows[1]).toHaveAttribute("aria-posinset", "1")
    expect(rows[1]).toHaveAttribute("aria-setsize", "2")
    expect(rows.filter((row) => row.tabIndex === 0)).toHaveLength(1)
  })

  it("expands with ArrowRight, enters children, and returns to the parent with ArrowLeft", async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(
      <TreeView
        aria-label="Files"
        items={ITEMS}
        onExpandedChange={onExpandedChange}
      />
    )

    await user.tab()
    expect(focusedLabel()).toBe("app")

    await user.keyboard("{ArrowRight}")
    expect(onExpandedChange).toHaveBeenLastCalledWith(["app"])
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute(
      "aria-expanded",
      "true"
    )

    await user.keyboard("{ArrowRight}")
    expect(focusedLabel()).toBe("page.tsx")

    await user.keyboard("{ArrowLeft}")
    expect(focusedLabel()).toBe("app")

    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute(
      "aria-expanded",
      "false"
    )
  })

  it("moves with ArrowDown, Home and End", async () => {
    const user = userEvent.setup()
    render(<TreeView aria-label="Files" items={ITEMS} />)

    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(focusedLabel()).toBe("archive")
    await user.keyboard("{End}")
    expect(focusedLabel()).toBe("package.json")
    await user.keyboard("{Home}")
    expect(focusedLabel()).toBe("app")
  })

  it("jumps by typeahead and keeps multi letter queries on the current match", async () => {
    const user = userEvent.setup()
    render(
      <TreeView aria-label="Files" items={ITEMS} defaultExpanded={["app"]} />
    )

    await user.tab()
    await user.keyboard("pa")
    expect(focusedLabel()).toBe("page.tsx")
  })

  it("selects with Enter and reports the selection", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(
      <TreeView
        aria-label="Files"
        items={ITEMS}
        onSelectedChange={onSelectedChange}
      />
    )

    await user.tab()
    await user.keyboard("{End}{Enter}")

    expect(onSelectedChange).toHaveBeenCalledWith("package")
    expect(
      screen.getByRole("treeitem", { name: "package.json" })
    ).toHaveAttribute("aria-selected", "true")
  })

  it("shows a loading row for an expanded branch without children", () => {
    render(
      <TreeView
        aria-label="Files"
        items={ITEMS}
        defaultExpanded={["archive"]}
      />
    )
    expect(screen.getByText("Loading")).toBeInTheDocument()
  })

  it("checks with Space, marks the parent mixed and reports every checked id", async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(
      <TreeView
        multiple
        aria-label="Files"
        items={ITEMS}
        defaultExpanded={["app"]}
        onSelectedChange={onSelectedChange}
      />
    )

    expect(screen.getByRole("tree")).toHaveAttribute(
      "aria-multiselectable",
      "true"
    )
    await user.tab()
    await user.keyboard("{ArrowDown}{ }")

    expect(onSelectedChange).toHaveBeenLastCalledWith(["app/page"])
    expect(screen.getByRole("treeitem", { name: "page.tsx" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute(
      "aria-checked",
      "mixed"
    )
    expect(screen.getByRole("treeitem", { name: "app" })).not.toHaveAttribute(
      "aria-selected"
    )

    await user.keyboard("{ArrowDown}{ }")
    expect(screen.getByRole("treeitem", { name: "app" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(onSelectedChange).toHaveBeenLastCalledWith([
      "app/page",
      "app/layout",
      "app",
    ])
  })

  it("expands a branch with Enter and checks it with Space in multiple mode", async () => {
    const user = userEvent.setup()
    render(<TreeView multiple aria-label="Files" items={ITEMS} />)

    await user.tab()
    await user.keyboard("{Enter}")
    const app = screen.getByRole("treeitem", { name: "app" })
    expect(app).toHaveAttribute("aria-expanded", "true")
    expect(app).toHaveAttribute("aria-checked", "false")

    await user.keyboard("{ }")
    expect(app).toHaveAttribute("aria-checked", "true")
    expect(
      screen.getByRole("treeitem", { name: "layout.tsx" })
    ).toHaveAttribute("aria-checked", "true")
  })

  it("loads children through loadChildren, shows a failure and retries with ArrowRight", async () => {
    const user = userEvent.setup()
    let attempt = 0

    function Lazy() {
      const [children, setChildren] = React.useState<TreeNode[]>()
      return (
        <TreeView
          aria-label="Files"
          items={[{ id: "remote", label: "remote", isBranch: true, children }]}
          loadChildren={async () => {
            attempt++
            if (attempt === 1) throw new Error("offline")
            setChildren([{ id: "remote/a", label: "a.log" }])
          }}
        />
      )
    }

    render(<Lazy />)
    await user.tab()
    await user.keyboard("{ArrowRight}")

    expect(await screen.findByText("Couldn't load")).toBeInTheDocument()
    const remote = screen.getByRole("treeitem", { name: "remote" })
    expect(remote).toHaveAccessibleDescription(/Couldn't load/)

    await user.keyboard("{ArrowRight}")
    expect(
      await screen.findByRole("treeitem", { name: "a.log" })
    ).toBeInTheDocument()
    expect(attempt).toBe(2)
    expect(screen.queryByText("Couldn't load")).not.toBeInTheDocument()
  })

  it("renders a window of a virtual tree and keeps focus on rows outside it", async () => {
    const user = userEvent.setup()
    const items: TreeNode[] = Array.from({ length: 10_000 }, (_, index) => ({
      id: `n${index}`,
      label: `node ${index}`,
    }))
    render(<TreeView virtual aria-label="Big" items={items} />)

    expect(screen.getAllByRole("treeitem").length).toBeLessThan(50)

    await user.tab()
    await user.keyboard("{End}")
    expect(focusedLabel()).toBe("node 9999")
    await user.keyboard("{ArrowUp}")
    expect(focusedLabel()).toBe("node 9998")
    expect(screen.getAllByRole("treeitem").length).toBeLessThan(50)
    expect(screen.getByRole("treeitem", { name: "node 9998" })).toHaveAttribute(
      "aria-posinset",
      "9999"
    )

    act(() => screen.getByRole("tree").dispatchEvent(new Event("scroll")))
    expect(document.activeElement).toBe(
      screen.getByRole("treeitem", { name: "node 9998" })
    )
  })
})
