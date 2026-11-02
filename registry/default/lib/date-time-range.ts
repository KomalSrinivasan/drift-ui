import type { HourCycle } from "@/registry/default/lib/time-segments"

export type DateTimeRange = { from?: Date; to?: Date }
export type DateTimeRangePreset = { label: string; value: DateTimeRange }
export type DateTimeBounds = { min?: Date; max?: Date }
export type RangeEdge = keyof DateTimeRange

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function timeOf(date: Date | undefined, fallback: string) {
  if (!date) return fallback
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export function withTime(date: Date | undefined, time: string) {
  const match = TIME_PATTERN.exec(time)
  if (!date || !match) return date
  const next = new Date(date)
  next.setHours(Number(match[1]), Number(match[2]), 0, 0)
  return next
}

function latest(...dates: (Date | undefined)[]) {
  return dates.reduce<Date | undefined>(
    (best, date) => (date && (!best || date > best) ? date : best),
    undefined
  )
}

function earliest(...dates: (Date | undefined)[]) {
  return dates.reduce<Date | undefined>(
    (best, date) => (date && (!best || date < best) ? date : best),
    undefined
  )
}

export function clampDate(date: Date, { min, max }: DateTimeBounds) {
  if (min && date < min) return new Date(min)
  if (max && date > max) return new Date(max)
  return date
}

export function monthToShow(range: DateTimeRange, bounds: DateTimeBounds) {
  return range.from ?? clampDate(new Date(), bounds)
}

export function isRangeWithin(
  range: DateTimeRange,
  { min, max }: DateTimeBounds
) {
  return [range.from, range.to].every(
    (date) => !date || ((!min || date >= min) && (!max || date <= max))
  )
}

export function isSameRange(a: DateTimeRange, b: DateTimeRange) {
  return (
    a.from?.getTime() === b.from?.getTime() &&
    a.to?.getTime() === b.to?.getTime()
  )
}

function boundsFor(
  edge: RangeEdge,
  range: DateTimeRange,
  { min, max }: DateTimeBounds
): DateTimeBounds {
  return edge === "from"
    ? { min, max: earliest(max, range.to) }
    : { min: latest(min, range.from), max }
}

export function pickDays(
  days: DateTimeRange | undefined,
  times: { start: string; end: string },
  bounds: DateTimeBounds = {}
): DateTimeRange {
  const startDay = withTime(days?.from, times.start)
  const from = startDay && clampDate(startDay, bounds)
  const endDay = withTime(days?.to, times.end)
  const to = endDay && clampDate(endDay, boundsFor("to", { from }, bounds))
  return { from, to }
}

export function setRangeTime(
  range: DateTimeRange,
  edge: RangeEdge,
  time: string,
  bounds: DateTimeBounds = {}
): DateTimeRange {
  const date = range[edge]
  if (!date || !TIME_PATTERN.test(time)) return range
  const timed = withTime(date, time) ?? date
  return { ...range, [edge]: clampDate(timed, boundsFor(edge, range, bounds)) }
}

export function hourCycleOf(locale?: string): HourCycle {
  const { hourCycle } = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).resolvedOptions()
  return hourCycle === "h11" || hourCycle === "h12" ? 12 : 24
}

export function timeZoneLabel(date: Date, locale?: string) {
  return (
    new Intl.DateTimeFormat(locale, { timeZoneName: "short" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  )
}

export function formatRange(range: DateTimeRange, locale?: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  })
  if (range.from && range.to) return formatter.formatRange(range.from, range.to)
  if (range.from) return formatter.format(range.from)
  return null
}
