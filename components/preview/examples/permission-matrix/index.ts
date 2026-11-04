import { PermissionMatrixControlledPreview } from "@/components/preview/examples/permission-matrix/controlled"
import { PermissionMatrixReadOnlyPreview } from "@/components/preview/examples/permission-matrix/read-only"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "controlled",
    title: "Controlled matrix with save action",
    description:
      "Manage external state to provide Save and Discard actions when access control policies change.",
    Preview: PermissionMatrixControlledPreview,
  },
  {
    id: "read-only",
    title: "Read-only access overview",
    description:
      "Display fixed permissions for compliance audits without interactive checkboxes.",
    Preview: PermissionMatrixReadOnlyPreview,
  },
]
