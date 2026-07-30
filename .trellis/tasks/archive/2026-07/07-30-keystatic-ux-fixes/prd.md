# Keystatic admin UX: loading-state toolbar misplacement and editor caret breathing room

## Goal

修复 Keystatic 后台两个交互问题：

1. 条目页加载中，自定义「保存草稿/发布」工具栏被错误挂到居中的 loading spinner 容器里，与 spinner 挤成一行出现在页面正中。
2. 编辑长文档时，光标所在的最新一行始终贴着滚动视口最底沿，没有下方留白。

## Root Causes（research/keystatic-ux-findings.md 已定位）

1. **工具栏错挂**：`src/keystatic/draft-workflow.ts:260-271` `findHeaderActionsHost()` 的最后兜底 `main.querySelector(':scope > div')` 在条目仍处于 Suspense fallback 时命中的第一个 div 正是居中的 spinner Flex 容器（Keystatic `PageHeader` 渲染的是 `<header>` 而非 div）。工具栏由 `setInterval`（`draft-workflow.ts:538-540`）反复 `ensureToolbar()` 维护，host 返回 null 时稍后 header 出现会自动挂载——所以正确修法是**根因修复**：兜底改为只认 `:scope > header`，找不到就返回 null（加载中不显示工具栏），而不是用 CSS 把错误的排版改成纵向。用户原话是「应该纵向」，但根因是工具栏根本不该出现在加载区；已按此理解执行。
2. **光标贴底**：编辑器滚动容器是 `SplitPaneSecondary` 内的 `div[data-scrollable]`，`.ProseMirror`（`[data-keystatic-editor='content']`）桌面端底部 padding 仅 32px；`prosemirror-view@1.42.1` 默认 `scrollMargin` 5px 且手动计算 scrollTop、忽略 CSS scroll-padding，Keystatic 未设这两个 view props（CSS 无法触及）。CSS-only 可靠杠杆是给内容元素加大底部 padding。

## Requirements

1. `src/keystatic/draft-workflow.ts`：`findHeaderActionsHost()` 兜底选择器改为 `main` 下的 `:scope > header`（或等价的仅认 header 的写法）；无 header 时返回 null。不改变已加载页面上工具栏的挂载位置与顺序逻辑（native save 优先、#page-title 次之）。
2. `src/styles/keystatic-theme.css`：给主编辑区 ProseMirror 内容元素（`[data-keystatic-editor='root'][data-layout='main']` 下的 `[data-keystatic-editor='content']`，具体选择器以 research 文件为准）增加约 `33vh` 的 `padding-bottom`；给对应 `div[data-scrollable]` 滚动容器加 `scroll-padding-bottom`（对键盘导航等原生 scrollIntoView 场景生效）。遵循该文件既有的选择器约定（data-* / aria 属性，避免哈希类名）。
3. 不修改 node_modules / Keystatic 包内部；不引入新依赖。
4. 不影响其他后台页面（dashboard、集合列表、create 页已加载状态）的工具栏与滚动行为。

## Acceptance Criteria

- [ ] `findHeaderActionsHost()` 不再可能返回 spinner 容器：代码层面兜底只匹配 `header` 元素；`pnpm astro build` 通过。
- [ ] 主题 CSS 新增规则只作用于编辑器内容区（选择器含 `data-keystatic-editor`），编辑器底部 padding ≥ 30vh，滚动容器带 scroll-padding-bottom。
- [ ] `pnpm astro build` 与 `pnpm check` 结果与基线一致（既有 1 个 pre-existing ts(7016) 错误、router collision warning 不算新增）。
- [ ] 已知残余（记录即可，不阻塞）：ProseMirror 回车换行时自身滚动逻辑仍按 ~5px 边距计算，CSS 无法完全消除；padding 方案已让内容区随时有大段下方留白。
- [ ] 视觉最终确认由用户在部署后完成（本地无浏览器自动化）。

## Out of Scope

- 修改 ProseMirror view props（scrollMargin/scrollThreshold）——需要 patch Keystatic 内部，收益/风险比不划算。
- 后台其他视觉调整。
