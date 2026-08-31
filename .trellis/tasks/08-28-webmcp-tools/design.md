# Design — 基于 WebMCP 暴露站点 agent 工具

## 1. 架构概览

```
构建期 (Node)                        运行时 (浏览器)
─────────────────                   ──────────────────────────────────────
src/pages/search-index.json.ts      BaseLayout.astro
  ├─ getCollection('blogs')           ├─ <meta http-equiv="origin-trial">  (有 token 时)
  ├─ getCollection('leetcode')        └─ <WebMcp />
  ├─ markdownToText(body)                   └─ <script> registerAll()
  └─ dist/search-index.json                       │
                                                  ├─ 特性检测 document.modelContext
        （懒加载，首次工具调用时 fetch）◄──────────┤
                                                  ├─ tools/content.ts
                                                  ├─ tools/navigation.ts
                                                  └─ tools/comments.ts
                                                         │
                                       复用现有 API ──────┤
                                         GET  /api/comments?slug=
                                         GET  /api/comments/me
                                       复用现有 DOM ──────┘
                                         [data-comments][data-slug][data-title]
                                         [data-comments-input]
                                         .prose h2/h3/h4[id]
```

**核心设计原则：不新增任何数据注入点。** 页面上下文（collection / slug / 标题 / 章节）
全部从现有 DOM 与 `location.pathname` 推断，因此 `<WebMcp />` 无需 props，
`BaseLayout` 也无需感知文章数据。

## 2. 文件清单

| 文件 | 动作 | 职责 |
|---|---|---|
| `src/lib/webmcp/types.ts` | 新增 | `document.modelContext` 全局类型声明（本地自持，避免外部包依赖风险） |
| `src/lib/webmcp/result.ts` | 新增 | 统一构造 `{ content: [{ type:'text', text }] }` 结果与错误结果 |
| `src/lib/webmcp/search-index.ts` | 新增 | 索引懒加载（单次 promise 缓存）+ 加权打分检索 |
| `src/lib/webmcp/page-context.ts` | 新增 | 从 DOM/URL 推断当前页 collection / slug / title / sections |
| `src/lib/webmcp/tools/content.ts` | 新增 | `search-posts`、`get-post` |
| `src/lib/webmcp/tools/navigation.ts` | 新增 | `navigate-to-post`、`goto-section`、`get-page-context` |
| `src/lib/webmcp/tools/comments.ts` | 新增 | `list-comments`、`check-comment-auth`、`draft-comment` |
| `src/lib/webmcp/register.ts` | 新增 | 特性检测、汇总注册、`AbortController` 生命周期 |
| `src/lib/markdown-text.ts` | 新增 | markdown 源码 → 纯文本（索引与摘要共用） |
| `src/pages/search-index.json.ts` | 新增 | 构建期静态 endpoint，产出 `/search-index.json` |
| `src/components/WebMcp.astro` | 新增 | 客户端脚本挂载点 |
| `src/layouts/BaseLayout.astro` | 修改 | 注入 origin-trial meta + `<WebMcp />` |
| `.env.example` | 修改 | 记录 `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` |

每个文件均远低于 500 行上限；工具按域切分而非堆在单文件。

## 3. 工具契约

| # | name | inputSchema | 复用 | 副作用 |
|---|---|---|---|---|
| 1 | `search-posts` | `{ query: string, collection?: 'blogs'\|'leetcode'\|'all', limit?: number(1-20, default 5) }` | 静态索引 | 无 |
| 2 | `get-post` | `{ path: string }`（站内路径或 slug） | 静态索引 | 无 |
| 3 | `get-page-context` | `{}` | DOM + URL | 无 |
| 4 | `navigate-to-post` | `{ path: string }` | `location.assign` | 页面跳转 |
| 5 | `goto-section` | `{ heading: string }` | `.prose h2-h4[id]` | 滚动 |
| 6 | `list-comments` | `{ path?: string }`（缺省=当前页） | `GET /api/comments` | 无 |
| 7 | `check-comment-auth` | `{}` | `GET /api/comments/me` | 无 |
| 8 | `draft-comment` | `{ text: string }` | `[data-comments-input]` | **仅填入草稿，不提交** |

