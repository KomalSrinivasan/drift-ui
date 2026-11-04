"use client"

import * as React from "react"
import { CircleDotIcon, FlagIcon, HashIcon, TextIcon } from "lucide-react"

import {
  matchesFilter,
  type Filter,
  type FilterField,
} from "@/registry/default/lib/filter"
import { Badge } from "@/registry/default/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/default/ui/card"
import { FilterBuilder } from "@/registry/default/ui/filter-builder"

const FIELDS: FilterField[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    icon: <CircleDotIcon />,
    options: [
      { value: "open", label: "Open" },
      { value: "in-review", label: "In review" },
      { value: "closed", label: "Closed" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    type: "select",
    icon: <FlagIcon />,
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "low", label: "Low" },
    ],
  },
  { id: "title", label: "Title", type: "text", icon: <TextIcon /> },
  { id: "points", label: "Points", type: "number", icon: <HashIcon /> },
]

const ISSUES = [
  {
    id: "LED-104",
    title: "Invoice totals round twice",
    status: "open",
    priority: "urgent",
    points: 3,
  },
  {
    id: "LED-112",
    title: "Chart contrast in dark mode",
    status: "in-review",
    priority: "low",
    points: 2,
  },
  {
    id: "LED-118",
    title: "Invoice PDF missing logo",
    status: "closed",
    priority: "high",
    points: 1,
  },
  {
    id: "LED-121",
    title: "Retry failed webhook deliveries",
    status: "open",
    priority: "high",
    points: 5,
  },
  {
    id: "LED-127",
    title: "Seat count ignores guests",
    status: "open",
    priority: "low",
    points: 2,
  },
]

const DEFAULT_FILTERS: Filter[] = [
  { id: "status-open", fieldId: "status", operator: "is", value: "open" },
]

type Issue = (typeof ISSUES)[number]

function matchesAll(issue: Issue, filters: Filter[]) {
  return filters.every((filter) =>
    matchesFilter(issue[filter.fieldId as keyof Issue], filter)
  )
}

export function IssueFiltersCard() {
  const [filters, setFilters] = React.useState<Filter[]>(DEFAULT_FILTERS)
  const visibleIssues = ISSUES.filter((issue) => matchesAll(issue, filters))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
        <CardDescription>Billing squad, current cycle</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <FilterBuilder
          aria-label="Issue filters"
          fields={FIELDS}
          value={filters}
          onValueChange={setFilters}
          allowGroups={false}
        />
        <ul className="divide-y rounded-md border text-sm">
          {visibleIssues.map((issue) => (
            <li key={issue.id} className="flex items-center gap-3 px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground">
                {issue.id}
              </span>
              <span className="flex-1 truncate">{issue.title}</span>
              {issue.priority === "urgent" && (
                <Badge variant="outline" className="text-destructive">
                  Urgent
                </Badge>
              )}
              <span className="font-mono text-xs text-muted-foreground">
                {issue.points} pts
              </span>
            </li>
          ))}
          {visibleIssues.length === 0 && (
            <li className="px-3 py-6 text-center text-muted-foreground">
              No issues match these filters.
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Showing {visibleIssues.length} of {ISSUES.length} issues
      </CardFooter>
    </Card>
  )
}
