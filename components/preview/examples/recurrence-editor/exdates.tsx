"use client"

import * as React from "react"

import { RecurrenceEditor } from "@/registry/default/ui/recurrence-editor"

const START = new Date(2026, 10, 3, 10, 0)
const EXCLUDED_DATES = [new Date(2026, 10, 10), new Date(2026, 10, 24)]

export function RecurrenceEditorExdatesPreview() {
  const [rule, setRule] = React.useState("FREQ=WEEKLY;BYDAY=TU")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <RecurrenceEditor
        aria-label="Repeat"
        value={rule}
        onValueChange={setRule}
        start={START}
        showPreview={4}
        exdates={EXCLUDED_DATES}
      />
      <p className="text-xs text-muted-foreground">
        Excluded dates: Nov 10 and Nov 24 are skipped from the occurrence
        preview.
      </p>
    </div>
  )
}
