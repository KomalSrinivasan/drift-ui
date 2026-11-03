import type { ReactNode } from "react"

export type FilterFieldType = "text" | "number" | "select" | "date"

export type FilterOperator =
  | "contains"
  | "not-contains"
  | "is"
  | "is-not"
  | "eq"
  | "gt"
  | "lt"
  | "before"
  | "after"
  | "between"
  | "is-any-of"
  | "is-none-of"

export type FilterField = {
  id: string
  label: string
  type: FilterFieldType
  options?: { value: string; label: string }[]
  icon?: ReactNode
}

export type Filter = {
  id: string
  fieldId: string
  operator: FilterOperator
  value: string | string[]
}

export type FilterConjunction = "and" | "or"

export type FilterGroup = {
  id: string
  conjunction: FilterConjunction
  filters: (Filter | FilterGroup)[]
}

export type FilterItem = Filter | FilterGroup

export function isFilterGroup(item: unknown): item is FilterGroup {
  return Boolean(
    item &&
    typeof item === "object" &&
    "conjunction" in item &&
    Array.isArray((item as FilterGroup).filters)
  )
}

export function toFilterGroup(
  value: Filter[] | FilterGroup,
  defaultConjunction: FilterConjunction = "and"
): FilterGroup {
  if (isFilterGroup(value)) return value
  return {
    id: "root",
    conjunction: defaultConjunction,
    filters: value,
  }
}

export function flattenFilters(value: Filter[] | FilterGroup): Filter[] {
  if (Array.isArray(value)) return value
  const result: Filter[] = []
  function walk(group: FilterGroup) {
    for (const item of group.filters) {
      if (isFilterGroup(item)) {
        walk(item)
      } else {
        result.push(item)
      }
    }
  }
  walk(value)
  return result
}

const OPERATORS_BY_TYPE: Record<FilterFieldType, FilterOperator[]> = {
  text: ["contains", "not-contains", "is", "is-not"],
  number: ["eq", "gt", "lt"],
  select: ["is", "is-not", "is-any-of", "is-none-of"],
  date: ["before", "after", "between"],
}

const OPERATOR_LABEL: Record<FilterOperator, string> = {
  contains: "contains",
  "not-contains": "does not contain",
  is: "is",
  "is-not": "is not",
  eq: "=",
  gt: ">",
  lt: "<",
  before: "before",
  after: "after",
  between: "between",
  "is-any-of": "is any of",
  "is-none-of": "is none of",
}

export function operatorsFor(type: FilterFieldType): FilterOperator[] {
  return OPERATORS_BY_TYPE[type] ?? []
}

export function operatorLabel(operator: FilterOperator): string {
  return OPERATOR_LABEL[operator] ?? operator
}

function generateId(): string {
  return Math.random().toString(36).slice(2)
}

export function createFilter(field: FilterField): Filter {
  return {
    id: generateId(),
    fieldId: field.id,
    operator: OPERATORS_BY_TYPE[field.type][0],
    value: "",
  }
}

export function createFilterGroup(
  conjunction: FilterConjunction = "and"
): FilterGroup {
  return {
    id: generateId(),
    conjunction,
    filters: [],
  }
}

function parseDateBoundary(val: unknown, endOfDay = false): number | null {
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null
    if (endOfDay) {
      return new Date(
        val.getFullYear(),
        val.getMonth(),
        val.getDate(),
        23,
        59,
        59,
        999
      ).getTime()
    }
    return val.getTime()
  }

  if (typeof val === "number") {
    return isNaN(val) ? null : val
  }

  if (typeof val === "string" && val.trim()) {
    const trimmed = val.trim()
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    if (dateMatch) {
      const year = Number(dateMatch[1])
      const month = Number(dateMatch[2]) - 1
      const day = Number(dateMatch[3])
      if (endOfDay) {
        return new Date(year, month, day, 23, 59, 59, 999).getTime()
      }
      return new Date(year, month, day, 0, 0, 0, 0).getTime()
    }
    const parsed = Date.parse(trimmed)
    if (!isNaN(parsed)) {
      if (endOfDay) {
        const d = new Date(parsed)
        return new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
          23,
          59,
          59,
          999
        ).getTime()
      }
      return parsed
    }
  }

  return null
}

