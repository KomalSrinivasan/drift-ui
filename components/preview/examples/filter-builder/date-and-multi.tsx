"use client"

import * as React from "react"
import { CalendarIcon, CircleDotIcon, TagIcon } from "lucide-react"

import type { Filter, FilterField } from "@/registry/default/lib/filter"
import { FilterBuilder } from "@/registry/default/ui/filter-builder"

const FIELDS: FilterField[] = [
  {
    id: "priority",
    label: "Priority",
    type: "select",
    icon: <CircleDotIcon />,
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "normal", label: "Normal" },
      { value: "low", label: "Low" },
    ],
  },
  {
    id: "labels",
    label: "Labels",
    type: "select",
    icon: <TagIcon />,
    options: [
      { value: "bug", label: "Bug" },
      { value: "feature", label: "Feature" },
      { value: "docs", label: "Documentation" },
      { value: "design", label: "Design" },
    ],
  },
  {
    id: "created",
    label: "Created date",
    type: "date",
    icon: <CalendarIcon />,
  },
]

const INITIAL_FILTERS: Filter[] = [
  {
    id: "1",
    fieldId: "priority",
    operator: "is-any-of",
    value: ["urgent", "high"],
  },
  {
    id: "2",
    fieldId: "created",
    operator: "between",
    value: ["2025-01-01", "2025-03-31"],
  },
]

export function FilterBuilderDateAndMultiPreview() {
  const [filters, setFilters] = React.useState<Filter[]>(INITIAL_FILTERS)

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <FilterBuilder
        fields={FIELDS}
        value={filters}
        onValueChange={setFilters}
      />
      <pre className="overflow-x-auto rounded-md border p-3 font-mono text-xs text-muted-foreground">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  )
}
