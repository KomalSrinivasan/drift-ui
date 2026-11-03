import { describe, expect, it } from "vitest"

import {
  describeRecurrence,
  formatRRule,
  occurrences,
  parseRRule,
} from "@/registry/default/lib/recurrence"

const TUESDAY = new Date(2026, 10, 3, 10, 0)

function days(rule: string, start: Date, limit: number) {
  return occurrences(parseRRule(rule), start, limit).map(
    (date) =>
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
  )
}

describe("recurrence", () => {
  it("parses an RRULE, with or without the RRULE: prefix", () => {
    expect(
      parseRRule("RRULE:FREQ=MONTHLY;INTERVAL=2;BYDAY=-1FR;COUNT=10")
    ).toEqual({
      frequency: "MONTHLY",
      interval: 2,
      byDay: [{ weekday: "FR", ordinal: -1 }],
      byMonthDay: [],
      count: 10,
      until: undefined,
    })
    expect(parseRRule("freq=daily;bymonthday=15,-1").byMonthDay).toEqual([
      15, -1,
    ])
  })

  it("falls back to weekly every 1 for missing or invalid parts", () => {
    expect(parseRRule("FREQ=HOURLY;INTERVAL=0;BYDAY=XX;COUNT=-2")).toEqual({
      frequency: "WEEKLY",
      interval: 1,
      byDay: [],
      byMonthDay: [],
      count: undefined,
      until: undefined,
    })
  })

  it("reads UNTIL as a UTC date-time or a local end of day", () => {
    expect(parseRRule("FREQ=DAILY;UNTIL=20261231T120000Z").until).toEqual(
      new Date(Date.UTC(2026, 11, 31, 12))
    )
    expect(parseRRule("FREQ=DAILY;UNTIL=20261231").until).toEqual(
      new Date(2026, 11, 31, 23, 59, 59)
    )
  })

  it("formats in a stable order and round-trips", () => {
    const rule = "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH;COUNT=4"
    expect(formatRRule(parseRRule(rule))).toBe(rule)
    expect(formatRRule(parseRRule("INTERVAL=1;FREQ=DAILY"))).toBe("FREQ=DAILY")
    expect(formatRRule(parseRRule("FREQ=DAILY;UNTIL=20261231T120000Z"))).toBe(
      "FREQ=DAILY;UNTIL=20261231T120000Z"
    )
  })

  it("describes rules in plain language", () => {
    const describe = (rule: string) =>
      describeRecurrence(parseRRule(rule), TUESDAY)
    expect(describe("FREQ=DAILY")).toBe("Daily")
    expect(describe("FREQ=WEEKLY;INTERVAL=2;BYDAY=TU")).toBe(
      "Every 2 weeks on Tuesday"
    )
    expect(describe("FREQ=WEEKLY;BYDAY=FR,MO,WE")).toBe(
      "Weekly on Monday, Wednesday and Friday"
    )
    expect(describe("FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20261231")).toBe(
      "Every weekday until Dec 31, 2026"
    )
    expect(describe("FREQ=MONTHLY;BYDAY=-1FR;COUNT=10")).toBe(
      "Monthly on the last Friday, 10 times"
    )
    expect(describe("FREQ=MONTHLY;BYDAY=2TU")).toBe(
      "Monthly on the second Tuesday"
    )
    expect(describe("FREQ=MONTHLY;INTERVAL=3")).toBe("Every 3 months on day 3")
    expect(describe("FREQ=MONTHLY;BYMONTHDAY=-1;COUNT=1")).toBe(
      "Monthly on the last day, once"
    )
    expect(describe("FREQ=YEARLY")).toBe("Yearly on November 3")
  })

  it("lists daily and weekly occurrences from the start, keeping its time", () => {
    expect(days("FREQ=DAILY;INTERVAL=3", TUESDAY, 3)).toEqual([
      "2026-11-3 10:00",
      "2026-11-6 10:00",
      "2026-11-9 10:00",
    ])
    expect(days("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TU", TUESDAY, 3)).toEqual([
      "2026-11-3 10:00",
      "2026-11-16 10:00",
      "2026-11-17 10:00",
    ])
  })

  it("lists monthly occurrences by ordinal weekday and by month day", () => {
    expect(days("FREQ=MONTHLY;BYDAY=-1FR", TUESDAY, 3)).toEqual([
      "2026-11-27 10:00",
      "2026-12-25 10:00",
      "2027-1-29 10:00",
    ])
    expect(days("FREQ=MONTHLY;BYDAY=2TU", TUESDAY, 2)).toEqual([
      "2026-11-10 10:00",
      "2026-12-8 10:00",
    ])
    expect(days("FREQ=MONTHLY;BYMONTHDAY=31", TUESDAY, 2)).toEqual([
      "2026-12-31 10:00",
      "2027-1-31 10:00",
    ])
  })

  it("lists yearly occurrences on the start date", () => {
    expect(days("FREQ=YEARLY;INTERVAL=2", TUESDAY, 2)).toEqual([
      "2026-11-3 10:00",
      "2028-11-3 10:00",
    ])
  })

  it("stops at COUNT and UNTIL", () => {
    expect(days("FREQ=DAILY;COUNT=2", TUESDAY, 5)).toHaveLength(2)
    expect(days("FREQ=DAILY;UNTIL=20261105", TUESDAY, 5)).toEqual([
      "2026-11-3 10:00",
      "2026-11-4 10:00",
      "2026-11-5 10:00",
    ])
  })

  it("preserves unknown and unhandled RRULE parts on round-trip", () => {
    const rule =
      "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;WKST=SU;BYHOUR=9;X-CUSTOM=DRIFT"
    const parsed = parseRRule(rule)
    expect(parsed.unknownParts).toEqual({
      WKST: "SU",
      BYHOUR: "9",
      "X-CUSTOM": "DRIFT",
    })
    expect(formatRRule(parsed)).toBe(
      "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;WKST=SU;BYHOUR=9;X-CUSTOM=DRIFT"
    )
  })

  it("supports BYSETPOS for last weekday, first weekday, etc.", () => {
    const lastWeekdayRule = "FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1"
    const parsed = parseRRule(lastWeekdayRule)
    expect(parsed.bySetPos).toEqual([-1])
    expect(describeRecurrence(parsed, TUESDAY)).toBe(
      "Monthly on the last weekday"
    )
    expect(days(lastWeekdayRule, TUESDAY, 3)).toEqual([
      "2026-11-30 10:00",
      "2026-12-31 10:00",
      "2027-1-29 10:00",
    ])

    const firstWeekdayRule = "FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1"
    expect(describeRecurrence(parseRRule(firstWeekdayRule), TUESDAY)).toBe(
      "Monthly on the first weekday"
    )
    expect(days(firstWeekdayRule, new Date(2026, 10, 1, 10, 0), 3)).toEqual([
      "2026-11-2 10:00",
      "2026-12-1 10:00",
      "2027-1-1 10:00",
    ])
  })

  it("supports BYMONTH and ordinals in yearly recurrence", () => {
    const rule = "FREQ=YEARLY;BYMONTH=3;BYDAY=2SU"
    const parsed = parseRRule(rule)
    expect(parsed.byMonth).toEqual([3])
    expect(describeRecurrence(parsed, TUESDAY)).toBe(
      "Yearly in March on the second Sunday"
    )
    expect(days(rule, new Date(2027, 0, 1, 10, 0), 3)).toEqual([
      "2027-3-14 10:00",
      "2028-3-12 10:00",
      "2029-3-11 10:00",
    ])
  })

  it("skips dates specified in EXDATE", () => {
    const multiLine = [
      "RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU",
      "EXDATE:20261110T100000Z,20261124T100000Z",
    ].join("\n")

    const parsed = parseRRule(multiLine)
    expect(parsed.exdates).toHaveLength(2)

    const results = occurrences(parsed, TUESDAY, 3)
    expect(
      results.map(
        (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      )
    ).toEqual(["2026-11-3", "2026-11-17", "2026-12-1"])

    const optionsResults = occurrences(
      parseRRule("FREQ=WEEKLY;BYDAY=TU"),
      TUESDAY,
      3,
      {
        exdates: [new Date(2026, 10, 10)],
      }
    )
    expect(
      optionsResults.map(
        (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      )
    ).toEqual(["2026-11-3", "2026-11-17", "2026-11-24"])
  })

  it("keeps exact wall-clock time invariant across daylight saving transitions", () => {
    const beforeSpringForward = new Date(2026, 2, 6, 10, 0, 0)
    const springOccurrences = occurrences(
      parseRRule("FREQ=DAILY"),
      beforeSpringForward,
      5
    )
    for (const occ of springOccurrences) {
      expect(occ.getHours()).toBe(10)
      expect(occ.getMinutes()).toBe(0)
    }

    const beforeFallBack = new Date(2026, 9, 30, 10, 0, 0)
    const fallOccurrences = occurrences(
      parseRRule("FREQ=DAILY"),
      beforeFallBack,
      5
    )
    for (const occ of fallOccurrences) {
      expect(occ.getHours()).toBe(10)
      expect(occ.getMinutes()).toBe(0)
    }
  })

  it("round-trips Google Calendar export fixtures", () => {
    const gcalWeekly = "RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=MO,WE,FR"
    const parsed = parseRRule(gcalWeekly)
    expect(formatRRule(parsed, { prefix: true })).toBe(
      "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;WKST=SU"
    )

    const gcalExdate = [
      "RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=TU",
      "EXDATE;TZID=America/New_York:20261110T100000",
    ].join("\n")
    const parsedExdate = parseRRule(gcalExdate)
    expect(parsedExdate.unknownParts?.WKST).toBe("SU")
    expect(parsedExdate.tzid).toBe("America/New_York")
    expect(parsedExdate.exdates).toHaveLength(1)
  })

  it("round-trips Outlook export fixtures", () => {
    const outlookMonthly =
      "RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1"
    const parsed = parseRRule(outlookMonthly)
    expect(parsed.bySetPos).toEqual([-1])
    expect(formatRRule(parsed, { prefix: true })).toBe(
      "RRULE:FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1"
    )

    const outlookYearly = "RRULE:FREQ=YEARLY;INTERVAL=1;BYMONTH=3;BYDAY=2SU"
    const parsedYearly = parseRRule(outlookYearly)
    expect(parsedYearly.byMonth).toEqual([3])
    expect(formatRRule(parsedYearly, { prefix: true })).toBe(
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU"
    )
  })

  it("round-trips Apple Calendar export fixtures", () => {
    const appleYearly = "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU"
    const parsed = parseRRule(appleYearly)
    expect(parsed.byMonth).toEqual([11])
    expect(formatRRule(parsed, { prefix: true })).toBe(
      "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU"
    )

    const appleCustom =
      "RRULE:FREQ=WEEKLY;BYDAY=TU;X-APPLE-TRAVEL-ADVISORY-BEHAVIOR=AUTOMATIC"
    const parsedCustom = parseRRule(appleCustom)
    expect(
      parsedCustom.unknownParts?.["X-APPLE-TRAVEL-ADVISORY-BEHAVIOR"]
    ).toBe("AUTOMATIC")
    expect(formatRRule(parsedCustom, { prefix: true })).toBe(appleCustom)
  })

  it("handles awkward recurrences (5th Tuesday, leap day)", () => {
    const fifthTuesday = occurrences(
      parseRRule("FREQ=MONTHLY;BYDAY=5TU"),
      TUESDAY,
      2
    )
    expect(
      fifthTuesday.map(
        (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      )
    ).toEqual(["2026-12-29", "2027-3-30"])

    const leapDay = new Date(2024, 1, 29, 12, 0)
    const leapOccurrences = occurrences(parseRRule("FREQ=YEARLY"), leapDay, 2)
    expect(
      leapOccurrences.map(
        (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      )
    ).toEqual(["2024-2-29", "2028-2-29"])
  })

  it("satisfies scale limits: parses 1,000 rules and expands 500 occurrences quickly", () => {
    const startParse = performance.now()
    for (let i = 0; i < 1000; i++) {
      parseRRule(
        "FREQ=MONTHLY;INTERVAL=2;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1;WKST=SU;X-DRIFT=1"
      )
    }
    const parseDuration = performance.now() - startParse
    expect(parseDuration).toBeLessThan(100)

    const startOccurrences = performance.now()
    const expanded = occurrences(
      parseRRule("FREQ=DAILY;INTERVAL=1"),
      TUESDAY,
      500
    )
    const occurrencesDuration = performance.now() - startOccurrences
    expect(expanded).toHaveLength(500)
    expect(occurrencesDuration).toBeLessThan(100)
  })
})
