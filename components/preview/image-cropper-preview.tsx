"use client"

import * as React from "react"

import {
  ImageCropper,
  type PixelCrop,
} from "@/registry/default/ui/image-cropper"

export function ImageCropperPreview() {
  const [cropped, setCropped] = React.useState<{
    url: string
    pixelCrop: PixelCrop
  } | null>(null)
  const prevUrlRef = React.useRef<string | null>(null)

  const handleCropComplete = React.useCallback(
    (blob: Blob, pixelCrop: PixelCrop) => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
      }
      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url
      setCropped({ url, pixelCrop })
    },
    []
  )

  React.useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
      }
    }
  }, [])

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ImageCropper
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80"
        aspect={1}
        onCropComplete={handleCropComplete}
      />
      {cropped && (
        <div className="flex items-center gap-3 rounded-md border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cropped.url}
            alt="Cropped output"
            className="size-12 rounded-sm border object-cover"
          />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Crop ready</p>
            <p>
              {cropped.pixelCrop.width} × {cropped.pixelCrop.height} px blob
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
