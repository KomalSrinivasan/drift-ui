import { describe, expect, it } from "vitest"

import { COMPONENT_API } from "@/lib/agent-docs/component-api"
import { COMPONENT_USAGE } from "@/lib/agent-docs/component-usage"
import { CATALOG, CATEGORIES } from "@/lib/catalog"
import { COMPONENT_KEYBOARD } from "@/lib/component-keyboard"
import registry from "@/registry.json"

const LISTS: [string, string[]][] = [
  ["registry.json", registry.items.map((item) => item.name)],
  ["COMPONENT_API", Object.keys(COMPONENT_API)],
  ["COMPONENT_USAGE", Object.keys(COMPONENT_USAGE)],
  ["COMPONENT_KEYBOARD", Object.keys(COMPONENT_KEYBOARD)],
  ...CATEGORIES.map(({ id }): [string, string[]] => [
    `catalog category ${id}`,
    CATALOG.filter((entry) => entry.category === id).map((entry) => entry.slug),
  ]),
]

describe("shared component lists", () => {
  it.each(LISTS)("%s is in alphabetical order", (_, names) => {
    expect(names).toEqual([...names].sort())
  })
})
