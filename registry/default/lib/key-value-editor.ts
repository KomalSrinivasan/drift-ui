export type KeyValueRow = { id: string; key: string; value: string }

export function createRowId() {
  return Math.random().toString(36).slice(2, 10)
}

export function createRow(key = "", value = ""): KeyValueRow {
  return { id: createRowId(), key, value }
}

// One KEY=value line in .env style, or null for blank lines, comments and
// lines without "=". Multi-line values are not supported.
export function parseEnvLine(line: string) {
  const trimmed = line.trim()
  if (trimmed === "" || trimmed.startsWith("#")) return null
  const body = trimmed.replace(/^export\s+/, "")
  const equals = body.indexOf("=")
  if (equals <= 0) return null

  const key = body.slice(0, equals).trim()
  let value = body.slice(equals + 1).trim()
  const quote = value[0]
  if ((quote === '"' || quote === "'") && value.indexOf(quote, 1) > 0) {
    value = value.slice(1, value.indexOf(quote, 1))
  } else {
    // An unquoted value ends at a " #" comment, like dotenv.
    value = value.replace(/\s+#.*$/, "")
  }
  return key ? { key, value } : null
}

export function parseEnv(text: string) {
  return text
    .split(/\r?\n/)
    .map(parseEnvLine)
    .filter((entry) => entry !== null)
}

// Text pasted into a key field becomes rows when it looks like KEY=value.
export function pasteRows(rows: KeyValueRow[], index: number, text: string) {
  if (!text.includes("=")) return null
  const entries = parseEnv(text)
  if (entries.length === 0) return null

  const pasted = entries.map((entry) => createRow(entry.key, entry.value))
  const current = rows[index]
  const replacesCurrent = current.key === "" && current.value === ""
  return [
    ...rows.slice(0, index + (replacesCurrent ? 0 : 1)),
    ...pasted,
    ...rows.slice(index + 1),
  ]
}

// Keys used by more than one row, compared after trimming. Empty keys are
// never duplicates.
export function findDuplicateKeys(rows: KeyValueRow[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const row of rows) {
    const key = row.key.trim()
    if (key === "") continue
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  }
  return duplicates
}
