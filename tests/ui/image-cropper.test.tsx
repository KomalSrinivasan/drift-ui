import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ImageCropper } from "@/registry/default/ui/image-cropper"

describe("ImageCropper", () => {
  const sampleSrc =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='blue'/%3E%3C/svg%3E"

  beforeEach(() => {
    HTMLCanvasElement.prototype.toBlob = vi.fn(function (
      this: HTMLCanvasElement,
      callback: (blob: Blob | null) => void,
      type = "image/png"
    ) {
      callback(new Blob(["mock-canvas-content"], { type }))
    }) as unknown as typeof HTMLCanvasElement.prototype.toBlob
  })

  it("renders with accessible region, source image, and keyboard instructions", () => {
    render(<ImageCropper src={sampleSrc} aria-label="Avatar cropper" />)

    const region = screen.getByRole("region", { name: "Avatar cropper" })
    expect(region).toBeInTheDocument()
    expect(region).toHaveAttribute("aria-describedby")

    const img = screen.getByAltText("Source preview")
    expect(img).toHaveAttribute("src", sampleSrc)
    expect(img).toHaveAttribute("crossorigin", "anonymous")
  })

  it("applies rounded-full mask class when cropShape is round", () => {
    const { container } = render(
      <ImageCropper src={sampleSrc} cropShape="round" />
    )

    const cropArea = container.querySelector('[data-slot="crop-area"]')
    expect(cropArea).toHaveClass("rounded-full")
  })

  it("supports zoom slider interaction and reports zoom change value", async () => {
    const onZoomChange = vi.fn()

    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={1}
        onZoomChange={onZoomChange}
      />
    )

    const slider = screen.getByRole("slider", { name: "Zoom level" })
    expect(slider).toHaveValue("1")
    expect(slider).toHaveAttribute("aria-valuetext", "100%")

    fireEvent.change(slider, { target: { value: "1.5" } })
    expect(onZoomChange).toHaveBeenCalledWith(1.5)
    expect(slider).toHaveAttribute("aria-valuetext", "150%")
  })

  it("rotates image clockwise and counter-clockwise with buttons and keyboard", async () => {
    const user = userEvent.setup()
    const onRotationChange = vi.fn()

    render(
      <ImageCropper
        src={sampleSrc}
        defaultRotation={0}
        onRotationChange={onRotationChange}
      />
    )

    const rotateCw = screen.getByRole("button", { name: "Rotate clockwise" })
    await user.click(rotateCw)
    expect(onRotationChange).toHaveBeenCalledWith(90)

    const rotateCcw = screen.getByRole("button", {
      name: "Rotate counter-clockwise",
    })
    await user.click(rotateCcw)
    expect(onRotationChange).toHaveBeenCalledWith(0)

    const region = screen.getByRole("region", { name: "Image cropper" })
    region.focus()
    await user.keyboard("r")
    expect(onRotationChange).toHaveBeenCalledWith(90)
  })

  it("handles keyboard panning with 10x multiplier on Shift key", async () => {
    const user = userEvent.setup()
    const onCropChange = vi.fn()

    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={2}
        onCropChange={onCropChange}
      />
    )

    const region = screen.getByRole("region", { name: "Image cropper" })
    region.focus()

    await user.keyboard("{ArrowRight}")
    expect(onCropChange).toHaveBeenCalledWith(expect.objectContaining({ x: 5 }))

    await user.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(onCropChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 55 })
    )
  })

  it("handles keyboard zoom shortcuts (+, -, [, ])", async () => {
    const user = userEvent.setup()
    const onZoomChange = vi.fn()

    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={1.5}
        onZoomChange={onZoomChange}
      />
    )

    const region = screen.getByRole("region", { name: "Image cropper" })
    region.focus()

    await user.keyboard("+")
    expect(onZoomChange).toHaveBeenCalledWith(1.6)

    fireEvent.keyDown(region, { key: "[" })
    expect(onZoomChange).toHaveBeenCalledWith(1.5)

    fireEvent.keyDown(region, { key: "]" })
    expect(onZoomChange).toHaveBeenCalledWith(1.6)

    await user.keyboard("-")
    expect(onZoomChange).toHaveBeenCalledWith(1.5)
  })

  it("re-clamps crop when zooming out after panning", async () => {
    const onCropChange = vi.fn()

    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={2}
        onCropChange={onCropChange}
      />
    )

    const img = screen.getByAltText("Source preview")
    Object.defineProperty(img, "naturalWidth", {
      value: 400,
      configurable: true,
    })
    Object.defineProperty(img, "naturalHeight", {
      value: 400,
      configurable: true,
    })
    fireEvent.load(img)

    // Pan right while zoomed in
    const region = screen.getByRole("region", { name: "Image cropper" })
    region.focus()
    fireEvent.keyDown(region, { key: "ArrowRight", shiftKey: true })

    expect(onCropChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 50 })
    )

    // Now zoom back out to 1 using slider
    const slider = screen.getByRole("slider", { name: "Zoom level" })
    fireEvent.change(slider, { target: { value: "1" } })

    // At zoom 1 with 1:1 aspect, maxPanX is 0, so crop must be clamped back to 0
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0, y: 0 })
  })

  it("does not call onCropComplete on mount, only on Apply button click or Enter key", async () => {
    const user = userEvent.setup()
    const onCropComplete = vi.fn()

    render(<ImageCropper src={sampleSrc} onCropComplete={onCropComplete} />)

    const img = screen.getByAltText("Source preview")
    Object.defineProperty(img, "naturalWidth", {
      value: 200,
      configurable: true,
    })
    Object.defineProperty(img, "naturalHeight", {
      value: 200,
      configurable: true,
    })
    fireEvent.load(img)

    // Verify it did NOT auto-trigger on mount or load
    expect(onCropComplete).not.toHaveBeenCalled()

    const applyButton = screen.getByRole("button", { name: "Apply" })
    await user.click(applyButton)

    await waitFor(() => {
      expect(onCropComplete).toHaveBeenCalledTimes(1)
      expect(onCropComplete).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number),
        })
      )
    })

    // Test Enter key triggers commitCrop
    const region = screen.getByRole("region", { name: "Image cropper" })
    region.focus()
    await user.keyboard("{Enter}")

    await waitFor(() => {
      expect(onCropComplete).toHaveBeenCalledTimes(2)
    })
  })

  it("handles image load failure by calling onCropError", () => {
    const onCropError = vi.fn()
    render(<ImageCropper src="invalid-url" onCropError={onCropError} />)

    const img = screen.getByAltText("Source preview")
    fireEvent.error(img)

    expect(onCropError).toHaveBeenCalledWith(expect.any(Error))
  })

  it("leaves browser shortcuts alone when a modifier key is held", () => {
    const onZoomChange = vi.fn()
    const onRotationChange = vi.fn()
    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={1.5}
        onZoomChange={onZoomChange}
        onRotationChange={onRotationChange}
      />
    )

    const region = screen.getByRole("region", { name: "Image cropper" })
    const reload = fireEvent.keyDown(region, { key: "r", metaKey: true })
    const zoomOut = fireEvent.keyDown(region, { key: "-", ctrlKey: true })

    expect(reload).toBe(true)
    expect(zoomOut).toBe(true)
    expect(onRotationChange).not.toHaveBeenCalled()
    expect(onZoomChange).not.toHaveBeenCalled()
  })

  it("scales wheel zoom with the delta and scrolls the page at the limit", () => {
    const onZoomChange = vi.fn()
    render(<ImageCropper src={sampleSrc} onZoomChange={onZoomChange} />)

    const region = screen.getByRole("region", { name: "Image cropper" })

    expect(fireEvent.wheel(region, { deltaY: 100 })).toBe(true)
    expect(onZoomChange).not.toHaveBeenCalled()

    expect(fireEvent.wheel(region, { deltaY: -10 })).toBe(false)
    expect(onZoomChange).toHaveBeenLastCalledWith(1.02)
  })

  it("keeps the framed point centered while zooming", () => {
    const onCropChange = vi.fn()
    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={2}
        defaultCrop={{ x: 40, y: 0 }}
        onCropChange={onCropChange}
      />
    )

    const slider = screen.getByRole("slider", { name: "Zoom level" })
    fireEvent.change(slider, { target: { value: "3" } })

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 60, y: 0 })
  })

  it("hides the image until it loads and enables Apply afterwards", () => {
    render(<ImageCropper src={sampleSrc} />)

    const img = screen.getByAltText("Source preview")
    const applyButton = screen.getByRole("button", { name: "Apply" })
    expect(img).toHaveClass("invisible")
    expect(applyButton).toBeDisabled()

    Object.defineProperty(img, "naturalWidth", {
      value: 200,
      configurable: true,
    })
    Object.defineProperty(img, "naturalHeight", {
      value: 200,
      configurable: true,
    })
    fireEvent.load(img)

    expect(img).not.toHaveClass("invisible")
    expect(applyButton).toBeEnabled()
  })

  it("keeps proportions for an image that loaded before hydration", () => {
    const proto = HTMLImageElement.prototype
    const complete = vi.spyOn(proto, "complete", "get").mockReturnValue(true)
    const width = vi.spyOn(proto, "naturalWidth", "get").mockReturnValue(600)
    const height = vi.spyOn(proto, "naturalHeight", "get").mockReturnValue(900)

    render(<ImageCropper src={sampleSrc} aspect={4 / 3} />)

    const img = screen.getByAltText("Source preview")
    expect(img).not.toHaveClass("invisible")
    expect(
      parseFloat(img.style.height) / parseFloat(img.style.width)
    ).toBeCloseTo(1.5, 1)

    complete.mockRestore()
    width.mockRestore()
    height.mockRestore()
  })

  it("shows a message when the image fails to load", () => {
    render(<ImageCropper src="invalid-url" />)

    fireEvent.error(screen.getByAltText("Source preview"))

    expect(screen.getByText("Couldn't load this image")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled()
  })

  it("restores the default zoom, rotation and crop on reset", async () => {
    const user = userEvent.setup()
    const onZoomChange = vi.fn()
    const onRotationChange = vi.fn()
    const onCropChange = vi.fn()
    render(
      <ImageCropper
        src={sampleSrc}
        defaultZoom={2}
        defaultRotation={90}
        defaultCrop={{ x: 10, y: 0 }}
        onZoomChange={onZoomChange}
        onRotationChange={onRotationChange}
        onCropChange={onCropChange}
      />
    )

    fireEvent.change(screen.getByRole("slider", { name: "Zoom level" }), {
      target: { value: "3" },
    })
    await user.click(screen.getByRole("button", { name: "Rotate clockwise" }))
    await user.click(screen.getByRole("button", { name: "Reset crop" }))

    expect(onZoomChange).toHaveBeenLastCalledWith(2)
    expect(onRotationChange).toHaveBeenLastCalledWith(90)
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 10, y: 0 })
  })

  it("disables interaction when disabled is true", () => {
    render(<ImageCropper src={sampleSrc} disabled />)

    const slider = screen.getByRole("slider", { name: "Zoom level" })
    expect(slider).toBeDisabled()

    const applyButton = screen.getByRole("button", { name: "Apply" })
    expect(applyButton).toBeDisabled()

    const region = screen.getByRole("region", { name: "Image cropper" })
    expect(region).toHaveAttribute("tabindex", "-1")
  })
})
