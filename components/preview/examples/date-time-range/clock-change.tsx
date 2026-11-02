import { DateTimeRangePicker } from "@/registry/default/ui/date-time-range"
import { Label } from "@/registry/default/ui/label"

export function DateTimeRangeClockChangePreview() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="range-clock-change">Migration freeze</Label>
      <DateTimeRangePicker
        id="range-clock-change"
        locale="en-US"
        defaultValue={{
          from: new Date(2027, 2, 10, 22, 0),
          to: new Date(2027, 3, 5, 6, 0),
        }}
      />
    </div>
  )
}
