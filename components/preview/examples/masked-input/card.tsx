"use client"

import * as React from "react"

import { MaskedInput } from "@/registry/default/ui/masked-input"
import { Label } from "@/registry/default/ui/label"

export function MaskedInputCardPreview() {
  const [card, setCard] = React.useState("")
  const [expiry, setExpiry] = React.useState("")

  return (
    <div className="flex w-64 flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-input">Card number</Label>
        <MaskedInput
          id="card-input"
          mask="#### #### #### ####"
          placeholder="0000 0000 0000 0000"
          value={card}
          onValueChange={setCard}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expiry-input">Expiration</Label>
        <MaskedInput
          id="expiry-input"
          mask="##/##"
          placeholder="MM/YY"
          value={expiry}
          onValueChange={setExpiry}
        />
      </div>
    </div>
  )
}
