/**
 * Mark ```mermaid fenced blocks as diagram sources (not Shiki code).
 * Emits raw HTML; pair with rehype-raw in astro.config.
 */
import { visit } from 'unist-util-visit'

export function remarkMermaid() {
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (!parent || typeof index !== 'number') return
      if ((node.lang || '').toLowerCase() !== 'mermaid') return

      const value = String(node.value || '').replace(/\r\n/g, '\n').trim()
      const encoded = encodeURIComponent(value)
      parent.children[index] = {
        type: 'html',
        value: `<div class="mermaid-wrap" data-mermaid data-src="${encoded}"><div class="mermaid-loading">绘制中…</div></div>`,
      }
    })
  }
}
