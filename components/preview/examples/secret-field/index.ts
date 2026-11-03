import { SecretFieldRevealAllPreview } from "@/components/preview/examples/secret-field/reveal-all"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "reveal-all",
    title: "Reveal all",
    description:
      "Pass revealed and onRevealedChange to drive several fields from one button. Copy still gives the full value while a field is masked.",
    Preview: SecretFieldRevealAllPreview,
  },
]
