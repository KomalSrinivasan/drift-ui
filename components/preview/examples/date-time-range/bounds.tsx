"use client"

import * as React from "react"

import { DateTimeRangePicker } from "@/registry/default/ui/date-time-range"
import { Label } from "@/registry/default/ui/label"

function bookableWindow(now: Date) {
  const min = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  min.setMinutes(60, 0, 0)
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14)
  max.setHours(18, 0, 0, 0)
  return { min, max }
}

export function DateTimeRangeBoundsPreview() {
  const [{ min, max }] = React.useState(() => bookableWindow(new Date()))

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="range-bounds">Room booking</Label>
      <DateTimeRangePicker
        id="range-bounds"
        min={min}
        max={max}
        numberOfMonths={1}
        placeholder="Pick a booking"
      />
    </div>
  )
}
