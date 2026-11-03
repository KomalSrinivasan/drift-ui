import { TimezonePickerLimitedListPreview } from "@/components/preview/examples/timezone-picker/limited-list"
import { TimezonePickerLocalZonePreview } from "@/components/preview/examples/timezone-picker/local-zone"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "local-zone",
    title: "Start from the user's zone",
    description:
      "Read Intl.DateTimeFormat().resolvedOptions().timeZone on the client and pass it as value. The server cannot know the visitor's zone, so it renders the placeholder.",
    Preview: TimezonePickerLocalZonePreview,
  },
  {
    id: "limited-list",
    title: "A short list",
    description:
      "timeZones limits the list to the IANA names you pass, still sorted by UTC offset.",
    Preview: TimezonePickerLimitedListPreview,
  },
]
