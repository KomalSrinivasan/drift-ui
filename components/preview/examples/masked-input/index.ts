import { MaskedInputCardPreview } from "@/components/preview/examples/masked-input/card"
import { MaskedInputCurrencyPreview } from "@/components/preview/examples/masked-input/currency"
import { MaskedInputPhonePreview } from "@/components/preview/examples/masked-input/phone"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "card",
    title: "Card formatting",
    description:
      "Formats credit card and expiration inputs into standardized patterns.",
    Preview: MaskedInputCardPreview,
  },
  {
    id: "currency",
    title: "Currency formatting",
    description:
      "Localized currencies format symbols and decimal separators automatically while storing integer cents.",
    Preview: MaskedInputCurrencyPreview,
  },
  {
    id: "phone",
    title: "Phone numbers",
    description:
      "Fixed patterns guide users into typing phone numbers in familiar formats.",
    Preview: MaskedInputPhonePreview,
  },
]
