/**
 * Markdown source → plain text, for the agent search index.
 *
 * Not a parser: a deliberately small regex pipeline, since the only consumer is
 * keyword matching and snippet extraction. Astro's Content Layer hands us `entry.body`
 * with frontmatter already stripped, so this only deals with body syntax.
 */
export function markdownToText(md: string): string {
  return (
    md
      // Reason: fenced blocks must be removed before inline code. The inline pattern
      // would otherwise match a fence's own backtick pair and leave the code body behind.
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/~~~[\s\S]*?~~~/g, ' ')
      .replace(/`[^`\n]*`/g, ' ')

      // Reason: images before links — `![alt](src)` matches the link pattern too,
      // which would consume the brackets and leave a stray `!` in the text.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')

      // Raw HTML, including the <div class="mermaid"> wrappers remark-mermaid emits.
      .replace(/<[^>]+>/g, ' ')

      // Reason: thematic breaks before list markers, so `- - -` is not mistaken for a list item.
      .replace(/^\s*([-*_])\s*(?:\1\s*){2,}$/gm, ' ')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>+\s?/gm, '')
      // GitHub alert labels surface once the blockquote marker is gone.
      .replace(/\[!\w+\]/g, ' ')
      .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '')

      // Table separator rows carry no words; remaining pipes become spaces.
      .replace(/^\s*\|[\s:|-]+\|\s*$/gm, ' ')
      .replace(/\|/g, ' ')

      // Reason: strip `*` and `~~` but keep `_`, so identifiers like `use_state`
      // survive as searchable words.
      .replace(/\*{1,3}|~{2}/g, '')
      .replace(/\$\$?/g, ' ')

      // Reason: backslashes last — a hard line break (`text\` at EOL) leaves a dangling
      // slash, and escapes like `\*` must survive the emphasis pass before being unwrapped.
      .replace(/\\(?=\s|$)/gm, ' ')
      .replace(/\\([^\w\s])/g, '$1')

      .replace(/\s+/g, ' ')
      .trim()
  )
}