function toNormalizedList(val: string | string[]): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
  }
  return String(val)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function matchesFilter(fieldValue: unknown, filter: Filter): boolean {
  const isFilterEmpty =
    filter.value === "" ||
    (Array.isArray(filter.value) && filter.value.length === 0)

  if (isFilterEmpty) return true

  // Handle null or undefined field value
  if (fieldValue == null) {
    return (
      filter.operator === "not-contains" ||
      filter.operator === "is-not" ||
      filter.operator === "is-none-of"
    )
  }

  // Date operators
  if (
    filter.operator === "before" ||
    filter.operator === "after" ||
    filter.operator === "between"
  ) {
    const fieldTime = parseDateBoundary(fieldValue, false)
    if (fieldTime === null) return false

    if (filter.operator === "before") {
      const targetTime = parseDateBoundary(
        Array.isArray(filter.value) ? filter.value[0] : filter.value,
        false
      )
      if (targetTime === null) return true
      return fieldTime < targetTime
    }

    if (filter.operator === "after") {
      const targetTime = parseDateBoundary(
        Array.isArray(filter.value) ? filter.value[0] : filter.value,
        true
      )
      if (targetTime === null) return true
      return fieldTime > targetTime
    }

    if (filter.operator === "between") {
      const range = Array.isArray(filter.value)
        ? filter.value
        : String(filter.value).split("..")
      const fromTime = parseDateBoundary(range[0], false)
      const toTime = parseDateBoundary(range[1] ?? range[0], true)
      if (fromTime === null || toTime === null) return true
      return fieldTime >= fromTime && fieldTime <= toTime
    }
  }

  // Multi-select operators
  if (filter.operator === "is-any-of" || filter.operator === "is-none-of") {
    const filterItems = toNormalizedList(filter.value)
    if (filterItems.length === 0) return true

    const rowItems = Array.isArray(fieldValue)
      ? fieldValue.map((v) => String(v).trim().toLowerCase())
      : [String(fieldValue).trim().toLowerCase()]

    const hasOverlap = rowItems.some((item) => filterItems.includes(item))
    return filter.operator === "is-any-of" ? hasOverlap : !hasOverlap
  }

  // Number operators
  if (
    filter.operator === "eq" ||
    filter.operator === "gt" ||
    filter.operator === "lt"
  ) {
    const numericField = Number(fieldValue)
    const numericFilter = Number(
      Array.isArray(filter.value) ? filter.value[0] : filter.value
    )
    if (isNaN(numericField) || isNaN(numericFilter)) return false

    switch (filter.operator) {
      case "eq":
        return numericField === numericFilter
      case "gt":
        return numericField > numericFilter
      case "lt":
        return numericField < numericFilter
    }
  }

  // Text operators (and fallback)
  const text = String(fieldValue).toLowerCase()
  const needle = Array.isArray(filter.value)
    ? filter.value.join(" ").toLowerCase()
    : filter.value.toLowerCase()

  switch (filter.operator) {
    case "contains":
      return text.includes(needle)
    case "not-contains":
      return !text.includes(needle)
    case "is":
      return text === needle
    case "is-not":
      return text !== needle
    default:
      return false
  }
}

export function matchesFilterGroup(
  item: Record<string, unknown>,
  group: FilterGroup
): boolean {
  if (group.filters.length === 0) return true

  if (group.conjunction === "or") {
    return group.filters.some((child) =>
      isFilterGroup(child)
        ? matchesFilterGroup(item, child)
        : matchesFilter(item[child.fieldId], child)
    )
  }

  return group.filters.every((child) =>
    isFilterGroup(child)
      ? matchesFilterGroup(item, child)
      : matchesFilter(item[child.fieldId], child)
  )
}

export function matchesFilters(
  item: Record<string, unknown>,
  filters: Filter[] | FilterGroup
): boolean {
  if (isFilterGroup(filters)) {
    return matchesFilterGroup(item, filters)
  }
  return filters.every((filter) => matchesFilter(item[filter.fieldId], filter))
}

function serializeValue(filter: Filter): string {
  if (Array.isArray(filter.value)) {
    if (filter.operator === "between") {
      return filter.value.map(encodeURIComponent).join("..")
    }
    return filter.value.map(encodeURIComponent).join("|")
  }
  return encodeURIComponent(filter.value)
}

function serializeItem(item: FilterItem): string {
  if (isFilterGroup(item)) {
    return serializeGroup(item)
  }
  return `${encodeURIComponent(item.fieldId)}:${item.operator}:${serializeValue(item)}`
}

