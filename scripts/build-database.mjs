import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexMdPath = path.join(root, 'content', 'brands', '00_18家品牌资料总索引.md');
const corpusPath = path.resolve(root, '..', 'jichang-pianyi.blog', 'source-materials', 'verified-corpus.json');

const indexMd = fs.readFileSync(indexMdPath, 'utf-8');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));

// Exact 18 brands in user-requested order
const brandOrder = [
  { nameMatch: '灵动云', slug: 'lingdongyun', displayName: '灵动云', nameEn: 'LingDongYun' },
  { nameMatch: '暮光加速', slug: 'muguang-jiasu', displayName: '暮光加速', nameEn: 'Twilight' },
  { nameMatch: '微风网络 Breezenet', slug: 'weifeng-wangluo', displayName: '微风网络 Breezenet', nameEn: 'Breezenet' },
  { nameMatch: '飞猫云', slug: 'feimaoyun', displayName: '飞猫云', nameEn: 'FlyCat' },
  { nameMatch: '光速云 LightSpeed', slug: 'guangsuyun', displayName: '光速云 LightSpeed（原大佬云）', nameEn: 'LightSpeed' },
  { nameMatch: '飞V（FlyV）', slug: 'flyv', displayName: '飞V（FlyV）', nameEn: 'FlyV' },
  { nameMatch: '浪网 WaveNet', slug: 'langwang', displayName: '浪网 WaveNet', nameEn: 'WaveNet' },
  { nameMatch: '隐形人', slug: 'yinxingren', displayName: '隐形人', nameEn: 'InvisibleMan' },
  { nameMatch: '梯子云 LadderCloud', slug: 'tiziyun', displayName: '梯子云 LadderCloud', nameEn: 'LadderCloud' },
  { nameMatch: '无忧链接', slug: 'wuyou', displayName: '无忧链接', nameEn: 'WorryFree' },
  { nameMatch: '飞为（Firefly）', slug: 'firefly', displayName: '飞为（Firefly）', nameEn: 'Firefly' },
  { nameMatch: '全球云', slug: 'quanqiuyun', displayName: '全球云', nameEn: 'GlobalCloud' },
  { nameMatch: '唯兔云（V2云）', slug: 'weituyun', displayName: '唯兔云（V2云）', nameEn: 'OnlyRabbit / V2Yun' },
  { nameMatch: 'U1S1（有一说一）', slug: 'u1s1', displayName: 'U1S1（有一说一）', nameEn: 'U1S1' },
  { nameMatch: 'Sogo云', slug: 'sogoyun', displayName: 'Sogo云', nameEn: 'Sogo Cloud' },
  { nameMatch: '灵猫', slug: 'lingmao', displayName: '灵猫', nameEn: 'CivetNet' },
  { nameMatch: '闪跃 FlashLeap', slug: 'shanyue', displayName: '闪跃 FlashLeap', nameEn: 'FlashLeap' },
  { nameMatch: '跨界', slug: 'kuajie', displayName: '跨界', nameEn: 'Kuajie' },
];

// Parse markdown table from 00_18家品牌资料总索引.md
const tableRows = new Map();
for (const line of indexMd.split(/\r?\n/)) {
  if (!line.startsWith('|')) continue;
  const cols = line.split('|').map((c) => c.trim()).slice(1, -1);
  if (cols.length < 8 || cols[0] === '品牌' || cols[0].startsWith('---')) continue;
  tableRows.set(cols[0], {
    rawName: cols[0],
    couponCode: cols[1],
    affiliateUrl: cols[2],
    historicalRecordCount: Number(cols[3]) || 0,
    historicalPriceDate: cols[4],
    couponEvidenceNature: cols[5],
    priceSourceUrl: cols[6],
    archiveFile: cols[7],
  });
}

const corpusBrands = new Map(corpus.brands.map((b) => [b.slug, b]));
const corpusPlans = new Map(corpus.plans.map((p) => [p.brandId, p]));

const brands = [];
const flatPlans = [];
const coupons = [];
const priceHistory = [];
const serviceEvents = [];
const evidenceItems = [];

