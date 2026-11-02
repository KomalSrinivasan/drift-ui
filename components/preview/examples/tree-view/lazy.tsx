"use client"

import * as React from "react"
import { FileIcon, FolderIcon } from "lucide-react"

import { TreeView, type TreeNode } from "@/registry/default/ui/tree-view"

const SIMULATED_FETCH_MS = 900

const FILES: Record<string, string[]> = {
  logs: ["api.log", "worker.log"],
  backups: ["2026-10-31.tar.gz", "2026-11-01.tar.gz"],
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function TreeViewLazyPreview() {
  const [loaded, setLoaded] = React.useState<Record<string, TreeNode[]>>({})
  const attempts = React.useRef(new Set<string>())

  async function loadChildren(node: TreeNode) {
    await wait(SIMULATED_FETCH_MS)
    if (node.id === "backups" && !attempts.current.has(node.id)) {
      attempts.current.add(node.id)
      throw new Error("Backup server timed out")
    }
    setLoaded((current) => ({
      ...current,
      [node.id]: FILES[node.id].map((name) => ({
        id: `${node.id}/${name}`,
        label: name,
        icon: <FileIcon />,
      })),
    }))
  }

  return (
    <TreeView
      aria-label="Server files"
      items={Object.keys(FILES).map((id) => ({
        id,
        label: id,
        icon: <FolderIcon />,
        isBranch: true,
        children: loaded[id],
      }))}
      loadChildren={loadChildren}
      className="w-full max-w-xs"
    />
  )
}
