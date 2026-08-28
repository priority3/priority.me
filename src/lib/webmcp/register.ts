/**
 * Registration entry point for this site's WebMCP tools.
 *
 * Spec: https://github.com/webmachinelearning/webmcp
 */

import { commentTools } from './tools/comments'
import { contentTools } from './tools/content'
import { navigationTools } from './tools/navigation'
import type { ToolDefinition } from './types'

export const allTools: ToolDefinition[] = [
  ...contentTools,
  ...navigationTools,
  ...commentTools,
]

export async function registerAll(): Promise<void> {
  const modelContext = document.modelContext
  // Feature detection: without a WebMCP host this is a no-op and the site is untouched.
  if (!modelContext?.registerTool) return

  // Reason: Astro is an MPA — every navigation reloads the document. Tools are registered
  // once per page load and unregistered on unload by aborting the signal.
  const controller = new AbortController()
  addEventListener('pagehide', () => controller.abort(), { once: true })

  try {
    await Promise.all(
      allTools.map(tool => modelContext.registerTool(tool, { signal: controller.signal })),
    )
  } catch {
    // Reason: registerTool rejects with NotAllowedError when the `tools` permission policy
    // is disabled (`Permissions-Policy: tools=()`). There is nothing a visitor can act on,
    // so degrade silently rather than logging noise into their console.
  }
}
