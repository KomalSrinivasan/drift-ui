import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SecretField } from "@/registry/default/ui/secret-field"

const KEY = "sk_live_51Mz8a1b2"

describe("SecretField", () => {
  it("masks the value and names the hidden state for screen readers", () => {
    render(<SecretField aria-label="Live API key" value={KEY} />)

    const group = screen.getByRole("group", { name: "Live API key" })
    expect(group).toHaveTextContent("••••••••a1b2")
    expect(group).not.toHaveTextContent(KEY)
    expect(screen.getByText("Hidden, ends in a1b2")).toHaveClass("sr-only")
  })

  it("reveals and hides the value from the keyboard", async () => {
    const user = userEvent.setup()
    render(<SecretField aria-label="Live API key" value={KEY} />)

    await user.tab()
    const reveal = screen.getByRole("button", { name: "Reveal" })
    expect(reveal).toHaveFocus()
    expect(reveal).toHaveAttribute("aria-pressed", "false")

    await user.keyboard("{Enter}")
    expect(reveal).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("group")).toHaveTextContent(KEY)

    await user.keyboard(" ")
    expect(reveal).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByRole("group")).not.toHaveTextContent(KEY)
  })

  it("copies the full value while masked and announces it", async () => {
    const user = userEvent.setup()
    render(<SecretField aria-label="Live API key" value={KEY} />)

    await user.click(screen.getByRole("button", { name: "Copy" }))

    expect(await navigator.clipboard.readText()).toBe(KEY)
    expect(screen.getByRole("status")).toHaveTextContent("Copied")
    expect(screen.getByRole("group")).not.toHaveTextContent(KEY)
  })

  it("keeps short values fully masked", () => {
    render(<SecretField aria-label="PIN" value="123" visibleChars={4} />)

    expect(screen.getByRole("group")).toHaveTextContent("••••••••")
    expect(screen.getByRole("group")).not.toHaveTextContent("123")
    expect(screen.getByText("Hidden")).toHaveClass("sr-only")
  })

  it("supports controlled reveal", async () => {
    const user = userEvent.setup()
    const onRevealedChange = vi.fn()

    function Controlled() {
      const [revealed, setRevealed] = React.useState(false)
      return (
        <SecretField
          aria-label="Live API key"
          value={KEY}
          revealed={revealed}
          onRevealedChange={(next) => {
            onRevealedChange(next)
            setRevealed(next)
          }}
        />
      )
    }
    render(<Controlled />)

    await user.click(screen.getByRole("button", { name: "Reveal" }))

    expect(onRevealedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("group")).toHaveTextContent(KEY)
  })
})
