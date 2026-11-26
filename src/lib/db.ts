import brandsData from '../../data/brands/index.json';
import plansData from '../../data/plans/index.json';
import couponsData from '../../data/coupons/index.json';
import priceHistoryData from '../../data/price-history/index.json';
import serviceEventsData from '../../data/service-events/index.json';
import evidenceData from '../../data/evidence/index.json';
import seoKeywordsData from '../../data/seo-keywords.json';

export interface BrandRecord {
  order: number;
  id: string;
  slug: string;
  name: string;
  shortName: string;
  nameEn: string;
  aliases: string[];
  tagline: string;
  summary: string;
  audiences: string[];
  storyPath: string;
  archivePath: string;
  affiliateUrl: string;
  officialUrl: string | null;
  relationship: string;
  coupon: {
    code: string;
    discount?: string;
    appliesTo?: string[];
    excludes?: string[];
    usage?: string;
    note?: string;
    evidenceNature?: string;
  };
  regions: string[];
  nodeCount: number | null;
  nodeCountNote: string | null;
  nodeCountByRegion: Record<string, number> | null;
  lineTypes: string[];
  ratio: string;
  deviceLimit: string;
  supportedPlatforms: string[] | null;
  clientPolicy: string[];
  streaming: string[];
  aiTools: string[];
  otherServices: string[];
  streamingNote: string;
  trafficRules: string[];
  support: string[];
  purchaseSteps: string[];
  dataStatus: string;
  verifiedAt: string;
  materialDate: string;
  historicalRecordCount: number;
  historicalPriceDate: string;
  priceSourceUrl: string;
  sources: string[];
  externalSources: Array<{ label?: string; url?: string } | string>;
  verificationNotes: string[];
  conflicts: string[];
  caveats: string[];
  marketingClaims: string[];
  planGroup: {
    brandId: string;
    source: string;
    materialDate: string;
    priceStatus: string;
    verifiedAt: string;
    lineType?: string;
    devices?: string;
    cycleDiscounts?: string;
    periodic?: Array<{
      plan: string;
      trafficGb: number | null;
      prices: Record<string, number>;
      notes?: string[];
    }>;
    yearlySmall?: Array<{
      plan: string;
      trafficGb: number | null;
      price: number;
      notes?: string[];
    }>;
    dataPacks?: Array<{
      plan: string;
      trafficGb: number | null;
      price: number;
      notes?: string[];
    }>;
    custom?: Array<{
      plan: string;
      trafficGb: number | null;
      price: number;
      cycle?: string;
      notes?: string[];
    }>;
    notes?: string[];
  };
}

export interface PlanRecord {
  id: string;
  brandId: string;
  brandName: string;
  category: string;
  planName: string;
  cycle: string;
  months: number | null;
  price: number;
  monthlyEquivalent: number | null;
  trafficGb: number | null;
  pricePerGb: number | null;
  notes: string[];
  source: string;
  verifiedAt: string;
}

export interface CouponRecord {
  brandId: string;
  brandName: string;
  code: string;
  discount: string;
  appliesTo: string[];
  excludes: string[];
  usage: string;
  note: string;
  evidenceNature: string;
  affiliateUrl: string;
  verifiedAt: string;
}

export interface PriceHistoryRecord {
  id: string;
  brandId: string;
  brandName: string;
  recordedDate: string;
  recordType: string;
  priceCategory: string;
  recordCountInIndex?: number;
  planName?: string;
  trafficGb?: number | null;
  cycle?: string;
  price?: number;
  sourceUrl: string;
  note: string;
  comparableSeriesAvailable: boolean;
}

export interface ServiceEventRecord {
  id: string;
  brandId: string;
  brandName: string;
  eventDate: string;
  collectedAt: string;
  category: string;
  title: string;
  summary: string;
  sourceUrl: string;
  evidenceType: string;
  verificationStatus: string;
  impactScope: string;
  correctionNote: string | null;
}

export interface EvidenceRecord {
  id: string;
  brandId: string;
  brandName: string;
  evidenceTag: string;
  title: string;
  date: string;
  sources: string[];
  verificationNotes: string[];
  conflicts: string[];
  caveats: string[];
  hasLiveSpeedTest: boolean;
  speedTestNote: string;
}

export interface SeoKeywordRecord {
  id: string;
  keyword: string;
  targetUrl: string;
  intent: string;
  cluster: string;
  priority: string;
  publishStatus: string;
  verificationStatus: string;
}

export const brands = brandsData as BrandRecord[];
export const plans = plansData as PlanRecord[];
export const coupons = couponsData as CouponRecord[];
export const priceHistory = priceHistoryData as PriceHistoryRecord[];
export const serviceEvents = serviceEventsData as ServiceEventRecord[];
export const evidenceItems = evidenceData as EvidenceRecord[];
export const seoKeywords = seoKeywordsData as SeoKeywordRecord[];

export function getBrandBySlug(slug: string): BrandRecord | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getSiteStats() {
  const totalIndexHistoryCount = brands.reduce((acc, b) => acc + (b.historicalRecordCount || 0), 0);
  return {
    brandCount: brands.length,
    planRecordCount: plans.length,
    historicalPriceCount: totalIndexHistoryCount,
    verifiedEventCount: serviceEvents.length,
    articleCount: 110,
    toolCount: 10,
    latestVerifiedDate: '2026-11-26',
  };
}
