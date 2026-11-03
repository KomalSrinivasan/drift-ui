"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { useControllableState } from "@/registry/default/hooks/use-controllable-state"
import {
  filterTimezones,
  formatTimezoneLabel,
  formatTimezoneTime,
  getTimezoneOffset,
  listTimezones,
  toCurrentTimezoneName,
  type TimezoneOption,
} from "@/registry/default/lib/timezone-picker"
import { cn } from "@/registry/default/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/ui/popover"

function scrollOptionIntoList(option: HTMLElement | null) {
  option?.scrollIntoView({ block: "nearest" })
}

function TimezonePicker({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  timeZones,
  placeholder = "Select a time zone",
  disabled,
  className,
  ...props
}: Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "children"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  timeZones?: string[]
  placeholder?: string
}) {
  const listId = React.useId()
  const { value, setValue } = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const current = toCurrentTimezoneName(value)
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  // Built once per open, so offsets and times match the moment it opened.
  const [list, setList] = React.useState<{
    now: Date
    options: TimezoneOption[]
  } | null>(null)

  const matches = filterTimezones(list?.options ?? [], query)

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen)
    if (!nextOpen) return
    const now = new Date()
    const options = listTimezones(now, timeZones)
    setList({ now, options })
    setQuery("")
    setHighlightedIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === current)
      )
    )
  }

  function select(next: string) {
    setValue(next)
    setIsOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault()
        if (matches.length === 0) return
        const delta = event.key === "ArrowDown" ? 1 : -1
        setHighlightedIndex(
          (highlightedIndex + delta + matches.length) % matches.length
        )
        return
      }
      case "Enter": {
        event.preventDefault()
        const match = matches[highlightedIndex]
        if (match) select(match.value)
        return
      }
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        data-slot="timezone-picker"
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          className
        )}
        {...props}
      >
        {current ? (
          <>
            <span className="min-w-0 flex-1 truncate">
              {formatTimezoneLabel(current)}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {getTimezoneOffset(current, new Date())}
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label="Choose a time zone"
        className="flex w-80 flex-col gap-1 p-1"
      >
        <input
          type="text"
          role="combobox"
          data-slot="timezone-picker-search"
          aria-label="Search time zones"
          aria-autocomplete="list"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={
            matches.length > 0 ? `${listId}-${highlightedIndex}` : undefined
          }
          value={query}
          placeholder="Search time zones"
          onChange={(event) => {
            setQuery(event.target.value)
            setHighlightedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          className="h-8 w-full rounded-sm bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div
          id={listId}
          role="listbox"
          aria-label="Time zones"
          data-slot="timezone-picker-list"
          className="relative max-h-64 overflow-y-auto"
        >
          {matches.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              No time zone found
            </p>
          ) : (
            list &&
            matches.map((option, index) => (
              <div
                key={option.value}
                ref={
                  index === highlightedIndex ? scrollOptionIntoList : undefined
                }
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === current}
                data-highlighted={index === highlightedIndex ? "" : undefined}
                onPointerMove={() => setHighlightedIndex(index)}
                onClick={() => select(option.value)}
                className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {option.offset} · {formatTimezoneTime(option.value, list.now)}
                </span>
                {option.value === current && (
                  <CheckIcon className="size-4 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimezonePicker }
