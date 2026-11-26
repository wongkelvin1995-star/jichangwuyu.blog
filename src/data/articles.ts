import { planResearchArticles } from './plan-articles';

export interface ArticleItem {
  id: number;
  slug: string;
  title: string;
  template: '套餐消费研究' | '网络技术与证据研究' | '用户场景与应用物语' | '服务观察与风险档案';
  publishedAt: string;
  updatedAt: string;
  summary: string;
  relatedTool: { label: string; href: string };
  relatedTopic: { label: string; href: string };
  sections: Array<{ heading: string; body: string }>;
}

const rawTopics: Array<[string, string, ArticleItem['template'], string, string, string]> = [
  ['2027-airport-plan-buying-guide', '2027机场套餐选购指南：从短期消费到长期使用', '套餐消费研究', '梳理从月付试错到长期订阅的完整决策链路，避免只看宣传月价。', '/tools/value-analyzer/', '/plans/'],
  ['how-to-verify-brand-history', '机场品牌历史资料应该如何判断真实性？', '服务观察与风险档案', '区分官方公告、第三方快照与尚未核验的传闻，建立可追溯的资料判断框架。', '/archives/', '/evidence/'],
  ['why-airport-plans-change-price', '机场套餐价格为什么会发生变化？', '套餐消费研究', '从上游专线成本、汇率波动与运营周期角度拆解调价原因。', '/price-history/', '/price-history/'],
  ['monthly-vs-yearly-actual-cost', '月付机场与年付机场的实际消费区别', '套餐消费研究', '对比资金占用、灵活性与折合月均价，明确不同预算的试错边界。', '/tools/value-analyzer/', '/plans/monthly-vs-yearly/'],
  ['10-yuan-airport-plan-limits', '10元机场套餐究竟需要关注哪些限制？', '套餐消费研究', '拆解低价入门档常见的前置条件：年付折算、流量上限与设备数限制。', '/tools/value-analyzer/', '/plans/budget-tiers/'],
  ['under-20-yuan-true-cost', '20元以内机场套餐如何比较真实成本？', '套餐消费研究', '结合本站18家品牌月付20元以内实录数据，核算每GB有效单价。', '/tools/value-analyzer/', '/plans/budget/'],
  ['one-time-vs-periodic-plans', '一次性流量套餐与周期套餐有什么区别？', '套餐消费研究', '对比月度重置与按量不限时包在轻度/备用场景下的资金效率。', '/tools/value-analyzer/', '/plans/one-time-traffic/'],
  ['unlimited-time-data-pack-truth', '不限时流量包真的可以一直使用吗？', '套餐消费研究', '提示购买不限时流量包前必查的长期未登录回收与优惠码排除条款。', '/coupons/', '/plans/one-time-traffic/'],
  ['pay-as-you-go-suitability', '按量付费机场适合什么样的用户？', '用户场景与应用物语', '分析低频出差、备用线路与突发大流量需求下的按量计费优势。', '/tools/subscription-calendar/', '/plans/pay-as-you-go/'],
  ['calculate-real-cost-per-gb', '如何计算机场套餐的每GB实际成本？', '套餐消费研究', '详解整期实付金额、有效月数与节点流量倍率联动计算公式。', '/tools/value-analyzer/', '/plans/multiplier/'],
  ['traffic-multiplier-long-term-impact', '机场流量倍率对长期消费有什么影响？', '套餐消费研究', '以1x与2x/3x倍率对比为例，说明高倍率节点如何使实际单价翻倍。', '/tools/value-analyzer/', '/plans/multiplier/'],
  ['why-coupons-may-fail', '机场优惠码为什么可能无法使用？', '套餐消费研究', '总结优惠码失效常见原因：排除年付小包、限首购或名额已满。', '/coupons/', '/coupons/'],
  ['pre-renewal-policy-checklist', '机场续费前必须确认的服务政策', '服务观察与风险档案', '核对续费是否恢复原价、套餐是否已改版以及剩余流量结转规则。', '/tools/subscription-calendar/', '/plans/renewal/'],
  ['plan-upgrade-terms-check', '机场套餐升级前应该检查哪些条款？', '套餐消费研究', '升级前确认折算补差价方式、周期重置逻辑与现有优惠折扣保留情况。', '/tools/value-analyzer/', '/plans/upgrade/'],
  ['yearly-plan-prepayment-risks', '机场年付套餐可能存在哪些预付风险？', '服务观察与风险档案', '分析预付资金不可退还、品牌政策变更与长期服务连续性风险。', '/risk/', '/risk/service-continuity/'],
  ['judge-long-term-reliability', '如何判断机场服务是否具有长期可靠性？', '服务观察与风险档案', '通过公告透明度、历史记录连续性与客服工单响应评估服务稳定度。', '/archives/', '/recommend/reliability/'],
  ['identify-fake-official-websites', '如何识别真假机场官网与仿冒注册页面？', '服务观察与风险档案', '警惕高仿域名与虚假下载站，优先核对历史发布页与官方客户端内链。', '/risk/', '/risk/website-verification/'],
  ['outage-vs-shutdown-distinction', '机场服务突然异常是否意味着停止运营？', '服务观察与风险档案', '区分域名更换、上游维护与真正停运，避免仅凭单次断连恐慌。', '/observations/', '/risk/service-continuity/'],
  ['how-to-read-refund-policy', '机场退款政策怎么看？购买前的检查指南', '服务观察与风险档案', '解析虚拟网络服务常见的激活后不退条款与余额退回限制。', '/risk/', '/risk/refund-policy/'],
  ['protect-subscription-url-privacy', '如何保护自己的机场订阅链接与个人隐私？', '服务观察与风险档案', '说明订阅Token泄露风险、在线转换工具隐患与本地手账安全原则。', '/profile/', '/risk/privacy-security/'],
  ['iepl-vs-iplc-myths', 'IEPL与IPLC线路区别及常见宣传误区', '网络技术与证据研究', '客观解释跨境专线技术概念，破除“有专线就一定满速”的宣传误区。', '/nodes/', '/nodes/dedicated-lines/'],
  ['direct-relay-bgp-explained', '机场直连、中转与BGP线路知识', '网络技术与证据研究', '对比公网直连与BGP中转在跨运营商晚高峰调度中的技术差异。', '/nodes/', '/nodes/direct-vs-relay/'],
  ['how-to-read-speed-test-report', '如何阅读一份真实的机场测速报告？', '网络技术与证据研究', '拆解测速报告必备要素：测试日期、地区、本地宽带运营商与样本量。', '/evidence/', '/test/report-analysis/'],
  ['why-single-speed-test-not-enough', '为什么单次测速不能证明长期稳定性？', '网络技术与证据研究', '说明闲时与晚高峰负载差异，解释连续多日多时段观测的必要性。', '/evidence/', '/test/stability-method/'],
  ['region-node-selection-criteria', '不同地区节点的服务条件与选择依据', '网络技术与证据研究', '梳理港台日新美韩欧节点在物理延迟、流媒体库与AI风控上的差异。', '/nodes/', '/nodes/region-selection/'],
  ['client-update-compatibility-issues', '客户端更新后为什么可能出现兼容问题？', '用户场景与应用物语', '分析Clash/Mihomo/sing-box内核语法迭代与系统TUN权限变更影响。', '/search/', '/clients/'],
  ['subscription-policy-changes-impact', '机场订阅政策变化对老用户有什么影响？', '服务观察与风险档案', '观察官方客户端强制化、第三方订阅申请门槛调整对老用户的长期影响。', '/observations/', '/observations/'],
  ['how-to-verify-ai-tool-support', 'AI工具支持资料应该如何核验？', '用户场景与应用物语', '解释ChatGPT/Claude/Gemini对IP纯净度与地区风控的动态要求。', '/evidence/', '/applications/ai/'],
  ['why-streaming-availability-changes', '流媒体服务可用性为什么可能发生变化？', '用户场景与应用物语', '说明Netflix与Disney+反代理检测周期波动，不将历史解锁作永久保证。', '/evidence/', '/applications/streaming/'],
  ['build-personal-subscription-journal', '如何建立自己的机场消费及续费记录？', '用户场景与应用物语', '演示如何利用本地订阅手账追踪每期实付、实际到期日与年度总支出。', '/tools/subscription-calendar/', '/tools/subscription-calendar/'],
];

