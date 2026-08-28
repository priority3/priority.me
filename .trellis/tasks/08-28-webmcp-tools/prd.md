# 基于 WebMCP 暴露站点 agent 工具

## Goal

让 razet.me 在支持 WebMCP 的宿主（Chrome 149+ / Edge 150+ Origin Trial、ChatGPT Desktop、Brave Leo）中，
把**内容检索**、**站点导航**、**评论读写**以标准 tool 形式注册到 `document.modelContext`，
使 agent 能直接调用而不再依赖 DOM 抓取与模拟点击。

目标场景（用户对浏览器 agent 说的话）：

- 「这个站里有讲 Vue3 贡献的文章吗？打开它。」→ `search-posts` → `navigate-to-post`
- 「总结一下当前这篇文章。」→ `get-page-context` → `get-post`
- 「这篇的评论都在说什么？」→ `list-comments`
- 「帮我写一条评论说……」→ `check-comment-auth` → `draft-comment`（填入输入框，**由用户点提交**）

## Scope

### In scope

- 内容检索与摘要（跨 blogs / leetcode 两个 collection）
- 站点导航（跳转文章、跳转当前页标题锚点）
- 评论读取 + 评论草稿写入（人工确认后提交）
- 特性检测与渐进增强、Origin Trial token 接入

### Out of scope

- 站内自建 AI 助手 UI（不做 `getTools()` / `executeTool()` 消费侧）
- 阅读体验控制类工具（主题切换、代码块/Mermaid 控制）
- Keystatic 后台（`/keystatic/*`、`/api/keystatic/*`）相关工具——后台是作者私有区域，不对 agent 暴露
- 声明式 `<form>` 工具合成（本期只用命令式 API）

## Requirements

### R1 渐进增强与零回归

- `document.modelContext` 不存在时**完全静默 no-op**，不报错、不影响任何现有功能
- WebMCP 脚本不得阻塞首屏；搜索索引**按需懒加载**，不进入初始 bundle
- 现有页面、评论、Presence、Keystatic、主题切换行为完全不变

### R2 内容检索工具

- `search-posts`：按关键词检索，支持 `collection` 与 `limit` 过滤，返回结构化命中列表（标题 / 路径 / 日期 / tag / 摘要 / 匹配片段）
- `get-post`：按站内路径或 slug 取单篇文章的**纯文本正文** + frontmatter，供 agent 摘要
- 检索数据来源为构建期预生成的静态索引，**不新增运行时搜索依赖**
- 索引须遵守 `display: false` 的隐藏语义（与 `src/lib/posts.ts` 的 `isVisible` 一致）

### R3 站点导航工具

- `navigate-to-post`：跳转站内路径。**只接受同源站内路径**，白名单前缀 `/`、`/posts`、`/posts/*`、`/leetcode`、`/leetcode/*`
- `goto-section`：按标题文本跳转当前页锚点，复用现有 `TableOfContents` 生成的 heading id
- `get-page-context`：返回当前页 collection / slug / 标题 / 是否有评论区，让 agent 知道自己在哪

### R4 评论工具（读自由、写需人工确认）

- `list-comments`：读取指定（默认当前页）文章评论，走现有 `GET /api/comments?slug=`
- `check-comment-auth`：走现有 `GET /api/comments/me` 返回登录态，未登录时返回登录引导
- `draft-comment`：**只把文本填入现有评论输入框**（`[data-comments-input]`）、派发 input 事件、滚动并聚焦，
  返回「已填入草稿，请用户确认后点击提交」。**绝不自动提交表单。**
  - Reason: 发评论是不可逆的对外发布行为，且会以用户 GitHub 身份写入 Issue。
    WebMCP explainer 明确的 human-in-the-loop 原则要求这类副作用保留用户最终确认权。
- 不注册任何会泄露 session cookie、GitHub token 或 Keystatic 凭据的工具

### R5 Origin Trial 接入

- 支持通过环境变量 `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` 注入 `<meta http-equiv="origin-trial">`
- 未配置该变量时**不输出 meta 标签**，站点照常工作

## Constraints

| 约束 | 影响 |
|---|---|
| `output: 'static'` + Netlify adapter | 工具注册只能在客户端脚本；索引须构建期生成 |
| WebMCP 处于 Origin Trial（Chrome 149 / Edge 150），Firefox / Safari 无实现 | 必须特性检测；无法在多数浏览器验证，需接受可观测性有限 |
| Astro 是 MPA，每次导航整页刷新 | 每页加载重新注册工具；用 `AbortController` + `pagehide` 清理 |
| 不引入运行时搜索库（Fuse/Pagefind 等） | 自写加权词频打分；内容量（约 16 篇）足以支撑 |

## Prerequisites（外部依赖，需 moka 本人操作）

- [ ] 到 [Chrome Origin Trials](https://developer.chrome.com/origintrials) 为 `https://razet.me` 注册 WebMCP trial，取得 token
- [ ] 将 token 配置为 Netlify 环境变量 `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN`
- [ ] （可选）Edge 同名 trial 单独注册

> 未完成上述步骤时，代码仍可合并且不影响站点；WebMCP 只在带 `--enable-features` 标志的本地 Chrome 或 ChatGPT Desktop 中生效。

## Acceptance Criteria

- [ ] `pnpm build` 与 `pnpm check` 通过，无新增 TS / astro check 错误
- [ ] 构建产物包含 `dist/search-index.json`，内容覆盖全部 `display !== false` 的 blogs + leetcode 文章
- [ ] 在**不支持** WebMCP 的浏览器（如当前 Safari）中打开首页 / 文章页 / 评论区，功能与改造前一致，控制台无新增报错
- [ ] 在支持 WebMCP 的宿主中 `await document.modelContext.getTools()` 能列出全部 8 个工具，且每个都有 `description` 与合法 `inputSchema`
- [ ] `search-posts({ query: 'vue' })` 返回含 `vue3-contribution` 的命中项
- [ ] `get-post` 对已存在文章返回非空纯文本正文；对不存在的 slug 返回明确的错误文本而非抛异常
- [ ] `navigate-to-post` 对 `https://evil.example` 与 `/keystatic` 等非白名单输入**拒绝跳转**并返回错误文本
- [ ] `list-comments` 在评论未配置的环境下返回「未配置」而非报错
- [ ] `draft-comment` 调用后：文本出现在评论框中、页面滚动到评论区、**表单未被提交**（GitHub 无新增评论）
- [ ] 未登录时 `draft-comment` 或 `check-comment-auth` 返回可读的登录引导文本
- [ ] 未配置 `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN` 时，HTML 中不含 `origin-trial` meta

## Notes

- WebMCP 一手资料：<https://github.com/webmachinelearning/webmcp>（explainer）、
  <https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md>（浏览器支持）
- API 形态已核实为 `document.modelContext.registerTool(tool, { signal, exposedTo })`，
  配套 `getTools()` / `executeTool()` / `toolchange` 事件
- 本期不使用 `exposedTo`——不向任何跨源 iframe 暴露工具
