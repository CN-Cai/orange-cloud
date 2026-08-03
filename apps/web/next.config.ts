import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	// 单一数据源 changelog 包是 TS 源码（导出 ios.json/android.json + 类型），需 Next 转译。
	transpilePackages: ["@orange-cloud/changelog"],
	// 截图与图标都已按展示尺寸预缩放（2x JPEG/PNG），直接静态托管，
	// 不依赖 Cloudflare Images 做运行时优化。
	images: {
		unoptimized: true,
	},
};

export default withNextIntl(nextConfig);

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 只在 `next dev` 下初始化本地 wrangler 上下文；`next build`（SSG/Cloudflare Pages）
// 不连接 remote 代理，否则未登录的构建环境会直接失败。
if (process.env.NODE_ENV !== "production") {
	initOpenNextCloudflareForDev();
}
