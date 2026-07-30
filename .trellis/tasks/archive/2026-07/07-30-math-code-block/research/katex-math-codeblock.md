# Research: ```math 代码块 → KaTeX display math（本会话实证结论）

日期：2026-07-30。以下事实全部在本仓库实际验证过（构建测试 / 源码阅读），非推测。

## 目标机制

```` ```math ```` 围栏代码块 → remark 保留为 code 节点 → Astro Shiki **跳过**（需配置 excludeLangs）→ remark-rehype 输出 `<pre><code class="language-math">` → rehype-katex 识别 `language-math` class 渲染为 display math。

## 已验证事实

1. **rehype-katex v7 原生支持 `language-math`**：`node_modules/rehype-katex/lib/index.js` 第 22 行注释与第 49-53 行实现——处理 `language-math` / `math-display` / `math-inline` 三种 class；`language-math` 且非 inline 时按 displayMode 渲染。无需新增依赖。
2. **唯一阻塞是 Shiki 先消费代码块**：Astro 内置语法高亮在 remark 之后、用户 rehype 插件之前运行，会把 `math` 代码块替换为高亮后的 `<pre class="astro-code">`，`language-math` class 丢失。
3. **Astro ^5.7.10 支持 excludeLangs**（5.5 引入）：`markdown.syntaxHighlight: { type: 'shiki', excludeLangs: ['math'] }`。注意 `syntaxHighlight` 与 `shikiConfig` 是**同级**的两个字段，改前者不影响后者的 themes/transformers/wrap 配置。
4. **mermaid 不需要进 excludeLangs**：`src/lib/remark-mermaid.ts` 在 remark 阶段（先于 Shiki）就把 mermaid code 节点换成了 html 节点，Shiki 根本看不到它。不要顺带加。
5. **KaTeX CSS 已就位**：`src/layouts/BaseLayout.astro:4` 引入 `katex/dist/katex.min.css`；`src/styles/prose.css:213` 起有 `.prose .katex-display` 样式。
6. **现有 `$`/`$$` 语法工作正常**（基线，构建验证过）：行内 `$E=mc^2$`、块级 `$$...$$`（`$$` 独立成行）都渲染为 KaTeX；`\(...\)` `\[...\]` 不支持、原样输出。
7. **Keystatic 侧无需改动**：`keystatic.config.ts` 两个 collection 的 markdoc 字段 `codeBlock: true`，编辑器代码块语言为自由输入，可直接填 `math`。Markdoc 序列化器不转义代码块内容与 `$`、`\`、`_`（用 Markdoc.format 实测）。
8. **动机**：Keystatic 编辑器里普通段落的多行文本按硬换行保存（行尾 `\`），混入 `$$...$$` 公式导致 KaTeX ParseError（构建实测：`katex-error` + 红色错误文本）。代码块内容按字面保存，无此问题。

## 验证方法（供 check 复用）

- 在 `src/content/blogs/`（或 leetcode）加临时 .md：包含 ```` ```math ```` 块、`$...$` 行内、`$$...$$` 块级、一个普通 ```` ```python ```` 块。
- `pnpm astro build` 后检查 `dist/<路径>/index.html`：
  - `katex-display` ≥ 2（math 代码块 + $$ 块级）；`katex-error` = 0。
  - math 块不再出现 Shiki 输出（无 `astro-code` 包裹该内容）。
  - python 块仍有 Shiki 高亮标记（`astro-code`）。
- mermaid 回归：任一含 mermaid 的现有文章产物中仍有 `mermaid-wrap`。
- 验证后删除临时文件并重新 build，保持 dist 与源一致（dist 已 gitignore）。

## 构建基线

`pnpm astro build` 正常完成（~15s，Netlify adapter 本地可跑）；已知既有 warning：`[router] A collision will result in an hard error in following versions of Astro`（与本任务无关，不算新增）。
