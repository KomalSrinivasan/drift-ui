import { describe, expect, it, vi } from "vitest"

import {
  clampDate,
  formatRange,
  hourCycleOf,
  isRangeWithin,
  isSameRange,
  monthToShow,
  pickDays,
  setRangeTime,
  timeOf,
  timeZoneLabel,
  withTime,
} from "@/registry/default/lib/date-time-range"

const MIN = new Date(2026, 2, 5, 8, 0)
const MAX = new Date(2026, 2, 20, 18, 0)
const BOUNDS = { min: MIN, max: MAX }

describe("timeOf", () => {
  it("formats hours and minutes with leading zeros", () => {
    expect(timeOf(new Date(2026, 2, 10, 7, 5), "09:00")).toBe("07:05")
  })

  it("falls back when there is no date", () => {
    expect(timeOf(undefined, "09:00")).toBe("09:00")
  })
})

describe("withTime", () => {
  it("sets the time and zeroes seconds without touching the input", () => {
    const date = new Date(2026, 2, 10, 8, 30, 45, 500)
    expect(withTime(date, "17:15")).toEqual(new Date(2026, 2, 10, 17, 15))
    expect(date).toEqual(new Date(2026, 2, 10, 8, 30, 45, 500))
  })

  it("leaves the date alone for an empty or malformed time", () => {
    const date = new Date(2026, 2, 10, 8, 30)
    expect(withTime(date, "")).toBe(date)
    expect(withTime(date, "24:00")).toBe(date)
    expect(withTime(date, "9:00")).toBe(date)
  })

  it("returns undefined without a date", () => {
    expect(withTime(undefined, "09:00")).toBeUndefined()
  })
})

describe("clampDate", () => {
  it("pulls dates inside the bounds", () => {
    expect(clampDate(new Date(2026, 2, 1), BOUNDS)).toEqual(MIN)
    expect(clampDate(new Date(2026, 3, 1), BOUNDS)).toEqual(MAX)
  })

  it("returns a copy of the bound, not the bound itself", () => {
    expect(clampDate(new Date(2026, 2, 1), BOUNDS)).not.toBe(MIN)
  })

  it("keeps dates already inside, and any date without bounds", () => {
    const inside = new Date(2026, 2, 10)
    expect(clampDate(inside, BOUNDS)).toBe(inside)
    expect(clampDate(inside, {})).toBe(inside)
  })
})

describe("monthToShow", () => {
  it("shows the start of the range", () => {
    const from = new Date(2026, 5, 1)
    expect(monthToShow({ from }, BOUNDS)).toBe(from)
  })

  it("shows today, pulled inside the bounds, when there is no start", () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    try {
      vi.setSystemTime(new Date(2026, 2, 10, 12, 0))
      expect(monthToShow({}, {})).toEqual(new Date(2026, 2, 10, 12, 0))
      expect(monthToShow({}, { min: new Date(2026, 5, 1) })).toEqual(
        new Date(2026, 5, 1)
      )
      expect(monthToShow({}, { max: new Date(2026, 0, 31) })).toEqual(
        new Date(2026, 0, 31)
      )
    } finally {
      vi.useRealTimers()
    }
  })
})

describe("isRangeWithin", () => {
  it("checks every set edge against the bounds", () => {
    expect(isRangeWithin({ from: MIN, to: MAX }, BOUNDS)).toBe(true)
    expect(isRangeWithin({ from: new Date(2026, 2, 5, 7, 59) }, BOUNDS)).toBe(
      false
    )
    expect(isRangeWithin({ to: new Date(2026, 2, 20, 18, 1) }, BOUNDS)).toBe(
      false
    )
    expect(isRangeWithin({}, BOUNDS)).toBe(true)
  })
})

describe("isSameRange", () => {
  it("compares by time value", () => {
    expect(
      isSameRange(
        { from: new Date(2026, 2, 5), to: new Date(2026, 2, 6) },
        { from: new Date(2026, 2, 5), to: new Date(2026, 2, 6) }
      )
    ).toBe(true)
    expect(isSameRange({}, {})).toBe(true)
    expect(isSameRange({ from: new Date(2026, 2, 5) }, {})).toBe(false)
  })
})

