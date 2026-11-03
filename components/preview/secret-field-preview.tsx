import { SecretField } from "@/registry/default/ui/secret-field"

export function SecretFieldPreview() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <span id="preview-secret-key" className="text-sm font-medium">
        Secret key
      </span>
      <SecretField
        aria-labelledby="preview-secret-key"
        value="sk_live_51Mz8Qk2xPa1b2"
      />
    </div>
  )
}
