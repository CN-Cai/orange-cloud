// OpenNext 生成的 .open-next/worker.js 只导出 fetch（+ 缓存层的 Durable Object 类），
// 没有 scheduled 处理器，故直接给 wrangler.jsonc 加 cron 触发后无处理器可调。
// 按 OpenNext 官方 custom-worker 方案（https://opennext.js.org/cloudflare/howtos/custom-worker）：
// 包一层入口 worker —— 复用生成的 fetch，补一个 scheduled() 跑每日榜单抓取，
// 并把 wrangler 的 main 指向本文件。沿用同一个 worker / 同一个 IAP_DB 绑定。
//
// 2026-08: 隐藏产品落地页。本 worker 仅保留 OAuth 回调中转（/oauth/callback，
// 登录必需），其余路径一律重定向到项目 GitHub 仓库，不再对外展示网页。

// @ts-ignore .open-next/worker.js 在 `opennextjs-cloudflare build` 时生成
import { default as handler } from "./.open-next/worker.js";
import { captureRanks } from "./src/lib/ranks/capture";

const REDIRECT_TARGET = "https://github.com/CN-Cai/orange-cloud";

export default {
	fetch(request, env, ctx) {
		const url = new URL(request.url);
		// 仅放行 OAuth 回调（登录流程依赖）；其余路径隐藏网页。
		if (url.pathname === "/oauth/callback") {
			return handler.fetch(request, env, ctx);
		}
		return Response.redirect(REDIRECT_TARGET, 302);
	},

	// 每天 UTC 08:00（wrangler.jsonc triggers.crons）抓 App Store 各地区榜单名次入 D1。
	async scheduled(_controller, env, ctx) {
		ctx.waitUntil(captureRanks(env.IAP_DB));
	},
} satisfies ExportedHandler<CloudflareEnv>;

// 再导出生成 worker 的 Durable Object 类（OpenNext 缓存层用；全量再导出以兼容后续启用缓存）。
// @ts-ignore .open-next/worker.js 在 build 时生成
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
