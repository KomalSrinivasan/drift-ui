"use client"

import * as React from "react"
import { CircleDotIcon, HashIcon, TextIcon } from "lucide-react"

import {
  parseFilters,
  serializeFilters,
  type Filter,
  type FilterField,
  type FilterGroup,
} from "@/registry/default/lib/filter"
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

export function FilterBuilderUrlStatePreview() {
  const [queryString, setQueryString] = React.useState(
    "status:is:open,points:gt:2"
  )
  const [filters, setFilters] = React.useState<Filter[] | FilterGroup>(() =>
    parseFilters("status:is:open,points:gt:2")
  )

  function handleChange(next: Filter[] | FilterGroup) {
    setFilters(next)
    setQueryString(serializeFilters(next))
  }

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value
    setQueryString(nextQuery)
    try {
      setFilters(parseFilters(nextQuery))
    } catch {
      // Keep previous valid filters while the query string is incomplete or malformed
    }
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-muted-foreground select-none">?filters=</span>
        <input
          value={queryString}
          onChange={handleQueryChange}
          placeholder="e.g. status:is:open,points:gt:2"
          aria-label="Filter query string"
          className="flex-1 rounded-md border bg-background px-2 py-1 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <FilterBuilder
        fields={FIELDS}
        value={filters}
        onValueChange={handleChange}
      />
    </div>
  )
}
