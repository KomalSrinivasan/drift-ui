"use client"

import * as React from "react"
import { CircleDotIcon, HashIcon, TextIcon } from "lucide-react"

import type { FilterField, FilterGroup } from "@/registry/default/lib/filter"
import { FilterBuilder } from "@/registry/default/ui/filter-builder"

const FIELDS: FilterField[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    icon: <CircleDotIcon />,
    options: [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
  },
  { id: "title", label: "Title", type: "text", icon: <TextIcon /> },
  { id: "points", label: "Points", type: "number", icon: <HashIcon /> },
]

const INITIAL_GROUPS: FilterGroup = {
  id: "root",
  conjunction: "and",
  filters: [
    { id: "1", fieldId: "status", operator: "is", value: "open" },
    {
      id: "sub",
      conjunction: "or",
      filters: [
        { id: "2", fieldId: "points", operator: "gt", value: "3" },
        { id: "3", fieldId: "title", operator: "contains", value: "urgent" },
      ],
    },
  ],
}

export function FilterBuilderGroupsPreview() {
  const [group, setGroup] = React.useState<FilterGroup>(INITIAL_GROUPS)

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <FilterBuilder fields={FIELDS} value={group} onValueChange={setGroup} />
      <pre className="overflow-x-auto rounded-md border p-3 font-mono text-xs text-muted-foreground">
        {JSON.stringify(group, null, 2)}
      </pre>
    </div>
  )
}