所有 `execute` 返回 MCP 风格结果；失败路径返回 `isError: true` 的可读文本，**不抛异常**
（Reason: 抛异常会让 agent 拿到不可读的 DOMException，返回文本能让它自行纠正参数重试）。

### 3.1 `search-posts` 打分

无外部依赖的加权子串计数（兼顾中英文，避免中文分词问题）：

```
query → terms = query.toLowerCase().split(/\s+/).filter(Boolean)
score(post) = Σ_terms (
    8 × count(title, term)
  + 4 × count(desc,  term)
  + 3 × count(tag,   term)
  + 1 × min(count(text, term), 10)   // 正文命中封顶，防长文霸榜
)
```

`score > 0` 的结果按分数降序、同分按日期降序，取 `limit` 条。
每条附 `snippet`：首个命中位置前后各 60 字符。

### 3.2 `navigate-to-post` 安全校验

```
1. 拒绝含 '//'、':' 的输入（阻断 protocol-relative 与绝对 URL）
2. new URL(path, location.origin) 后校验 origin === location.origin
3. pathname 必须匹配白名单：
     /  |  /posts  |  /posts/<slug>  |  /leetcode  |  /leetcode/<slug>
4. 显式拒绝 /keystatic 与 /api 前缀
5. 通过后 location.assign(url.pathname + url.hash)
```

Reason: 导航是 agent 可直接触发的副作用，必须防止被用作开放重定向或诱导用户离站。
Keystatic 后台是作者私有区域，不通过 agent 暴露。

### 3.3 `draft-comment` 流程

```
1. 定位 [data-comments] 根；不存在 → 返回「当前页面没有评论区」
2. GET /api/comments/me（credentials: 'same-origin'）
   ├─ 未登录 → 返回「请先用 GitHub 登录，登录入口在评论区」
   └─ 已登录 → 继续
3. 校验 text 非空且 ≤ 4000 字（与 sanitizeCommentText 上限对齐）
4. textarea.value = text
   textarea.dispatchEvent(new Event('input', { bubbles: true }))   ← 让现有校验/计数生效
5. root.scrollIntoView({ behavior:'smooth', block:'center' }) + textarea.focus()
6. 返回「草稿已填入评论框，请确认内容后点击『发表评论』提交」
```

**永不调用 `form.submit()` 或 `submitButton.click()`。**
Reason: PRD R4 —— 以用户 GitHub 身份写 Issue 是不可逆的对外发布行为。

## 4. 搜索索引

`src/pages/search-index.json.ts`（`prerender` 默认为 true，`output:'static'` 下产出静态文件）：

```ts
type IndexedPost = {
  collection: 'blogs' | 'leetcode'
  slug: string      // 'vue3-contribution'
  href: string      // '/posts/vue3-contribution'  ← 复用 postHref()
  title: string
  desc?: string
  tag?: string
  date: string      // ISO
  text: string      // markdownToText(entry.body)
}
type SearchIndex = { version: 1, posts: IndexedPost[] }
```

- 数据源复用 `getBlogPosts()` / `getLeetcodePosts()`，因此自动继承 `display !== false` 过滤与日期排序
- 路径复用 `postHref()`，避免与页面路由脱节
- 体积预估：约 16 篇 × ~3KB 纯文本 ≈ 50KB（gzip ≈ 15KB）

`markdownToText()` 剥离顺序（顺序有意义，先剥围栏再剥行内）：
围栏代码块 → 行内代码 → 图片 → 链接（保留文本）→ HTML 标签 → 标题/引用/列表标记 → 强调符号 → 折叠空白。

