"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange, Matcher } from "react-day-picker"

import {
  formatRange,
  hourCycleOf,
  isRangeAllowed,
  isSameRange,
  monthToShow,
  pickDays,
  setRangeTime,
  timeOf,
  timeZoneLabel,
  type DateTimeRange,
  type DateTimeRangePreset,
  type RangeEdge,
} from "@/registry/default/lib/date-time-range"
import { cn } from "@/registry/default/lib/utils"
import { useControllableState } from "@/registry/default/hooks/use-controllable-state"
import { Button, buttonVariants } from "@/registry/default/ui/button"
import { Calendar } from "@/registry/default/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/ui/popover"
import { TimeField } from "@/registry/default/ui/time-field"

const DEFAULT_START_TIME = "09:00"
const DEFAULT_END_TIME = "17:00"
const EMPTY_RANGE: DateTimeRange = {}
const NO_PRESETS: DateTimeRangePreset[] = []

function subscribeToNothing() {
  return () => {}
}

function DateTimeRangePicker({
  value,
  defaultValue = EMPTY_RANGE,
  onValueChange,
  presets = NO_PRESETS,
  min,
  max,
  locale,
  placeholder = "Pick a date range",
  numberOfMonths = 2,
  disabled,
  className,
  ...props
}: Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children" | "type"
> & {
  value?: DateTimeRange
  defaultValue?: DateTimeRange
  onValueChange?: (range: DateTimeRange) => void
  presets?: DateTimeRangePreset[]
  min?: Date
  max?: Date
  locale?: string
  placeholder?: string
  numberOfMonths?: number
}) {
  const { value: range, setValue: setRange } = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const bounds = { min, max }
  const [isOpen, setIsOpen] = React.useState(false)
  const [month, setMonth] = React.useState(() => monthToShow(range, bounds))
  const startTime = timeOf(range.from, DEFAULT_START_TIME)
  const endTime = timeOf(range.to, DEFAULT_END_TIME)
  const label = formatRange(range, locale)
  const isHydrated = React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  )
  const triggerText = !label ? placeholder : isHydrated ? label : ""
  const hourCycle = hourCycleOf(locale)
  const fieldId = React.useId()
  const disabledDays: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
  ]

  function handleOpenChange(open: boolean) {
    if (open) setMonth(monthToShow(range, bounds))
    setIsOpen(open)
  }

  function selectDays(days: DateRange | undefined) {
    setRange(pickDays(days, { start: startTime, end: endTime }, bounds))
  }

  function applyPreset(preset: DateTimeRangePreset) {
    setRange(preset.value)
    setMonth(monthToShow(preset.value, bounds))
  }

  function editTime(edge: RangeEdge, time: string) {
    setRange(setRangeTime(range, edge, time, bounds))
  }

  const timeFields = [
    { edge: "from", label: "Start time", time: startTime },
    { edge: "to", label: "End time", time: endTime },
  ] as const

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        data-slot="date-time-range"
        data-empty={label ? undefined : ""}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full max-w-sm justify-start font-normal data-[empty]:text-muted-foreground",
          className
        )}
        {...props}
      >
        <CalendarIcon />
        <span className="truncate">{triggerText}</span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-auto max-w-[calc(100vw-1rem)] flex-col p-0 sm:flex-row"
      >
        {presets.length > 0 && (
          <div
            role="group"
            aria-label="Presets"
            className="flex flex-wrap gap-1 border-b p-3 sm:w-40 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0"
          >
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start aria-pressed:bg-accent aria-pressed:text-accent-foreground"
                aria-pressed={isSameRange(range, preset.value)}
                disabled={!isRangeAllowed(preset.value, bounds)}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
        <div className="flex flex-col">
          <Calendar
            mode="range"
            autoFocus
            numberOfMonths={numberOfMonths}
            month={month}
            onMonthChange={setMonth}
            startMonth={min}
            endMonth={max}
            disabled={disabledDays}
            selected={{ from: range.from, to: range.to }}
            onSelect={selectDays}
          />
          <div className="grid grid-cols-2 gap-3 border-t p-3">
            {timeFields.map((field) => {
              const date = range[field.edge]
              const labelId = `${fieldId}-${field.edge}-label`
              const zoneId = `${fieldId}-${field.edge}-zone`

              return (
                <div key={field.edge} className="grid gap-1.5">
                  <span id={labelId} className="text-sm font-medium">
                    {field.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <TimeField
                      aria-labelledby={labelId}
                      aria-describedby={zoneId}
                      value={field.time}
                      onValueChange={(time) => editTime(field.edge, time)}
                      hourCycle={hourCycle}
                      disabled={!date}
                      aria-disabled={!date || undefined}
                    />
                    <span
                      id={zoneId}
                      data-slot="date-time-range-zone"
                      className="text-xs text-muted-foreground"
                    >
                      {timeZoneLabel(
                        date ?? monthToShow(range, bounds),
                        locale
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between gap-2 border-t p-3">
            <Button variant="ghost" size="sm" onClick={() => setRange({})}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimeRangePicker, type DateTimeRange, type DateTimeRangePreset }