brandOrder.forEach((meta, idx) => {
  const row = tableRows.get(meta.nameMatch);
  if (!row) throw new Error(`Missing row in index MD for ${meta.nameMatch}`);
  const cb = corpusBrands.get(meta.slug);
  if (!cb) throw new Error(`Missing brand in verified-corpus.json for ${meta.slug}`);
  const cp = corpusPlans.get(meta.slug);
  if (!cp) throw new Error(`Missing plans in verified-corpus.json for ${meta.slug}`);

  // Merge brand with strict preservation of user's AFF link and coupon code from 00_18家品牌资料总索引.md
  const brand = {
    order: idx + 1,
    id: meta.slug,
    slug: meta.slug,
    name: meta.displayName,
    shortName: cb.name,
    nameEn: cb.nameEn || meta.nameEn,
    aliases: cb.aliases || [],
    tagline: cb.tagline,
    summary: cb.summary,
    audiences: cb.audiences || [],
    storyPath: `/stories/${meta.slug}/`,
    archivePath: `/archives/${meta.slug}/`,
    affiliateUrl: row.affiliateUrl, // STRICTLY from 00_18家品牌资料总索引.md
    officialUrl: cb.officialUrl || null,
    relationship: 'sponsored',
    coupon: {
      ...(cb.coupon || {}),
      code: row.couponCode, // STRICTLY from 00_18家品牌资料总索引.md
      evidenceNature: row.couponEvidenceNature,
    },
    regions: cb.regions || [],
    nodeCount: cb.nodeCount ?? null,
    nodeCountNote: cb.nodeCountNote ?? null,
    nodeCountByRegion: cb.nodeCountByRegion ?? null,
    lineTypes: cb.lineTypes || [],
    ratio: cb.ratio || '以官网结算页与节点列表为准',
    deviceLimit: cb.deviceLimit || '以品牌官方最新规则为准',
    supportedPlatforms: cb.supportedPlatforms || null,
    clientPolicy: cb.clientPolicy || [],
    streaming: cb.streaming || [],
    aiTools: cb.aiTools || [],
    otherServices: cb.otherServices || [],
    streamingNote: cb.streamingNote || '流媒体与 AI 工具可用性受目标平台策略影响，不作长期保证。',
    trafficRules: cb.trafficRules || [],
    support: cb.support || [],
    purchaseSteps: cb.purchaseSteps || [],
    dataStatus: cb.dataStatus || 'verified',
    verifiedAt: cb.verifiedAt || '2026-11-25',
    materialDate: cb.materialDate || '2026-11-25',
    historicalRecordCount: row.historicalRecordCount,
    historicalPriceDate: row.historicalPriceDate,
    priceSourceUrl: row.priceSourceUrl,
    sources: cb.sources || [],
    externalSources: cb.externalSources || [],
    verificationNotes: cb.verificationNotes || [],
    conflicts: cb.conflicts || [],
    caveats: cb.caveats || [],
    marketingClaims: cb.marketingClaims || [],
    planGroup: cp,
  };

  brands.push(brand);

  // Flatten plans
  const addPlan = (category, item, cycleOverride) => {
    if (item.prices) {
      for (const [cycle, price] of Object.entries(item.prices)) {
        if (typeof price !== 'number') continue;
        const monthsMap = { monthly: 1, quarterly: 3, 'half-year': 6, yearly: 12, 'two-year': 24, 'three-year': 36 };
        const months = monthsMap[cycle] || 1;
        flatPlans.push({
          id: `${meta.slug}-${item.plan}-${cycle}`,
          brandId: meta.slug,
          brandName: meta.displayName,
          category,
          planName: item.plan,
          cycle,
          months,
          price,
          monthlyEquivalent: Number((price / months).toFixed(2)),
          trafficGb: item.trafficGb ?? null,
          pricePerGb: item.trafficGb ? Number((price / (item.trafficGb * months)).toFixed(3)) : null,
          notes: item.notes || [],
          source: cp.source,
          verifiedAt: cp.verifiedAt,
        });
      }
    } else if (typeof item.price === 'number') {
      const cycle = cycleOverride || item.cycle || 'one-time';
      const months = cycle === 'yearly' ? 12 : cycle === 'monthly' ? 1 : null;
      flatPlans.push({
        id: `${meta.slug}-${item.plan}-${cycle}`,
        brandId: meta.slug,
        brandName: meta.displayName,
        category,
        planName: item.plan,
        cycle,
        months,
        price: item.price,
        monthlyEquivalent: months ? Number((item.price / months).toFixed(2)) : null,
        trafficGb: item.trafficGb ?? null,
        pricePerGb: item.trafficGb ? Number((item.price / (item.trafficGb * (months || 1))).toFixed(3)) : null,
        notes: item.notes || [],
        source: cp.source,
        verifiedAt: cp.verifiedAt,
      });
    }
  };

  (cp.periodic || []).forEach((p) => addPlan('periodic', p));
  (cp.yearlySmall || []).forEach((p) => addPlan('yearlySmall', p, 'yearly'));
  (cp.dataPacks || []).forEach((p) => addPlan('dataPack', p, 'one-time'));
  (cp.custom || []).forEach((p) => addPlan('custom', p));

  // Coupon entry
  coupons.push({
    brandId: meta.slug,
    brandName: meta.displayName,
    code: row.couponCode,
    discount: cb.coupon?.discount || '以结算页实际抵扣为准',
    appliesTo: cb.coupon?.appliesTo || [],
    excludes: cb.coupon?.excludes || [],
    usage: cb.coupon?.usage || '结算页优惠码栏填写',
    note: cb.coupon?.note || '',
    evidenceNature: row.couponEvidenceNature,
    affiliateUrl: row.affiliateUrl,
    verifiedAt: brand.verifiedAt,
  });

  // Price history entry (strictly factual: index snapshot + dossier baseline)
  priceHistory.push({
    id: `${meta.slug}-hist-index`,
    brandId: meta.slug,
    brandName: meta.displayName,
    recordedDate: row.historicalPriceDate,
    recordType: 'historical-public-record',
    priceCategory: '历史公开价格索引',
    recordCountInIndex: row.historicalRecordCount,
    sourceUrl: row.priceSourceUrl,
    note: `总索引记录 ${row.historicalRecordCount} 条历史公开价格条目（快照日期 ${row.historicalPriceDate}），仅作历史参照，不代表当日结算实证。`,
    comparableSeriesAvailable: false,
  });

  if (cp.periodic && cp.periodic.length > 0) {
    const starter = cp.periodic[0];
    if (typeof starter.prices?.monthly === 'number') {
      priceHistory.push({
        id: `${meta.slug}-current-baseline`,
        brandId: meta.slug,
        brandName: meta.displayName,
        recordedDate: cp.verifiedAt || brand.verifiedAt,
        recordType: 'dossier-baseline',
        priceCategory: '档案核验周期起步价',
        planName: starter.plan,
        trafficGb: starter.trafficGb,
        cycle: 'monthly',
        price: starter.prices.monthly,
        sourceUrl: cp.source,
        note: `基于品牌原始资料（${cp.source}）整理的基础周期套餐月付公开标价。`,
        comparableSeriesAvailable: false,
      });
    }
  }

  // Service events (only verified material collection / policy / conflict observations — zero fabricated outages)
  serviceEvents.push({
    id: `${meta.slug}-evt-collection`,
    brandId: meta.slug,
    brandName: meta.displayName,
    eventDate: row.historicalPriceDate,
    collectedAt: '2026-11-25',
    category: '首次资料采集与价格快照',
    title: `${meta.displayName} 公开价格与优惠资料首次归档`,
    summary: `收录自公开历史价格索引（${row.historicalRecordCount} 条价格记录），优惠码 ${row.couponCode}（${row.couponEvidenceNature}）。`,
    sourceUrl: row.priceSourceUrl,
    evidenceType: '历史公开记录',
    verificationStatus: '已核验归档',
    impactScope: '套餐价格与优惠规则',
    correctionNote: null,
  });

  if (cb.conflicts && cb.conflicts.length > 0) {
    serviceEvents.push({
      id: `${meta.slug}-evt-conflict`,
      brandId: meta.slug,
      brandName: meta.displayName,
      eventDate: brand.verifiedAt,
      collectedAt: '2026-11-25',
      category: '资料冲突与规则边界观察',
      title: `${meta.displayName} 公开资料存在规则缺口或版本差异`,
      summary: cb.conflicts.join('；'),
      sourceUrl: row.priceSourceUrl,
      evidenceType: '编辑交叉核对',
      verificationStatus: '待品牌官方进一步澄清',
      impactScope: '订阅政策 / 优惠适用范围 / 退款说明',
      correctionNote: '如服务商发布最新官方公告，可通过纠错入口提交更新。',
    });
  }

  // Evidence center entry
  evidenceItems.push({
    id: `${meta.slug}-ev-main`,
    brandId: meta.slug,
    brandName: meta.displayName,
    evidenceTag: row.couponEvidenceNature.includes('品牌公开') ? '官方资料' : '历史公开记录',
    title: `${meta.displayName} 品牌档案与套餐价格依据`,
    date: brand.verifiedAt,
    sources: [...(cb.sources || []), row.priceSourceUrl].filter(Boolean),
    verificationNotes: cb.verificationNotes || [],
    conflicts: cb.conflicts || [],
    caveats: cb.caveats || [],
    hasLiveSpeedTest: false,
    speedTestNote: '本站（机场物语）定位为品牌研究与消费档案，未收录独立测速实证；节点测速参考请以专门实测平台为准。',
  });
});

fs.writeFileSync(path.join(root, 'data', 'brands', 'index.json'), JSON.stringify(brands, null, 2), 'utf-8');
fs.writeFileSync(path.join(root, 'data', 'plans', 'index.json'), JSON.stringify(flatPlans, null, 2), 'utf-8');
fs.writeFileSync(path.join(root, 'data', 'coupons', 'index.json'), JSON.stringify(coupons, null, 2), 'utf-8');
fs.writeFileSync(path.join(root, 'data', 'price-history', 'index.json'), JSON.stringify(priceHistory, null, 2), 'utf-8');
fs.writeFileSync(path.join(root, 'data', 'service-events', 'index.json'), JSON.stringify(serviceEvents, null, 2), 'utf-8');
fs.writeFileSync(path.join(root, 'data', 'evidence', 'index.json'), JSON.stringify(evidenceItems, null, 2), 'utf-8');

console.log(JSON.stringify({
  brands: brands.length,
  flatPlans: flatPlans.length,
  coupons: coupons.length,
  priceHistory: priceHistory.length,
  serviceEvents: serviceEvents.length,
  evidenceItems: evidenceItems.length,
}, null, 2));
