"use client"

import * as React from "react"

import { Label } from "@/registry/default/ui/label"
import { TimezonePicker } from "@/registry/default/ui/timezone-picker"

const subscribe = () => () => {}

export function TimezonePickerLocalZonePreview() {
  // The server cannot know the visitor's zone, so it renders empty and the client fills it in.
  const localZone = React.useSyncExternalStore(
    subscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => ""
  )
  const [picked, setPicked] = React.useState<string | null>(null)

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="local-timezone">Your time zone</Label>
      <TimezonePicker
        id="local-timezone"
        value={picked ?? localZone}
        onValueChange={setPicked}
      />
    </div>
  )
}
