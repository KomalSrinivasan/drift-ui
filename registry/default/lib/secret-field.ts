const MASK_CHAR = "•"
// Fixed so the mask does not reveal how long the secret is.
const MASK_LENGTH = 8

export function getVisibleTail(value: string, visibleChars: number) {
  if (visibleChars <= 0 || value.length <= visibleChars) return ""
  return value.slice(-visibleChars)
}

export function maskSecret(value: string, visibleChars: number) {
  return MASK_CHAR.repeat(MASK_LENGTH) + getVisibleTail(value, visibleChars)
}
