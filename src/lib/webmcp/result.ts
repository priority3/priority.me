import type { ToolResult } from './types'

/** Successful result carrying human/agent-readable text. */
export function ok(text: string): ToolResult {
  return { content: [{ type: 'text', text }] }
}

/** Successful result carrying structured data the agent can parse. */
export function okJson(data: unknown): ToolResult {
  return ok(JSON.stringify(data, null, 2))
}

/**
 * Failure result.
 *
 * Reason: tools return an error *result* instead of throwing. A thrown exception
 * reaches the agent as an opaque DOMException, while readable text lets it correct
 * its arguments and retry on its own.
 */
export function err(text: string): ToolResult {
  return { content: [{ type: 'text', text }], isError: true }
}

/** Readable message for an unknown thrown value, for use in `err()`. */
export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
