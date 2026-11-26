import { useMemo, useState } from 'preact/hooks';
import type { PlanRecord, PriceHistoryRecord } from '../../lib/db';

interface Props {
  plans: PlanRecord[];
  historyRecords: PriceHistoryRecord[];
}

export default function PriceHistoryExplorer({ plans, historyRecords }: Props) {
  const [brandFilter, setBrandFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [minTraffic, setMinTraffic] = useState('0');

  const brandOptions = useMemo(() => {
    const map = new Map<string, string>();
    plans.forEach((p) => map.set(p.brandId, p.brandName));
    return Array.from(map.entries());
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const minGb = Number(minTraffic) || 0;
    return plans.filter((p) => {
      if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;
      if (cycleFilter !== 'all' && p.cycle !== cycleFilter) return false;
      if (minGb > 0 && (p.trafficGb || 0) < minGb) return false;
      return true;
    });
  }, [plans, brandFilter, cycleFilter, minTraffic]);

  const filteredHistory = useMemo(() => {
    return historyRecords.filter((h) => brandFilter === 'all' || h.brandId === brandFilter);
  }, [historyRecords, brandFilter]);

  return (
    <div>
      <div class="story-card" style="margin-bottom:20px;">
        <h2 style="font-size:18px;margin-bottom:12px;">筛选真实套餐与历史快照</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;">
          <label style="display:grid;gap:6px;font-size:13px;">
            <span>按品牌筛选</span>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter((e.target as HTMLSelectElement).value)}
              style="padding:9px 12px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            >
              <option value="all">全部 18 家品牌</option>
              {brandOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </label>

          <label style="display:grid;gap:6px;font-size:13px;">
            <span>按付款周期筛选</span>
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter((e.target as HTMLSelectElement).value)}
              style="padding:9px 12px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            >
              <option value="all">全部周期</option>
              <option value="monthly">月付 (monthly)</option>
              <option value="quarterly">季付 (quarterly)</option>
              <option value="half-year">半年付 (half-year)</option>
              <option value="yearly">年付 (yearly)</option>
              <option value="one-time">一次性流量包 (one-time)</option>
            </select>
          </label>

          <label style="display:grid;gap:6px;font-size:13px;">
            <span>最低月/包流量（GB）</span>
            <select
              value={minTraffic}
              onChange={(e) => setMinTraffic((e.target as HTMLSelectElement).value)}
              style="padding:9px 12px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            >
              <option value="0">不限</option>
              <option value="100">≥ 100 GB</option>
              <option value="300">≥ 300 GB</option>
              <option value="500">≥ 500 GB</option>
            </select>
          </label>
        </div>
      </div>

      <div class="story-card" style="margin-bottom:20px;">
        <h3 style="font-size:17px;margin-bottom:8px;">历史价格索引快照（{filteredHistory.length} 条）</h3>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">
          注：仅当同套餐身份、流量额度与计费周期完全可比时才绘制连续走势图；单点快照仅作历史参照展示。
        </p>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>品牌</th>
                <th>记录日期</th>
                <th>记录性质</th>
                <th>说明</th>
                <th>来源</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.slice(0, 36).map((h) => (
                <tr key={h.id}>
                  <td><a href={`/stories/${h.brandId}/`}>{h.brandName}</a></td>
                  <td>{h.recordedDate}</td>
                  <td>{h.priceCategory}</td>
                  <td>{h.note}</td>
                  <td>{h.sourceUrl.startsWith('http') ? <a href={h.sourceUrl} target="_blank" rel="noopener noreferrer">索引来源 ↗</a> : h.sourceUrl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div class="story-card">
        <h3 style="font-size:17px;margin-bottom:10px;">当前档案核验套餐明细（共 {filteredPlans.length} 项）</h3>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>品牌</th>
                <th>套餐</th>
                <th>周期</th>
                <th>公开标价</th>
                <th>折合月均</th>
                <th>流量</th>
                <th>每 GB 成本</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.slice(0, 80).map((p) => (
                <tr key={p.id}>
                  <td><a href={`/stories/${p.brandId}/`}>{p.brandName}</a></td>
                  <td>{p.planName}</td>
                  <td>{p.cycle}</td>
                  <td>¥{p.price}</td>
                  <td>{p.monthlyEquivalent !== null ? `¥${p.monthlyEquivalent}/月` : '一次性'}</td>
                  <td>{p.trafficGb ? `${p.trafficGb} GB` : '—'}</td>
                  <td>{p.pricePerGb ? `¥${p.pricePerGb}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
