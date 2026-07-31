# Harden comments PEM normalization and env push script

## Goal

代码层防复发：容忍并杜绝「PEM 每行尾残留 `\`」这类环境变量坏格式，避免评论功能再次因私钥解析失败而 500。

## 背景（线上故障复盘）

2026-07-31 线上发表评论失败（`POST /api/comments` 返回 500「发表评论失败」）。

- 根因：Netlify 生产环境变量 `COMMENTS_GITHUB_PRIVATE_KEY` 的 PEM 每行末尾多了一个 `\`，OpenSSL 无法解析，`comments-token.ts` 的 `signer.sign()` 抛普通 Error（非 GitHubError），命中 `api/comments/index.ts` 的兜底 500。
- 坏值来源：`scripts/push-comments-env-to-netlify.mjs` 将本地值中的 `\n` 双重转义为 `\\n` 写入导入文件，而 `netlify env:import` 的 dotenv 解析把 `\n` 转成真换行、残留前导 `\`，每行变成 `xxx\<newline>`。
- 线上数据已于当日重新 `env:import`（单反斜杠 `\n` 形式）修复并验证（JWT 签名 OK → installation 200 → mint token 201 → issues read 200）。本任务只做代码层防复发。

## Requirements

- `src/lib/comments-token.ts` 的 `normalizePem` 容忍「`\` + 真换行」的坏格式：去掉紧邻换行符（或字符串末尾）前的孤立反斜杠。
- `scripts/push-comments-env-to-netlify.mjs` 移除双重转义根因：不再把 `\` 翻倍为 `\\`；值中的字面 `\n` 原样写入导入文件（netlify dotenv 解析会转为真换行，与运行时 `normalizePem` 兼容）。

## Non-goals

- 不改评论 API 的错误分类/响应结构；不改 OAuth 登录、Blobs 存储逻辑；不新增依赖。

## Acceptance Criteria

- [ ] `normalizePem` 对三种输入均产出可被 `crypto.createPrivateKey` 解析的 PEM：真换行 PEM、字面 `\n` 单行 PEM、每行尾带 `\` 的坏 PEM。
- [ ] push 脚本生成的导入文件中，PEM 换行以单反斜杠 `\n` 表示（无 `\\n`）。
- [ ] `pnpm check`（astro check）通过。

## Notes

- Lightweight task：PRD-only。
