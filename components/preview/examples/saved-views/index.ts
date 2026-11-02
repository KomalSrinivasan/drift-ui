import { SavedViewsControlledPreview } from "@/components/preview/examples/saved-views/controlled"
import { SavedViewsSelectVariantPreview } from "@/components/preview/examples/saved-views/select-variant"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "controlled",
    title: "Controlled views",
    description:
      "Manage views and activeId with React state to synchronize view selection with URL query parameters or backend storage.",
    Preview: SavedViewsControlledPreview,
  },
  {
    id: "select-variant",
    title: "Select dropdown variant",
    description:
      "variant='select' provides a compact dropdown trigger for toolbars with limited horizontal space.",
    Preview: SavedViewsSelectVariantPreview,
  },
]
