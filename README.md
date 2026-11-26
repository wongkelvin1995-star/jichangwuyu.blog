# 机场物语 · Airport Monogatari (jichangwuyu.blog)

**MONOGATARI WORLD MAX** 旗舰中文机场品牌研究、套餐消费分析与长期服务观察博客。

## 技术栈
- Astro 5 (SSG 静态站点生成)
- Preact (轻量交互岛：搜索联想、订阅手账、消费分析器、历史价格筛选、我的物语)
- TypeScript + 原创 SVG 矢量美术系统

## 常用命令
- `npm run dev` — 本地开发服务器
- `npm run build` — 生产环境静态构建 (`dist/`)
- `npm run preview` — 预览生产构建

## 目录结构
- `content/brands/` — 18 家品牌原始 MD 档案与总索引
- `data/` — 统一结构化 JSON 数据库 (`brands/`, `plans/`, `coupons/`, `price-history/`, `service-events/`, `evidence/`, `seo-keywords.json`)
- `src/components/art/` — 原创角色 YUMERIA · 梦璃（8种立绘）、LUMO · 星语精灵及十大幻想世界 SVG
- `src/pages/` — 首页 28 模块、18 家品牌 26 节档案、30 篇深度文章、10 大独家功能、200+15 SEO 专题与技术 SEO 端点
