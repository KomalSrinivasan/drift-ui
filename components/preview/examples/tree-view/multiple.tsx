"use client"

import * as React from "react"
import { FileIcon, FolderIcon } from "lucide-react"

import { TreeView, type TreeNode } from "@/registry/default/ui/tree-view"

const ITEMS: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: <FolderIcon />,
    children: [
      { id: "src/index", label: "index.ts", icon: <FileIcon /> },
      {
        id: "src/routes",
        label: "routes",
        icon: <FolderIcon />,
        children: [
          { id: "src/routes/users", label: "users.ts", icon: <FileIcon /> },
          { id: "src/routes/teams", label: "teams.ts", icon: <FileIcon /> },
        ],
      },
    ],
  },
  {
    id: "config",
    label: "config",
    icon: <FolderIcon />,
    children: [
      { id: "config/app", label: "app.json", icon: <FileIcon /> },
      {
        id: "config/secrets",
        label: "secrets.json",
        icon: <FileIcon />,
        disabled: true,
      },
    ],
  },
]

export function TreeViewMultiplePreview() {
  const [checked, setChecked] = React.useState(["src/routes/users"])

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <TreeView
        multiple
        aria-label="Files to commit"
        items={ITEMS}
        defaultExpanded={["src", "src/routes", "config"]}
        selected={checked}
        onSelectedChange={setChecked}
      />
      <p className="text-xs text-muted-foreground">{checked.length} checked</p>
    </div>
  )
}
