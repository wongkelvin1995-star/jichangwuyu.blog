# SEO-CHECKLIST.md & Bing 站长工具运营说明

- [x] 每页独立 Title、Meta Description、唯一 H1 与 Canonical
- [x] `sitemap.xml` 仅包含 HTTP 200 且允许索引的页面（排除 `/search/`、`/profile/`、`/404`）
- [x] `robots.txt` 允许抓取并指向 `https://jichangwuyu.blog/sitemap.xml`
- [x] `BingSiteAuth.xml` 验证文件已就位（部署后填入实际验证码）
- [x] JSON-LD 结构化数据（`WebSite`、`Article`、`BreadcrumbList`，无虚假 `AggregateRating`）
- [ ] 部署至生产域名后，前往 https://www.bing.com/webmasters/ 添加站点、提交 Sitemap 并配置 IndexNow 密钥（仅提交真实新增或变更 URL）。
