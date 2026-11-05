import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { CATALOG, CATEGORIES } from "@/lib/catalog"

const README = readFileSync("README.md", "utf8")

describe("README component table", () => {
  it("states the catalog size", () => {
    expect(README).toContain(`${CATALOG.length} components`)
  })

  it.each(CATEGORIES.map(({ id, label }) => [label, id]))(
    "lists every %s component in catalog order",
    (label, id) => {
      const links = CATALOG.filter((entry) => entry.category === id)
        .map(
          (entry) =>
            `[${entry.name}](https://drift-ui.dev/components/${entry.slug})`
        )
        .join(", ")
      const row = README.split("\n").find((line) =>
        line.startsWith(`| ${label} `)
      )
      expect(row?.split("|")[2]?.trim()).toBe(links)
    }
  )
})