describe("pickDays", () => {
  const times = { start: "09:00", end: "17:00" }

  it("applies the start and end times to the picked days", () => {
    expect(
      pickDays(
        { from: new Date(2026, 2, 10), to: new Date(2026, 2, 12) },
        times
      )
    ).toEqual({
      from: new Date(2026, 2, 10, 9, 0),
      to: new Date(2026, 2, 12, 17, 0),
    })
  })

  it("returns an empty range when the selection is cleared", () => {
    expect(pickDays(undefined, times)).toEqual({})
  })

  it("clamps times on the first and last allowed days", () => {
    expect(
      pickDays(
        { from: new Date(2026, 2, 5), to: new Date(2026, 2, 20) },
        { start: "06:00", end: "23:00" },
        BOUNDS
      )
    ).toEqual({ from: MIN, to: MAX })
  })

  it("never puts the end before the start on a one day range", () => {
    expect(
      pickDays(
        { from: new Date(2026, 2, 10), to: new Date(2026, 2, 10) },
        { start: "18:00", end: "17:00" }
      )
    ).toEqual({
      from: new Date(2026, 2, 10, 18, 0),
      to: new Date(2026, 2, 10, 18, 0),
    })
  })
})

describe("setRangeTime", () => {
  const range = {
    from: new Date(2026, 2, 10, 9, 0),
    to: new Date(2026, 2, 10, 17, 0),
  }

  it("sets the time on one edge", () => {
    expect(setRangeTime(range, "from", "10:30")).toEqual({
      ...range,
      from: new Date(2026, 2, 10, 10, 30),
    })
  })

  it("keeps the start at or before the end", () => {
    expect(setRangeTime(range, "from", "18:00").from).toEqual(range.to)
  })

  it("keeps the end at or after the start", () => {
    expect(setRangeTime(range, "to", "08:00").to).toEqual(range.from)
  })

  it("clamps to min and max", () => {
    const edges = {
      from: new Date(2026, 2, 5, 9, 0),
      to: new Date(2026, 2, 20, 17, 0),
    }
    expect(setRangeTime(edges, "from", "06:00", BOUNDS).from).toEqual(MIN)
    expect(setRangeTime(edges, "to", "23:00", BOUNDS).to).toEqual(MAX)
  })

  it("ignores an edge with no date and an empty time", () => {
    expect(setRangeTime({ from: range.from }, "to", "10:00")).toEqual({
      from: range.from,
    })
    expect(setRangeTime(range, "from", "")).toBe(range)
  })
})

describe("hourCycleOf", () => {
  it("reads 12 or 24 hours from the locale", () => {
    expect(hourCycleOf("en-US")).toBe(12)
    expect(hourCycleOf("en-GB")).toBe(24)
    expect(hourCycleOf("de-DE")).toBe(24)
  })
})

describe("timeZoneLabel", () => {
  it("returns the short zone name for the date", () => {
    const date = new Date(2026, 2, 10)
    const expected = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value

    expect(timeZoneLabel(date, "en-US")).toBe(expected)
    expect(timeZoneLabel(date, "en-US")).not.toBe("")
  })
})

describe("formatRange", () => {
  it("formats a full range, a start only, and nothing", () => {
    const from = new Date(2026, 2, 10, 9, 0)
    const to = new Date(2026, 2, 12, 17, 0)
    expect(formatRange({ from, to }, "en-US")?.replace(/\s/g, " ")).toBe(
      "Mar 10, 2026, 9:00 AM – Mar 12, 2026, 5:00 PM"
    )
    expect(formatRange({ from }, "en-US")?.replace(/\s/g, " ")).toBe(
      "Mar 10, 2026, 9:00 AM"
    )
    expect(formatRange({}, "en-US")).toBeNull()
  })
})
