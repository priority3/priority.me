/**
 * Minimal local type declarations for the WebMCP `document.modelContext` API.
 *
 * Reason: WebMCP is still an Origin Trial (Chrome 149 / Edge 150) and the official
 * `webmcp-types` package tracks a moving spec. This site only touches `registerTool`,
 * so self-hosting that one slice removes a version-drift risk while keeping
 * `astro check` green. Swap to the npm package once the API stabilises.
 *
 * Spec: https://github.com/webmachinelearning/webmcp
 */

/** JSON Schema subset used to describe tool inputs. */
export interface ToolInputSchema {
  type: 'object'
  properties?: Record<string, unknown>
  required?: string[]
}

export interface ToolTextContent {
  type: 'text'
  text: string
}

/** MCP-style tool result. `isError` lets the agent distinguish failure from an empty answer. */
export interface ToolResult {
  content: ToolTextContent[]
  isError?: boolean
}

export interface ToolExecuteOptions {
  /** Aborted when the user cancels the agent turn (e.g. a "stop" button). */
  signal?: AbortSignal
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema?: ToolInputSchema
  /**
   * Args come straight from an LLM, so they are untrusted and loosely typed
   * on purpose — every tool validates them at runtime via `./args`.
   */
  execute: (
    args: Record<string, unknown>,
    options?: ToolExecuteOptions,
  ) => ToolResult | Promise<ToolResult>
}

export interface RegisterToolOptions {
  /** Aborting unregisters the tool. */
  signal?: AbortSignal
  /** Secure origins allowed to discover this tool. Unused here — we expose nothing cross-origin. */
  exposedTo?: string[]
}

export interface ModelContext {
  registerTool: (tool: ToolDefinition, options?: RegisterToolOptions) => Promise<void>
}

declare global {
  interface Document {
    /** Present only in WebMCP-capable hosts; always feature-detect before use. */
    modelContext?: ModelContext
  }
}
