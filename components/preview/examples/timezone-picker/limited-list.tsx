import { Label } from "@/registry/default/ui/label"
import { TimezonePicker } from "@/registry/default/ui/timezone-picker"

const OFFICE_ZONES = [
  "America/New_York",
  "Europe/London",
  "Asia/Kolkata",
  "Asia/Tokyo",
]

export function TimezonePickerLimitedListPreview() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="office-timezone">Office</Label>
      <TimezonePicker
        id="office-timezone"
        timeZones={OFFICE_ZONES}
        defaultValue="Europe/London"
      />
    </div>
  )
}
