"use client"

import * as React from "react"

import { Label } from "@/registry/default/ui/label"
import { TimezonePicker } from "@/registry/default/ui/timezone-picker"

export function TimezonePickerPreview() {
  const [timeZone, setTimeZone] = React.useState("Asia/Tokyo")

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="preview-timezone">Time zone</Label>
      <TimezonePicker
        id="preview-timezone"
        value={timeZone}
        onValueChange={setTimeZone}
      />
    </div>
  )
}
