"use client"

import * as React from "react"

import {
  DateTimeRangePicker,
  type DateTimeRangePreset,
} from "@/registry/default/ui/date-time-range"
import { Label } from "@/registry/default/ui/label"

function daysAgo(now: Date, days: number) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days)
}

function makePresets(now: Date): DateTimeRangePreset[] {
  const today = daysAgo(now, 0)
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59
  )

  return [
    { label: "Today", value: { from: today, to: endOfToday } },
    { label: "Last 7 days", value: { from: daysAgo(now, 6), to: endOfToday } },
    {
      label: "Last 30 days",
      value: { from: daysAgo(now, 29), to: endOfToday },
    },
    {
      label: "This month",
      value: {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: endOfToday,
      },
    },
  ]
}

export function DateTimeRangePresetsPreview() {
  const [presets] = React.useState(() => makePresets(new Date()))

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="range-presets">Report period</Label>
      <DateTimeRangePicker
        id="range-presets"
        presets={presets}
        placeholder="Choose a period"
      />
    </div>
  )
}
