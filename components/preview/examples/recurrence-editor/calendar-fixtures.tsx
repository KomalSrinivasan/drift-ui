"use client"

import * as React from "react"

import { RecurrenceEditor } from "@/registry/default/ui/recurrence-editor"

const START = new Date(2026, 10, 2, 9, 0)

export function RecurrenceEditorCalendarFixturesPreview() {
  const [rule, setRule] = React.useState(
    "FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1;WKST=SU"
  )

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <RecurrenceEditor
        aria-label="Repeat"
        value={rule}
        onValueChange={setRule}
        start={START}
        showPreview={3}
      />
      <div className="rounded-md border bg-muted/40 p-2 font-mono text-xs break-all text-muted-foreground">
        {rule}
      </div>
    </div>
  )
}
