import { UptimeBarCompactPreview } from "@/components/preview/examples/uptime-bar/compact"
import { UptimeBarLegendPreview } from "@/components/preview/examples/uptime-bar/legend"
import type { ComponentExample } from "@/lib/component-docs"

export const examples: ComponentExample[] = [
  {
    id: "compact",
    title: "Multi-service compact view",
    description:
      "Stack multiple uptime bars with custom range labels to build service overview boards.",
    Preview: UptimeBarCompactPreview,
  },
  {
    id: "legend",
    title: "Status legend",
    description:
      "Pair UptimeBar with UptimeBarLegend to provide a clear key for operational, degraded, downtime, and no-data states.",
    Preview: UptimeBarLegendPreview,
  },
]
