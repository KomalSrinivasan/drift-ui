import { TreeViewControlledPreview } from "@/components/preview/examples/tree-view/controlled"
import { TreeViewDisabledPreview } from "@/components/preview/examples/tree-view/disabled"
import { TreeViewLazyPreview } from "@/components/preview/examples/tree-view/lazy"
import { TreeViewMultiplePreview } from "@/components/preview/examples/tree-view/multiple"
import { TreeViewVirtualPreview } from "@/components/preview/examples/tree-view/virtual"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "controlled",
    title: "Expand and collapse all",
    description:
      "expanded and onExpandedChange put the open branches in your hands, so buttons outside the tree can drive them.",
    Preview: TreeViewControlledPreview,
  },
  {
    id: "lazy",
    title: "Load children on demand",
    description:
      "loadChildren runs when a branch without children opens. backups fails on the first try: press ArrowRight on it or click Retry to load again.",
    Preview: TreeViewLazyPreview,
  },
  {
    id: "multiple",
    title: "Checkboxes",
    description:
      "multiple turns selection into checkboxes. Checking a folder checks everything under it, and a partly checked folder shows a dash. secrets.json is disabled, so config can never be fully checked.",
    Preview: TreeViewMultiplePreview,
  },
  {
    id: "virtual",
    title: "10,000 rows",
    description:
      "virtual renders the rows in view plus a few above and below. Give the tree a height. Expand, click a row, then press End and ArrowUp: focus follows rows that were never rendered.",
    Preview: TreeViewVirtualPreview,
  },
  {
    id: "disabled",
    title: "Disabled nodes",
    description:
      "disabled nodes stay visible but are skipped by selection and the arrow keys.",
    Preview: TreeViewDisabledPreview,
  },
]
