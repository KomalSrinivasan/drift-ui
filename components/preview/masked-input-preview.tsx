"use client"

import * as React from "react"

import { CurrencyInput, MaskedInput } from "@/registry/default/ui/masked-input"
import { Label } from "@/registry/default/ui/label"

export function MaskedInputPreview() {
  const [card, setCard] = React.useState("4242424242424242")
  const [amount, setAmount] = React.useState<number | null>(4999)

  return (
    <div className="flex w-72 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="card-number">Card number</Label>
        <MaskedInput
          id="card-number"
          mask="#### #### #### ####"
          value={card}
          onValueChange={setCard}
          placeholder="1234 5678 9012 3456"
        />
        <p className="font-mono text-xs text-muted-foreground">
          Raw value: {card || "empty"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Amount</Label>
        <CurrencyInput
          id="amount"
          currency="USD"
          locale="en-US"
          value={amount}
          onValueChange={setAmount}
          placeholder="$0.00"
        />
        <p className="font-mono text-xs text-muted-foreground">
          Cents: {amount ?? "null"}
        </p>
      </div>
    </div>
  )
}
