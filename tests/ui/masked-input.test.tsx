import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CurrencyInput, MaskedInput } from "@/registry/default/ui/masked-input"

describe("MaskedInput", () => {
  it("formats characters as user types into the mask", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MaskedInput
        aria-label="Credit card"
        mask="#### #### #### ####"
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Credit card" })
    await user.type(input, "12345678")

    expect(input).toHaveValue("1234 5678 ")
    expect(onValueChange).toHaveBeenLastCalledWith("12345678", "1234 5678 ")
  })

  it("handles backspace over mask delimiters", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MaskedInput
        aria-label="Phone"
        mask="(###) ###-####"
        defaultValue="123"
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Phone" })
    expect(input).toHaveValue("(123) ")

    await user.type(input, "{Backspace}")
    expect(input).toHaveValue("(12")
    expect(onValueChange).toHaveBeenLastCalledWith("12", "(12")
  })

  it("handles a rejected key followed by a valid key without caret jumping (12x3)", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MaskedInput
        aria-label="Code"
        mask="#### ####"
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", {
      name: "Code",
    }) as HTMLInputElement
    await user.type(input, "12x3")

    expect(input).toHaveValue("123")
    expect(input.selectionStart).toBe(3)
    expect(onValueChange).toHaveBeenLastCalledWith("123", "123")
  })

  it("clears mask with literal prefix when deleting the only typed digit", async () => {
    const user = userEvent.setup()
    render(<MaskedInput aria-label="Phone" mask="+1 (###) ###-####" />)

    const input = screen.getByRole("textbox", { name: "Phone" })
    await user.type(input, "5")
    expect(input).toHaveValue("+1 (5")

    await user.type(input, "{Backspace}")
    expect(input).toHaveValue("")
  })

  it("handles soft keyboard delete past formatting using deleteContentBackward", () => {
    render(
      <MaskedInput aria-label="Card" mask="#### ####" defaultValue="12345678" />
    )

    const input = screen.getByRole("textbox", {
      name: "Card",
    }) as HTMLInputElement
    expect(input).toHaveValue("1234 5678")

    // Simulate Android soft keyboard deleting space at index 4
    fireEvent.change(input, {
      target: { value: "12345678", selectionStart: 4 },
      nativeEvent: { inputType: "deleteContentBackward" },
    })

    // '4' before the space should be deleted, yielding "1235 678"
    expect(input).toHaveValue("1235 678")
  })

  it("forwards ref to the underlying input element", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<MaskedInput ref={ref} aria-label="Card" mask="####" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(ref.current).toHaveFocus()
  })

  it("supports controlled value updates", () => {
    const { rerender } = render(
      <MaskedInput aria-label="License" mask="AA-####-AA" value="AB12" />
    )

    const input = screen.getByRole("textbox", { name: "License" })
    expect(input).toHaveValue("AB-12")

    rerender(
      <MaskedInput aria-label="License" mask="AA-####-AA" value="AB1234CD" />
    )
    expect(input).toHaveValue("AB-1234-CD")
  })

  it("submits raw value via hidden input when name is provided", () => {
    const { container } = render(
      <MaskedInput
        aria-label="Card"
        mask="#### ####"
        name="card"
        defaultValue="12345678"
      />
    )

    expect(container.querySelector("input[type=hidden]")).toHaveValue(
      "12345678"
    )
  })

  it("marks hidden input as disabled when disabled prop is true", () => {
    const { container } = render(
      <MaskedInput
        aria-label="Card"
        mask="#### ####"
        name="card"
        disabled
        defaultValue="12345678"
      />
    )

    const hidden = container.querySelector("input[type=hidden]")
    expect(hidden).toBeDisabled()
  })

  it("respects disabled attribute", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <MaskedInput
        aria-label="Disabled"
        mask="####"
        disabled
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Disabled" })
    expect(input).toBeDisabled()
    await user.type(input, "1234")
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe("CurrencyInput", () => {
  it("formats input as localized currency and emits cents", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CurrencyInput
        aria-label="Amount"
        currency="USD"
        locale="en-US"
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Amount" })
    await user.type(input, "12.50")

    expect(input).toHaveValue("$12.50")
    expect(onValueChange).toHaveBeenLastCalledWith(1250, "$12.50")
  })

  it("calls onValueChange exactly once per keystroke", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CurrencyInput
        aria-label="Amount"
        currency="USD"
        locale="en-US"
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Amount" })
    await user.type(input, "7.5")

    // '7' -> 700, '.' -> 700 (unchanged cents, no duplicate event), '5' -> 750
    expect(onValueChange).toHaveBeenCalledTimes(2)
    expect(onValueChange).toHaveBeenNthCalledWith(1, 700, "$7.00")
    expect(onValueChange).toHaveBeenNthCalledWith(2, 750, "$7.50")
  })

  it("forwards ref and passes onBlur while enforcing min boundary", async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    const ref = React.createRef<HTMLInputElement>()

    render(
      <CurrencyInput
        ref={ref}
        aria-label="Budget"
        currency="USD"
        locale="en-US"
        min={1000} // $10.00
        onBlur={onBlur}
      />
    )

    expect(ref.current).toBeInstanceOf(HTMLInputElement)

    const input = screen.getByRole("textbox", { name: "Budget" })
    await user.type(input, "5.00")
    expect(input).toHaveValue("$5.00")

    await user.tab()
    expect(onBlur).toHaveBeenCalled()
    expect(input).toHaveValue("$10.00")
  })

  it("handles EUR currency with German locale separators", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CurrencyInput
        aria-label="Betrag"
        currency="EUR"
        locale="de-DE"
        defaultValue={125050}
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Betrag" })
    expect(input.getAttribute("value")?.replace(/\u00a0/g, " ")).toBe(
      "1.250,50 €"
    )

    await user.clear(input)
    await user.type(input, "25,00")
    expect(onValueChange).toHaveBeenLastCalledWith(
      2500,
      expect.stringContaining("25,00")
    )
  })

  it("handles non-Latin numerals in ar-EG locale", () => {
    render(
      <CurrencyInput
        aria-label="Egyptian Pound"
        currency="EGP"
        locale="ar-EG"
        defaultValue={123456}
      />
    )

    const input = screen.getByRole("textbox", { name: "Egyptian Pound" })
    expect((input as HTMLInputElement).value).toContain("١٬٢٣٤٫٥٦")
  })

  it("clamps to min and max boundaries", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CurrencyInput
        aria-label="Budget"
        currency="USD"
        locale="en-US"
        min={1000} // $10.00
        max={5000} // $50.00
        onValueChange={onValueChange}
      />
    )

    const input = screen.getByRole("textbox", { name: "Budget" })
    await user.type(input, "99.00")

    // Clamped to max 5000 cents ($50.00)
    expect(onValueChange).toHaveBeenLastCalledWith(5000, "$50.00")

    await user.clear(input)
    await user.type(input, "5.00")
    expect(onValueChange).toHaveBeenLastCalledWith(500, "$5.00")

    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(1000, "$10.00")
    expect(input).toHaveValue("$10.00")
  })

  it("submits cents via hidden input and marks it disabled when disabled prop is set", () => {
    const { container, rerender } = render(
      <CurrencyInput aria-label="Price" name="price" defaultValue={1999} />
    )

    const hidden = container.querySelector("input[type=hidden]")
    expect(hidden).toHaveValue("1999")
    expect(hidden).not.toBeDisabled()

    rerender(
      <CurrencyInput
        aria-label="Price"
        name="price"
        disabled
        defaultValue={1999}
      />
    )
    expect(container.querySelector("input[type=hidden]")).toBeDisabled()
  })
})
