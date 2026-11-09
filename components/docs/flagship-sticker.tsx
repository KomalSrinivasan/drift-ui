import { cn } from "@/registry/default/lib/utils"

export function FlagshipSticker({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block -rotate-6 rounded-[0.4em] bg-brand-solid px-2 py-0.5 font-display text-xs font-semibold tracking-tight text-brand-solid-foreground shadow-[0_0.5em_1em_-0.5em] shadow-brand-solid/70 select-none",
        className
      )}
    >
      Flagship
    </span>
  )
}