**懒加载**：`search-index.ts` 用模块级 `let cache: Promise<SearchIndex> | null`，
仅在 `search-posts` / `get-post` 首次执行时 `fetch('/search-index.json')`。
索引不进入初始 bundle，满足 PRD R1。

## 5. 生命周期与注册

Astro 是 MPA——每次导航整页刷新，因此每个页面加载都重新注册一次。

```ts
export async function registerAll() {
  const mc = (document as any).modelContext
  if (!mc?.registerTool) return          // 特性检测：不支持则静默退出

  const controller = new AbortController()
  addEventListener('pagehide', () => controller.abort(), { once: true })

  try {
    await Promise.all(
      allTools.map(tool => mc.registerTool(tool, { signal: controller.signal })),
    )
  } catch {
    // Permissions-Policy: tools=() 会 reject NotAllowedError；静默降级
  }
}
```

`<WebMcp />` 只把**特性检测**放进首屏，工具代码走动态 `import()`：

```astro
<script>
  // Reason: WebMCP is an origin trial — today almost no visitor has a host for it.
  // Shipping ~5KB gzip of tool code to everyone would be pure waste.
  if (document.modelContext?.registerTool) {
    import('@/lib/webmcp/register').then(({ registerAll }) => registerAll())
  }
</script>
```

实测：首屏 chunk **229 bytes**，工具代码 12KB(gzip 5.1KB) 落在独立的 `register.*.js`，
仅在检测通过时才请求。

不使用 `exposedTo`——工具只对同源文档与内置 agent 可见（WebMCP 默认行为）。

## 6. 类型策略

npm 上有官方 `webmcp-types` 包，但它随 Origin Trial 演进、版本可能不稳。
本期在 `src/lib/webmcp/types.ts` **自持最小类型声明**（只声明用到的 `registerTool` 与结果类型）：

```ts
declare global {
  interface Document { modelContext?: ModelContext }
}
```

Reason: 只需要 API 的一个小切面；自持声明消除外部依赖的版本漂移风险，
且 `pnpm check` 立即可用。若后续 API 稳定，可一行切换到 `webmcp-types`。

## 7. Origin Trial 注入

`BaseLayout.astro` head 内：

```astro
{originTrialToken && <meta http-equiv="origin-trial" content={originTrialToken} />}
```

token 取自 `import.meta.env.PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN`（`PUBLIC_` 前缀使其可在静态构建中内联）。
未配置 → 不输出标签（PRD 验收项）。

## 8. 兼容性与回滚

| 维度 | 结论 |
|---|---|
| 不支持 WebMCP 的浏览器 | `registerAll()` 首行返回，零影响 |
| 新增网络请求 | 仅工具被调用时才 fetch 索引；普通访问者无额外请求 |
| 新增初始 JS | **229 bytes**（仅特性检测）。12KB 的工具代码走动态 import，只有 WebMCP 宿主才下载 |
| 现有功能 | 无破坏性修改；`BaseLayout` 只做加法 |
| 回滚 | 从 `BaseLayout.astro` 移除 `<WebMcp />` 与 meta 两行即完全禁用；新增文件可独立保留 |

## 9. 已知取舍

- **验证受限**：Firefox / Safari 无实现，Chrome 需 Origin Trial token 或本地 flag。
  自动化验收只能覆盖「构建通过 + 索引正确 + 不支持时零回归」；工具实际调用需在
  Chrome（带 flag）或 ChatGPT Desktop 中人工验证。
- **检索是子串计数而非语义检索**：中文场景下「贡献」能命中，「怎么给开源提 PR」可能不命中。
  接受此取舍——agent 侧的 LLM 通常会自行改写查询词重试，且内容量小时召回压力低。
- **`get-post` 返回全文**：长文可能超出 agent 上下文预算。本期不做分段，
  由 agent 侧自行截断；如成为问题再加 `maxChars` 参数。
