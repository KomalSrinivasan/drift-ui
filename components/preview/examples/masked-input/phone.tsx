"use client"

import * as React from "react"

import { MaskedInput } from "@/registry/default/ui/masked-input"
import { Label } from "@/registry/default/ui/label"

export function MaskedInputPhonePreview() {
  const [phone, setPhone] = React.useState("")

  return (
    <div className="flex w-64 flex-col gap-2">
      <Label htmlFor="phone-input">Phone number</Label>
      <MaskedInput
        id="phone-input"
        mask="(###) ###-####"
        placeholder="(555) 000-0000"
        value={phone}
        onValueChange={setPhone}
      />
      <p className="font-mono text-xs text-muted-foreground">
        Digits: {phone || "none"}
      </p>
    </div>
  )
}
