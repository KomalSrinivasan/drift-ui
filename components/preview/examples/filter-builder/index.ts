import { FilterBuilderControlledPreview } from "@/components/preview/examples/filter-builder/controlled"
import { FilterBuilderDateAndMultiPreview } from "@/components/preview/examples/filter-builder/date-and-multi"
import { FilterBuilderDefaultFiltersPreview } from "@/components/preview/examples/filter-builder/default-filters"
import { FilterBuilderGroupsPreview } from "@/components/preview/examples/filter-builder/groups"
import { FilterBuilderUrlStatePreview } from "@/components/preview/examples/filter-builder/url-state"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "default-filters",
    title: "Starting filters",
    description:
      "defaultValue opens with filters applied, for saved views. Each filter is { id, fieldId, operator, value }.",
    Preview: FilterBuilderDefaultFiltersPreview,
  },
  {
    id: "controlled",
    title: "Controlled",
    description:
      "value and onValueChange give you the filters as data to store in the URL or send to an API.",
    Preview: FilterBuilderControlledPreview,
  },
  {
    id: "groups",
    title: "Nested AND/OR groups",
    description:
      "FilterGroup supports nested groups of conditions with conjunction switching between AND and OR.",
    Preview: FilterBuilderGroupsPreview,
  },
  {
    id: "date-and-multi",
    title: "Date ranges and multi-select",
    description:
      "Date fields support before, after, and between using Calendar. Select fields support is any of and is none of.",
    Preview: FilterBuilderDateAndMultiPreview,
  },
  {
    id: "url-state",
    title: "URL serialization",
    description:
      "serializeFilters and parseFilters provide human-readable, URL-safe round-tripping for search parameters.",
    Preview: FilterBuilderUrlStatePreview,
  },
]
