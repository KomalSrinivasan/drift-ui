"use client"

import * as React from "react"

import { ImageCropper } from "@/registry/default/ui/image-cropper"

export function ImageCropperAvatarPreview() {
  return (
    <div className="w-full max-w-sm">
      <ImageCropper
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80"
        aspect={1}
        cropShape="round"
        aria-label="Avatar image cropper"
      />
    </div>
  )
}
