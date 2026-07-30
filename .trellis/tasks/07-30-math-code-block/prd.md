# Support math code blocks rendered as KaTeX display math

## Goal

让 ```` ```math ```` 围栏代码块在站点构建后渲染为 KaTeX 块级公式（display math），从而让 Keystatic 后台用户可以用「代码块 + 语言填 `math`」的方式安全地撰写多行块级公式——代码块内容按字面保存，不会像普通段落那样被硬换行序列化（行尾 `\`）污染导致 KaTeX ParseError。

## Background（本会话已实证的事实）

- 管线：`astro.config.mjs` markdown 配置为 remark: `remarkGfm → remarkGithubAlerts → remarkMath → remarkMermaid`；rehype: `rehypeRaw → rehypeKatex`；Shiki 语法高亮由 Astro 内置步骤处理。
- 已装 `rehype-katex` v7 源码确认（`node_modules/rehype-katex/lib/index.js:22,49`）：它原生处理 `language-math` class 的元素并按 display math 渲染。
- 阻塞点：Astro 内置 Shiki 会先消费所有围栏代码块（含 `math`），使 `language-math` class 结构在到达 rehype-katex 前被替换。Astro ≥5.5（当前 ^5.7.10）支持 `markdown.syntaxHighlight: { type: 'shiki', excludeLangs: [...] }` 跳过指定语言。
- mermaid 代码块目前由 `src/lib/remark-mermaid.ts` 在 remark 阶段转成 HTML（先于 Shiki），不依赖 excludeLangs，本任务不动它。
- KaTeX CSS 已在 `src/layouts/BaseLayout.astro:4` 全局引入；`src/styles/prose.css` 已有 `.katex-display` 样式。

## Requirements

1. 修改 `astro.config.mjs`：`markdown.syntaxHighlight` 从默认值改为 `{ type: 'shiki', excludeLangs: ['math'] }`，保持现有 `shikiConfig`（themes/transformers/wrap 等）不变、继续生效。
2. 不改动 remark/rehype 插件列表及顺序（`rehypeRaw → rehypeKatex` 顺序保持）。
3. 不改动 Keystatic 配置（编辑器代码块语言为自由输入，已可填 `math`）。
4. 范围纪律：只加 `math` 到 excludeLangs，不顺带加 `mermaid` 或其他语言。

## Acceptance Criteria

- [ ] 含 ```` ```math ```` 代码块的临时测试文章经 `pnpm astro build` 后，产物 HTML 中该块渲染为 `katex-display`（出现 KaTeX 标记而非 `<pre>` 代码块/Shiki 输出），且无 `katex-error`。
- [ ] 现有 `$...$` 行内与 `$$...$$` 块级公式仍正常渲染（回归）。
- [ ] 普通代码块（如 python/ts）仍被 Shiki 高亮（产物中仍有 Shiki 输出，双主题 class 不变）。
- [ ] mermaid 代码块仍渲染为 `mermaid-wrap` 容器（回归）。
- [ ] 构建无新增 error/warning（与基线一致）。
- [ ] 测试用临时内容文件在验证后删除，工作区干净。

## Out of Scope

- Keystatic 编辑器内的公式实时预览（编辑器不渲染 KaTeX 是既有事实，不在本任务解决）。
- 行内公式的后台写法（`$...$` 已可用）。
- 文档/博客文章更新。
