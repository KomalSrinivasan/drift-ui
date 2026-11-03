import * as React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TimezonePicker } from "@/registry/default/ui/timezone-picker"

const ZONES = ["America/New_York", "Europe/London", "Asia/Tokyo"]

function trigger() {
  return screen.getByRole("combobox", { name: "Time zone" })
}

async function openPicker(user: ReturnType<typeof userEvent.setup>) {
  await user.click(trigger())
  return screen.findByRole("combobox", { name: "Search time zones" })
}

describe("TimezonePicker", () => {
  it("shows the placeholder, then the chosen zone with its offset", () => {
    const { rerender } = render(<TimezonePicker aria-label="Time zone" />)
    expect(trigger()).toHaveTextContent("Select a time zone")

    rerender(<TimezonePicker aria-label="Time zone" value="Asia/Tokyo" />)
    expect(trigger()).toHaveTextContent("Asia / TokyoGMT+9")
  })

  it("opens from the keyboard and picks a zone by search", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimezonePicker aria-label="Time zone" onValueChange={onValueChange} />
    )

    await user.tab()
    await user.keyboard("{Enter}")
    const search = await screen.findByRole("combobox", {
      name: "Search time zones",
    })
    expect(search).toHaveFocus()

    await user.keyboard("tokyo{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("Asia/Tokyo")
    expect(trigger()).toHaveTextContent("Asia / Tokyo")
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    )
  })

  it("wraps arrow keys through the list", async () => {
    const user = userEvent.setup()
    render(<TimezonePicker aria-label="Time zone" timeZones={ZONES} />)

    const search = await openPicker(user)
    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(3)
    expect(search).toHaveAttribute("aria-activedescendant", options[0].id)

    await user.keyboard("{ArrowUp}")
    expect(search).toHaveAttribute("aria-activedescendant", options[2].id)
    await user.keyboard("{ArrowDown}")
    expect(search).toHaveAttribute("aria-activedescendant", options[0].id)
  })

  it("starts on the selected zone and marks it selected", async () => {
    const user = userEvent.setup()
    render(
      <TimezonePicker
        aria-label="Time zone"
        timeZones={ZONES}
        defaultValue="Asia/Tokyo"
      />
    )

    const search = await openPicker(user)
    const tokyo = screen.getByRole("option", { name: /Tokyo/ })

    expect(tokyo).toHaveAttribute("aria-selected", "true")
    expect(search).toHaveAttribute("aria-activedescendant", tokyo.id)
  })

  it("treats an old zone name as its current one", async () => {
    const user = userEvent.setup()
    render(<TimezonePicker aria-label="Time zone" value="Asia/Calcutta" />)

    expect(trigger()).toHaveTextContent("Asia / Kolkata")
    await openPicker(user)
    expect(screen.getByRole("option", { name: /Kolkata/ })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })

  it("selects a zone by click", async () => {
    const user = userEvent.setup()
    render(<TimezonePicker aria-label="Time zone" timeZones={ZONES} />)

    await openPicker(user)
    await user.click(screen.getByRole("option", { name: /London/ }))

    expect(trigger()).toHaveTextContent("Europe / London")
  })

  it("says so when nothing matches", async () => {
    const user = userEvent.setup()
    render(<TimezonePicker aria-label="Time zone" timeZones={ZONES} />)

    await openPicker(user)
    await user.keyboard("atlantis")

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
    expect(screen.getByText("No time zone found")).toBeInTheDocument()
  })

  it("supports controlled use", async () => {
    const user = userEvent.setup()

    function Controlled() {
      const [value, setValue] = React.useState("Europe/London")
      return (
        <>
          <TimezonePicker
            aria-label="Time zone"
            timeZones={ZONES}
            value={value}
            onValueChange={setValue}
          />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)

    await openPicker(user)
    await user.keyboard("new{Enter}")

    expect(screen.getByRole("status")).toHaveTextContent("America/New_York")
  })
})