function serializeGroup(group: FilterGroup): string {
  const children = group.filters.map(serializeItem).join(",")
  return `${group.conjunction}(${children})`
}

export function serializeFilters(filters: Filter[] | FilterGroup): string {
  if (isFilterGroup(filters)) {
    if (filters.filters.length === 0) return ""
    return serializeGroup(filters)
  }

  if (filters.length === 0) return ""
  return filters.map(serializeItem).join(",")
}

function splitTopLevel(input: string, delimiter = ","): string[] {
  const parts: string[] = []
  let current = ""
  let depth = 0

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (char === "(") {
      depth++
      current += char
    } else if (char === ")") {
      depth = Math.max(0, depth - 1)
      current += char
    } else if (char === delimiter && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  if (current.trim()) {
    parts.push(current.trim())
  }

  return parts
}

function parseItem(itemStr: string): FilterItem | null {
  const trimmed = itemStr.trim()
  if (!trimmed) return null

  // Check for group: and(...) or or(...)
  const groupMatch = /^(and|or)\(([\s\S]*)\)$/.exec(trimmed)
  if (groupMatch) {
    const conjunction = groupMatch[1] as FilterConjunction
    const inner = groupMatch[2]
    const children = splitTopLevel(inner)
      .map(parseItem)
      .filter((item): item is FilterItem => item !== null)
    return {
      id: generateId(),
      conjunction,
      filters: children,
    }
  }

  // Single filter: fieldId:operator:value
  const firstColon = trimmed.indexOf(":")
  if (firstColon === -1) return null
  const secondColon = trimmed.indexOf(":", firstColon + 1)

  let fieldId: string
  let operator: FilterOperator
  let rawValue: string

  if (secondColon === -1) {
    fieldId = decodeURIComponent(trimmed.slice(0, firstColon))
    operator = "is"
    rawValue = trimmed.slice(firstColon + 1)
  } else {
    fieldId = decodeURIComponent(trimmed.slice(0, firstColon))
    operator = trimmed.slice(firstColon + 1, secondColon) as FilterOperator
    rawValue = trimmed.slice(secondColon + 1)
  }

  let value: string | string[]
  if (operator === "between" && rawValue.includes("..")) {
    value = rawValue.split("..").map((v) => decodeURIComponent(v))
  } else if (
    (operator === "is-any-of" || operator === "is-none-of") &&
    rawValue.includes("|")
  ) {
    value = rawValue.split("|").map((v) => decodeURIComponent(v))
  } else {
    value = decodeURIComponent(rawValue)
  }

  return {
    id: generateId(),
    fieldId,
    operator,
    value,
  }
}

export function parseFilters(
  query: string,
  options?: { asGroup?: boolean }
): Filter[] | FilterGroup {
  if (!query || !query.trim()) {
    return options?.asGroup ? createFilterGroup("and") : []
  }

  let raw = query.trim()
  // Handle URL query string (?filters=... or filters=...)
  if (raw.startsWith("?") || raw.includes("filters=")) {
    try {
      const search = raw.startsWith("?") ? raw.slice(1) : raw
      const params = new URLSearchParams(search)
      const found = params.get("filters") ?? params.get("filter")
      if (found) raw = found.trim()
    } catch {
      // ignore URLSearchParams parse errors and continue with raw
    }
  }

  // Handle JSON fallback
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsedJson = JSON.parse(raw)
      if (isFilterGroup(parsedJson)) {
        return parsedJson
      }
      if (Array.isArray(parsedJson)) {
        return options?.asGroup ? toFilterGroup(parsedJson) : parsedJson
      }
    } catch {
      // Continue to DSL parsing
    }
  }

  // Check if root is a group
  const groupMatch = /^(and|or)\(([\s\S]*)\)$/.exec(raw)
  if (groupMatch) {
    const parsed = parseItem(raw)
    if (parsed && isFilterGroup(parsed)) {
      return parsed
    }
  }

  const items = splitTopLevel(raw)
    .map(parseItem)
    .filter((item): item is FilterItem => item !== null)

  const hasNestedGroups = items.some(isFilterGroup)
  if (hasNestedGroups || options?.asGroup) {
    return {
      id: generateId(),
      conjunction: "and",
      filters: items,
    }
  }

  return items as Filter[]
}
