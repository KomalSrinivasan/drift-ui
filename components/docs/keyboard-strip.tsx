import { ShortcutKeys } from "@/registry/default/ui/shortcut-recorder"
import type { KeyBinding } from "@/lib/component-keyboard"

export function KeyboardStrip({ bindings }: { bindings: KeyBinding[] }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
      <p className="shrink-0 pt-0.5 font-mono text-[11px] tracking-widest text-brand uppercase">
        Keyboard
      </p>
      <dl
        aria-label="Keyboard"
        className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm"
      >
        {bindings.map(({ keys, action }) => (
          <div key={action} className="flex items-center gap-2">
            <dt className="flex items-center gap-1">
              {keys.map((key) => (
                <ShortcutKeys key={key} shortcut={key} />
              ))}
            </dt>
            <dd className="text-muted-foreground">{action}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
