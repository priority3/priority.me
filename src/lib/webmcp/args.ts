/**
 * Runtime argument readers for WebMCP tools.
 *
 * Reason: tool arguments are produced by an LLM against a JSON Schema the browser
 * does not enforce for us. Treat every field as untrusted and coerce explicitly.
 */

export function readString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = args?.[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

/** Reads a bounded integer, ignoring NaN / out-of-range values in favour of `fallback`. */
export function readInt(
  args: Record<string, unknown>,
  key: string,
  { min, max, fallback }: { min: number; max: number; fallback: number },
): number {
  const value = args?.[key]
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(num)))
}

/** Reads a string constrained to `allowed`, falling back when the model invents a value. */
export function readEnum<T extends string>(
  args: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = readString(args, key)
  return allowed.includes(value as T) ? (value as T) : fallback
}