const baseArticles: ArticleItem[] = rawTopics.map(([slug, title, template, summary, toolHref, topicHref], idx) => ({
  id: idx + 1,
  slug,
  title,
  template,
  publishedAt: '2026-11-25',
  updatedAt: '2026-11-26',
  summary,
  relatedTool: { label: '打开对应实用工具', href: toolHref },
  relatedTopic: { label: '查看相关专题', href: topicHref },
  sections: [
    {
      heading: '一、研究背景与核心问题',
      body: `${summary}在机场物语（jichangwuyu.blog）的消费研究体系中，我们始终强调将“公开规则”“实付金额”与“长期变化”放在同一框架下审视，而不是孤立地看待某一句宣传语或某一次短期促销。`,
    },
    {
      heading: '二、关键规则与数据核对维度',
      body: `无论您正在比较月付、季付、年付还是不限时流量包，都建议在下单前依次核对四项事实：第一，优惠码是否存在排除档位与首购限制；第二，全节点是否采用统一 1x 倍率，还是部分地区存在高倍率扣费；第三，客户端是否支持您常用的第三方内核（如 Mihomo / sing-box / Shadowrocket），或是否仅限官方客户端；第四，服务商公开的流量重置日与退款边界。`,
    },
    {
      heading: '三、证据边界与消费建议',
      body: `本站所有分析均基于截至 2026 年 11 月可核验的公开品牌资料整理，不虚构作者个人测速数据或真实用户评价。对于首次接触的服务商，建议先从短周期档位验证本地网络环境适配度，并通过个人订阅手账持续记录实际续费成本。`,
    },
  ],
}));

export const articles: ArticleItem[] = [...baseArticles, ...planResearchArticles];

export function getArticleBySlug(slug: string): ArticleItem | undefined {
  return articles.find((a) => a.slug === slug);
}
