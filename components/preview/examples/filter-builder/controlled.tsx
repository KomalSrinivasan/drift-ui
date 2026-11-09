"use client"

import * as React from "react"

import type { Filter, FilterField } from "@/registry/default/lib/filter"
import { FilterBuilder } from "@/registry/default/ui/filter-builder"

const FIELDS: FilterField[] = [
  { id: "title", label: "Title", type: "text" },
  { id: "points", label: "Points", type: "number" },
]

export function FilterBuilderControlledPreview() {
  const [filters, setFilters] = React.useState<Filter[]>([])

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <FilterBuilder
        fields={FIELDS}
        value={filters}
        onValueChange={setFilters}
        allowGroups={false}
      />
      <pre className="overflow-x-auto rounded-md border p-3 font-mono text-xs text-muted-foreground">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  )
}
