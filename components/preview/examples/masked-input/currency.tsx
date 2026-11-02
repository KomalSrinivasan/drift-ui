"use client"

import * as React from "react"

import { CurrencyInput } from "@/registry/default/ui/masked-input"
import { Label } from "@/registry/default/ui/label"

export function MaskedInputCurrencyPreview() {
  const [eurValue, setEurValue] = React.useState<number | null>(125000)
  const [usdValue, setUsdValue] = React.useState<number | null>(7999)

  return (
    <div className="flex w-64 flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currency-usd">USD (en-US)</Label>
        <CurrencyInput
          id="currency-usd"
          currency="USD"
          locale="en-US"
          value={usdValue}
          onValueChange={setUsdValue}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currency-eur">EUR (de-DE)</Label>
        <CurrencyInput
          id="currency-eur"
          currency="EUR"
          locale="de-DE"
          value={eurValue}
          onValueChange={setEurValue}
        />
      </div>
    </div>
  )
}
