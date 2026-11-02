"use client"

import * as React from "react"

import { ImageCropper } from "@/registry/default/ui/image-cropper"

export function ImageCropperLandscapePreview() {
  return (
    <div className="w-full max-w-sm">
      <ImageCropper
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80"
        aspect={4 / 3}
        aria-label="Landscape photo cropper"
      />
    </div>
  )
}
