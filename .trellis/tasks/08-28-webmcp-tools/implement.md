# Implement — 基于 WebMCP 暴露站点 agent 工具

执行顺序按依赖排列：**基础设施 → 索引 → 工具 → 挂载 → 验证**。
每个 Step 结束时代码应处于可构建状态。

---

## Step 1 · 类型与结果工具（无依赖）

- [ ] `src/lib/webmcp/types.ts` — `declare global { interface Document { modelContext?: ModelContext } }`，
      含 `ToolDefinition`、`ToolResult`、`RegisterToolOptions` 最小声明
- [ ] `src/lib/webmcp/result.ts` — `ok(text)` / `okJson(data)` / `err(text)` 三个构造器，
      统一产出 `{ content: [{ type: 'text', text }], isError? }`

**验证**：`pnpm check`

---

## Step 2 · Markdown 纯文本化

- [ ] `src/lib/markdown-text.ts` — `markdownToText(md: string): string`
- [ ] 剥离顺序须为：围栏代码块 → 行内代码 → 图片 → 链接（保留文本）→ HTML 标签 →
      标题/引用/列表标记 → 强调符号 → 折叠空白
- [ ] 加 `// Reason:` 注释说明顺序为何重要（先围栏后行内，否则代码块内的反引号会错配）

**验证**：`pnpm check`

---

## Step 3 · 构建期搜索索引

- [ ] `src/pages/search-index.json.ts` — `GET` 返回 `SearchIndex` JSON
- [ ] 数据源必须走 `getBlogPosts()` / `getLeetcodePosts()`（继承 `display` 过滤与排序）
- [ ] 路径必须走 `postHref()`（避免与路由脱节）
- [ ] `Content-Type: application/json; charset=utf-8`

**验证**：
```bash
pnpm build && ls -la dist/search-index.json
node -e "const d=require('./dist/search-index.json');console.log(d.posts.length, d.posts.map(p=>p.href).slice(0,5))"
```
预期：`posts.length` 等于 blogs + leetcode 中 `display !== false` 的总数，`href` 形如 `/posts/xxx`、`/leetcode/xxx`。

> **Review gate 1**：确认索引条目数正确，且 `text` 字段非空、不含残留 markdown 语法。
>
> 实测基线：**15 条**（6 blogs + 9 leetcode）。`src/content/` 下共 16 个文件，
> `toy-record.md` 带 `display: false` 被正确排除——这正是 PRD R2 要求的隐藏语义。
> 注意 `posts/[...slug].astro` 的 `getStaticPaths` 用的是未过滤的 `getCollection`，
> 所以隐藏文章**仍会生成页面**，只是不进索引、不出现在列表页。

---

## Step 4 · 索引懒加载与检索

- [ ] `src/lib/webmcp/search-index.ts`
  - 模块级 `let cache: Promise<SearchIndex> | null = null`，`loadIndex()` 单次 fetch
  - `searchPosts(query, { collection, limit })` — 按 design §3.1 加权打分
  - `findPost(pathOrSlug)` — 同时接受 `/posts/x`、`posts/x`、`x`
  - `buildSnippet(text, term)` — 首个命中前后各 60 字符

**验证**：`pnpm check`

---

## Step 5 · 页面上下文推断

- [ ] `src/lib/webmcp/page-context.ts` — `getPageContext()` 返回
      `{ path, collection, slug, title, hasComments, sections }`
  - `collection`：`/posts/*` → `blogs`，`/leetcode/*` → `leetcode`，否则 `null`
  - `slug` / `title`：优先读 `[data-comments]` 的 `data-slug` / `data-title`，回退到 pathname 末段与 `document.title`
  - `sections`：`document.querySelectorAll('.prose h2[id], .prose h3[id], .prose h4[id]')` → `{ id, text, depth }[]`

**验证**：`pnpm check`

---

## Step 6 · 内容工具

- [ ] `src/lib/webmcp/tools/content.ts`
  - `search-posts` — schema 含 `query`(required) / `collection` enum / `limit` 1-20 default 5
  - `get-post` — `path`(required)；未命中返回 `err('未找到文章：…')`，**不抛异常**

**验证**：`pnpm check`

---

## Step 7 · 导航工具

