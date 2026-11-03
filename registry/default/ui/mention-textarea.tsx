"use client"

import * as React from "react"
import { flushSync } from "react-dom"

import { cn } from "@/registry/default/lib/utils"
import {
  deleteMention,
  expandSelection,
  filterMentionOptions,
  findActiveMention,
  findMentionRanges,
  insertMention,
  limitMentionOptions,
  snapCaret,
  type MentionOption,
  type MentionSource,
} from "@/registry/default/lib/mention"
import { useControllableState } from "@/registry/default/hooks/use-controllable-state"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/registry/default/ui/popover"

type SearchResult = {
  key: string
  status: "done" | "error"
  options: MentionOption[]
}

function MentionTextarea({
  value,
  defaultValue = "",
  onValueChange,
  triggers,
  searchDelay = 150,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  className,
  ...props
}: Omit<
  React.ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange" | "onSelect"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  triggers: Record<string, MentionSource>
  searchDelay?: number
}) {
  const listId = React.useId()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const isComposingRef = React.useRef(false)
  const { value: text, setValue: setText } = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [caret, setCaret] = React.useState(0)
  const [dismissedStart, setDismissedStart] = React.useState<number | null>(
    null
  )
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const [inserted, setInserted] = React.useState<ReadonlySet<string>>(
    () => new Set()
  )
  const [result, setResult] = React.useState<SearchResult | null>(null)

  // Static options and anything picked from a search count as mentions.
  const tokens = React.useMemo(() => {
    const known = new Set(inserted)
    for (const [trigger, source] of Object.entries(triggers)) {
      if (typeof source === "function") continue
      for (const option of source) known.add(`${trigger}${option.value}`)
    }
    return known
  }, [triggers, inserted])
  const ranges = React.useMemo(
    () => findMentionRanges(text, tokens),
    [text, tokens]
  )

  const mention = findActiveMention(text, caret, Object.keys(triggers))
  const source = mention ? triggers[mention.trigger] : undefined
  const isSearch = typeof source === "function"
  const mentionKey = mention
    ? `${mention.trigger}:${mention.start}:${mention.query}`
    : ""
  const current = isSearch && result?.key === mentionKey ? result : null
  const status = !isSearch ? "done" : (current?.status ?? "loading")
  const options = !mention
    ? []
    : isSearch
      ? (current?.options ?? [])
      : filterMentionOptions(source ?? [], mention.query)
  const isOpen =
    mention !== null &&
    mention.start !== dismissedStart &&
    (isSearch || options.length > 0)
  const [previousMentionKey, setPreviousMentionKey] = React.useState(mentionKey)

  if (mentionKey !== previousMentionKey) {
    setPreviousMentionKey(mentionKey)
    setHighlightedIndex(0)
  }

  const runSearch = React.useEffectEvent(
    (trigger: string, query: string, key: string, signal: AbortSignal) => {
      const search = triggers[trigger]
      if (typeof search !== "function") return
      search(query, { signal }).then(
        (found) => {
          if (signal.aborted) return
          setResult({
            key,
            status: "done",
            options: limitMentionOptions(found),
          })
        },
        () => {
          if (signal.aborted) return
          setResult({ key, status: "error", options: [] })
        }
      )
    }
  )

  const searchTrigger = isSearch ? mention?.trigger : undefined
  const searchQuery = isSearch ? mention?.query : undefined
  React.useEffect(() => {
    if (searchTrigger === undefined || searchQuery === undefined) return
    // Aborting on every new query is what drops stale responses.
    const controller = new AbortController()
    const timer = setTimeout(
      () =>
        runSearch(searchTrigger, searchQuery, mentionKey, controller.signal),
      searchDelay
    )
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchTrigger, searchQuery, mentionKey, searchDelay])

  function commit(next: { text: string; caret: number }) {
    flushSync(() => {
      setText(next.text)
      setCaret(next.caret)
    })
    textareaRef.current?.setSelectionRange(next.caret, next.caret)
  }

  function selectOption(option: MentionOption) {
    if (!mention) return
    setInserted((previous) =>
      new Set(previous).add(`${mention.trigger}${option.value}`)
    )
    commit(insertMention(text, mention, caret, option))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    // Keys that confirm an IME composition (Japanese, Chinese, Korean) belong
    // to the IME. Safari reports them as keyCode 229 after compositionend.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return

    const { selectionStart, selectionEnd } = event.currentTarget
    const hasModifier = event.altKey || event.ctrlKey || event.metaKey
    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      selectionStart === selectionEnd &&
      !hasModifier
    ) {
      const next = deleteMention(
        text,
        ranges,
        selectionStart,
        event.key === "Backspace" ? "backward" : "forward"
      )
      if (next) {
        event.preventDefault()
        commit(next)
        return
      }
    }

    if (!isOpen) return
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (options.length === 0) return
        event.preventDefault()
        const delta = event.key === "ArrowDown" ? 1 : -1
        setHighlightedIndex(
          (highlightedIndex + delta + options.length) % options.length
        )
        return
      }
      case "Enter":
      case "Tab":
        if (options.length === 0) return
        event.preventDefault()
        selectOption(options[highlightedIndex])
        return
      case "Escape":
        event.preventDefault()
        setDismissedStart(mention.start)
        return
    }
  }

  function handleSelect(event: React.SyntheticEvent<HTMLTextAreaElement>) {
    const element = event.currentTarget
    const { selectionStart, selectionEnd, selectionDirection } = element
    if (isComposingRef.current) {
      setCaret(selectionStart)
      return
    }
    if (selectionStart === selectionEnd) {
      const snapped = snapCaret(ranges, selectionStart, caret)
      if (snapped !== selectionStart) {
        element.setSelectionRange(snapped, snapped)
      }
      setCaret(snapped)
      return
    }
    const expanded = expandSelection(ranges, selectionStart, selectionEnd)
    if (expanded.start !== selectionStart || expanded.end !== selectionEnd) {
      element.setSelectionRange(
        expanded.start,
        expanded.end,
        selectionDirection ?? undefined
      )
    }
    setCaret(selectionStart)
  }

  const statusMessage =
    status === "loading"
      ? "Loading suggestions"
      : status === "error"
        ? "Couldn't load suggestions"
        : isSearch && options.length === 0
          ? "No results"
          : ""

  const textareaProps = {
    ref: textareaRef,
    "data-slot": "mention-textarea",
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": isOpen ? listId : undefined,
    "aria-activedescendant":
      isOpen && options.length > 0
        ? `${listId}-${highlightedIndex}`
        : undefined,
    value: text,
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value)
      setCaret(event.target.selectionStart)
    },
    onSelect: handleSelect,
    onKeyDown: handleKeyDown,
    onCompositionStart: (
      event: React.CompositionEvent<HTMLTextAreaElement>
    ) => {
      isComposingRef.current = true
      onCompositionStart?.(event)
    },
    onCompositionEnd: (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      isComposingRef.current = false
      onCompositionEnd?.(event)
    },
    className: cn(
      "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
      "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className
    ),
    ...props,
  } as const

  const list = (
    <>
      <ul
        id={listId}
        role="listbox"
        aria-busy={status === "loading"}
        data-slot="mention-textarea-list"
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === highlightedIndex}
            onPointerDown={(event) => event.preventDefault()}
            onPointerMove={() => setHighlightedIndex(index)}
            onClick={() => selectOption(option)}
            className="flex cursor-default flex-col rounded-sm px-2 py-1.5 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            <span>{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            )}
          </li>
        ))}
      </ul>
      {isSearch && (
        <p
          role="status"
          data-slot="mention-textarea-status"
          className={cn(
            "px-2 py-1.5 text-sm text-muted-foreground",
            !statusMessage && "sr-only"
          )}
        >
          {statusMessage}
        </p>
      )}
    </>
  )

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && mention) setDismissedStart(mention.start)
      }}
    >
      <PopoverAnchor asChild>
        <textarea {...textareaProps} />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (event.target === textareaRef.current) event.preventDefault()
        }}
        className="w-64 p-1"
      >
        {list}
      </PopoverContent>
    </Popover>
  )
}

export { MentionTextarea }
