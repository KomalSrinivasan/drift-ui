"use client"

import * as React from "react"

import { Button } from "@/registry/default/ui/button"
import { SecretField } from "@/registry/default/ui/secret-field"

const KEYS = [
  {
    id: "publishable",
    label: "Publishable key",
    value: "pk_live_51Mz8Qk2xP9f3c",
  },
  { id: "secret", label: "Secret key", value: "sk_live_51Mz8Qk2xPa1b2" },
  { id: "webhook", label: "Webhook secret", value: "whsec_7Hq2Lm0dE4n8" },
]

export function SecretFieldRevealAllPreview() {
  const [revealed, setRevealed] = React.useState(false)

  return (
    <div className="grid w-full max-w-sm gap-3">
      {KEYS.map((key) => (
        <div key={key.id} className="grid gap-1.5">
          <span id={`reveal-all-${key.id}`} className="text-sm font-medium">
            {key.label}
          </span>
          <SecretField
            aria-labelledby={`reveal-all-${key.id}`}
            value={key.value}
            revealed={revealed}
            onRevealedChange={setRevealed}
          />
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => setRevealed((previous) => !previous)}
      >
        {revealed ? "Hide all" : "Reveal all"}
      </Button>
    </div>
  )
}