- [ ] `src/lib/webmcp/tools/navigation.ts`
  - `get-page-context` — 空 schema，返回 `okJson(getPageContext())`
  - `navigate-to-post` — 按 design §3.2 五步校验；拒绝时返回 `err(...)`
  - `goto-section` — 对 `sections` 做大小写不敏感的包含匹配；命中则 `scrollIntoView({behavior:'smooth'})` 并更新 `location.hash`
- [ ] 白名单校验单独抽成 `isAllowedInternalPath(path)` 函数，便于后续复核

**验证**：`pnpm check`

> **Review gate 2**：人工复核 `isAllowedInternalPath` —— 逐条确认
> `https://evil.example`、`//evil.example`、`/keystatic`、`/api/comments`、`javascript:alert(1)`
> 全部被拒绝。

---

## Step 8 · 评论工具

- [ ] `src/lib/webmcp/tools/comments.ts`
  - `list-comments` — `GET /api/comments?slug=`，`credentials:'same-origin'`；
        `configured === false` 时返回「评论功能未配置」
  - `check-comment-auth` — `GET /api/comments/me`
  - `draft-comment` — 严格按 design §3.3 六步执行
- [ ] **禁止**出现 `form.submit()`、`submitButton.click()`、`requestSubmit()`
- [ ] 加 `// Reason:` 注释说明为何只填草稿不提交

**验证**：`pnpm check` + `grep -nE 'requestSubmit|\.submit\(|submit.*\.click\(' src/lib/webmcp/` 应无输出

---

## Step 9 · 注册入口与挂载

- [ ] `src/lib/webmcp/register.ts` — 特性检测 + `AbortController` + `pagehide` 清理 + `try/catch` 静默
- [ ] `src/components/WebMcp.astro` — 首屏只做特性检测；命中后 `import('@/lib/webmcp/register')` 动态加载
      （Reason: WebMCP 尚在 Origin Trial，绝大多数访客没有宿主，不应为他们下载工具代码）
- [ ] `src/layouts/BaseLayout.astro` —
      head 内条件渲染 origin-trial meta；body 末尾（`</body>` 前）放 `<WebMcp />`
- [ ] `.env.example` — 追加 `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN=` 及注释说明去哪注册

**验证**：
```bash
pnpm check && pnpm build
grep -c 'origin-trial' dist/index.html   # 未配置 token 时应为 0
```

---

## Step 10 · 全量验收

```bash
pnpm check                    # 无新增 TS / astro 错误
pnpm build                    # 构建通过
ls dist/search-index.json     # 索引存在
grep -rn 'origin-trial' dist/*.html | head   # 未配置 token 时无输出
```

浏览器人工验证（`pnpm dev`）：

- [ ] 首页 / 文章页 / leetcode 页正常渲染，控制台无新增报错
- [ ] 评论区、主题切换、TOC、Mermaid、Presence 行为与改造前一致
- [ ] DevTools Network：普通浏览时**不应**出现 `search-index.json` 请求

WebMCP 功能验证（需 Chrome 149+ 带 flag，或 ChatGPT Desktop）：

- [ ] `(await document.modelContext.getTools()).map(t => t.name)` 列出 8 个工具
- [ ] `search-posts({ query: 'vue' })` 命中 `vue3-contribution`
- [ ] `navigate-to-post({ path: 'https://evil.example' })` 被拒
- [ ] `draft-comment({ text: '测试' })` 后文本入框、页面滚动到评论区、**GitHub 无新增评论**

> **Review gate 3**：`draft-comment` 未提交表单这一条必须实测确认，
> 而不是仅凭代码阅读判断。

---

## 回滚点

| 触发 | 操作 |
|---|---|
| 任一 Step 构建失败 | 该 Step 为独立新文件，`git checkout -- <file>` 即可 |
| 上线后发现回归 | 从 `BaseLayout.astro` 删除 `<WebMcp />` 与 origin-trial meta 两行 → 功能完全禁用，其余文件成为死代码不影响运行 |
| 索引体积过大 | 在 `search-index.json.ts` 中对 `text` 截断（如每篇上限 8000 字符） |

## 完成后

- [ ] 按 Trellis 3.3 更新 spec（WebMCP 工具契约与安全边界值得沉淀到 `.trellis/spec/frontend/`）
- [ ] 按 Trellis 3.4 提交
- [ ] 提醒 moka 完成 PRD 中的 Origin Trial 注册前置项
