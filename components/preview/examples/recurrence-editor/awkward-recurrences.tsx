"use client"

import * as React from "react"

import { RecurrenceEditor } from "@/registry/default/ui/recurrence-editor"

const START = new Date(2026, 10, 3, 10, 0)

export function RecurrenceEditorAwkwardPreview() {
  const [rule, setRule] = React.useState("FREQ=MONTHLY;BYDAY=5TU")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <RecurrenceEditor
        aria-label="Repeat"
        value={rule}
        onValueChange={setRule}
        start={START}
        showPreview={3}
      />
      <p className="text-xs text-muted-foreground">
        Months with only 4 Tuesdays (like November 2026) are automatically
        skipped; the next occurrence is December 29, 2026.
      </p>
    </div>
  )
}
