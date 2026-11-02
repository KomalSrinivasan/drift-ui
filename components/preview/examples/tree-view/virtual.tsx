"use client"

import * as React from "react"
import { FileIcon, PackageIcon } from "lucide-react"

import { Button } from "@/registry/default/ui/button"
import { TreeView, type TreeNode } from "@/registry/default/ui/tree-view"

const PACKAGES = Array.from({ length: 100 }, (_, index) => `package-${index}`)

const ITEMS: TreeNode[] = PACKAGES.map((name) => ({
  id: name,
  label: name,
  icon: <PackageIcon />,
  children: Array.from({ length: 99 }, (_, index) => ({
    id: `${name}/${index}`,
    label: `module-${index}.ts`,
    icon: <FileIcon />,
  })),
}))

export function TreeViewVirtualPreview() {
  const [expanded, setExpanded] = React.useState<string[]>([])

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(PACKAGES)}
        >
          Expand 10,000 rows
        </Button>
        <Button variant="outline" size="sm" onClick={() => setExpanded([])}>
          Collapse all
        </Button>
      </div>
      <TreeView
        virtual
        aria-label="Monorepo"
        items={ITEMS}
        expanded={expanded}
        onExpandedChange={setExpanded}
        className="h-80 rounded-md border"
      />
    </div>
  )
}
