import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type {
  MentionOption,
  MentionSearch,
} from "@/registry/default/lib/mention"
import { MentionTextarea } from "@/registry/default/ui/mention-textarea"

const TRIGGERS = {
  "@": [
    { value: "noor", label: "Noor Haddad", description: "Platform" },
    { value: "tomasz", label: "Tomasz Wierzba" },
  ],
  "#": [{ value: "ops", label: "ops" }],
}

function textarea() {
  return screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Comment" })
}

describe("MentionTextarea", () => {
  it("opens filtered suggestions after a trigger character", async () => {
    const user = userEvent.setup()
    render(<MentionTextarea aria-label="Comment" triggers={TRIGGERS} />)

    await user.type(textarea(), "Thanks @wier")

    expect(textarea()).toHaveAttribute("aria-controls")
    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["Tomasz Wierzba"])
    expect(textarea()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option").id
    )
  })

  it("inserts the highlighted option with Enter after moving with the arrows", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MentionTextarea
        aria-label="Comment"
        triggers={TRIGGERS}
        onValueChange={onValueChange}
      />
    )

    await user.type(textarea(), "cc @")
    await user.keyboard("{ArrowDown}{Enter}")

    expect(textarea()).toHaveValue("cc @tomasz ")
    expect(onValueChange).toHaveBeenLastCalledWith("cc @tomasz ")
    expect(textarea()).not.toHaveAttribute("aria-controls")
  })

  it("supports several triggers and inserts on click", async () => {
    const user = userEvent.setup()
    render(<MentionTextarea aria-label="Comment" triggers={TRIGGERS} />)

    await user.type(textarea(), "post in #")
    await user.click(screen.getByRole("option", { name: "ops" }))

    expect(textarea()).toHaveValue("post in #ops ")
  })

  it("dismisses suggestions with Escape and keeps the typed text", async () => {
    const user = userEvent.setup()
    render(<MentionTextarea aria-label="Comment" triggers={TRIGGERS} />)

    await user.type(textarea(), "@no")
    await user.keyboard("{Escape}")

    expect(textarea()).not.toHaveAttribute("aria-controls")
    expect(textarea()).toHaveValue("@no")
  })

  it("lets Enter add a newline when no suggestions are open", async () => {
    const user = userEvent.setup()
    render(<MentionTextarea aria-label="Comment" triggers={TRIGGERS} />)

    await user.type(textarea(), "line one{Enter}line two")

    expect(textarea()).toHaveValue("line one\nline two")
  })

  it("removes a whole mention with Backspace", async () => {
    const user = userEvent.setup()
    render(<MentionTextarea aria-label="Comment" triggers={TRIGGERS} />)

    await user.type(textarea(), "hi @no{Enter}")
    expect(textarea()).toHaveValue("hi @noor ")

    await user.keyboard("{Backspace}{Backspace}")
    expect(textarea()).toHaveValue("hi ")
  })

  it("removes a whole mention with Delete", async () => {
    const user = userEvent.setup()
    render(
      <MentionTextarea
        aria-label="Comment"
        triggers={TRIGGERS}
        defaultValue="hi @noor ok"
      />
    )

    await user.click(textarea())
    textarea().setSelectionRange(3, 3)
    fireEvent.select(textarea())
    await user.keyboard("{Delete}")

    expect(textarea()).toHaveValue("hi  ok")
  })

  it("keeps the caret out of a mention", () => {
    render(
      <MentionTextarea
        aria-label="Comment"
        triggers={TRIGGERS}
        defaultValue="hi @noor ok"
      />
    )

    textarea().setSelectionRange(5, 5)
    fireEvent.select(textarea())
    expect(textarea().selectionStart).toBe(3)

    textarea().setSelectionRange(4, 4)
    fireEvent.select(textarea())
    expect(textarea().selectionStart).toBe(8)
  })

  it("leaves Enter to the IME while it is composing", async () => {
    const user = userEvent.setup()
    render(<MentionTextarea aria-label="Comment" triggers={TRIGGERS} />)

    await user.type(textarea(), "cc @")
    fireEvent.keyDown(textarea(), { key: "Enter", isComposing: true })
    fireEvent.keyDown(textarea(), { key: "Enter", keyCode: 229 })

    expect(textarea()).toHaveValue("cc @")
    expect(screen.getAllByRole("option")).toHaveLength(2)
  })

  it("loads options from a search and drops stale responses", async () => {
    const user = userEvent.setup()
    const pending = new Map<string, (options: MentionOption[]) => void>()
    const search = vi.fn<MentionSearch>(
      (query) => new Promise((resolve) => pending.set(query, resolve))
    )
    render(
      <MentionTextarea
        aria-label="Comment"
        triggers={{ "@": search }}
        searchDelay={0}
      />
    )

    await user.type(textarea(), "@a")
    expect(await screen.findByText("Loading suggestions")).toBeInTheDocument()
    await waitFor(() => expect(pending.has("a")).toBe(true))

    await user.type(textarea(), "b")
    await waitFor(() => expect(pending.has("ab")).toBe(true))
    pending.get("ab")!([{ value: "abby", label: "Abby" }])
    pending.get("a")!([{ value: "ana", label: "Ana" }])

    expect(await screen.findByRole("option", { name: "Abby" })).toBeVisible()
    expect(
      screen.queryByRole("option", { name: "Ana" })
    ).not.toBeInTheDocument()
    expect(search.mock.calls[0]?.[1].signal.aborted).toBe(true)

    await user.keyboard("{Enter}")
    expect(textarea()).toHaveValue("@abby ")
    await user.keyboard("{Backspace}{Backspace}")
    expect(textarea()).toHaveValue("")
  })

  it("says when a search finds nothing or fails", async () => {
    const user = userEvent.setup()
    render(
      <MentionTextarea
        aria-label="Comment"
        triggers={{
          "@": async (query) => {
            if (query === "x") throw new Error("offline")
            return []
          },
        }}
        searchDelay={0}
      />
    )

    await user.type(textarea(), "@z")
    expect(await screen.findByText("No results")).toBeInTheDocument()

    await user.clear(textarea())
    await user.type(textarea(), "@x")
    expect(
      await screen.findByText("Couldn't load suggestions")
    ).toBeInTheDocument()
  })
})
