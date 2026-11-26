import { useMemo, useState } from 'preact/hooks';
import type { PlanRecord } from '../../lib/db';

interface Props {
  plans: PlanRecord[];
  brandOrderMap: Record<string, number>;
}

const cycleLabels: Record<string, string> = {
  monthly: '月付',
  quarterly: '季付',
  'half-year': '半年付',
  yearly: '年付',
  'two-year': '两年付',
  'three-year': '三年付',
  'one-time': '一次性/不限时',
};

export default function PlanFilterSystem({ plans, brandOrderMap }: Props) {
  const [brandFilter, setBrandFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [trafficRange, setTrafficRange] = useState('all');
  const [monthlyCostRange, setMonthlyCostRange] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'traffic-desc' | 'monthly-asc'>('default');

  const brandOptions = useMemo(() => {
    const map = new Map<string, string>();
    plans.forEach((p) => map.set(p.brandId, p.brandName));
    return Array.from(map.entries()).sort((a, b) => (brandOrderMap[a[0]] || 99) - (brandOrderMap[b[0]] || 99));
  }, [plans, brandOrderMap]);

  const filtered = useMemo(() => {
    const list = plans.filter((p) => {
      if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;

      if (cycleFilter === 'long-term' && p.cycle !== 'two-year' && p.cycle !== 'three-year') return false;
      else if (cycleFilter === 'one-time-all' && p.cycle !== 'one-time' && p.category !== 'dataPack') return false;
      else if (cycleFilter !== 'all' && cycleFilter !== 'long-term' && cycleFilter !== 'one-time-all' && p.cycle !== cycleFilter) return false;

      if (priceRange === '0-20' && p.price > 20) return false;
      if (priceRange === '21-60' && (p.price <= 20 || p.price > 60)) return false;
      if (priceRange === '61-200' && (p.price <= 60 || p.price > 200)) return false;
      if (priceRange === '201+' && p.price <= 200) return false;

      const gb = p.trafficGb || 0;
      if (trafficRange === '0-100' && (gb === 0 || gb > 100)) return false;
      if (trafficRange === '101-300' && (gb <= 100 || gb > 300)) return false;
      if (trafficRange === '301-800' && (gb <= 300 || gb > 800)) return false;
      if (trafficRange === '801+' && gb <= 800) return false;

      if (monthlyCostRange !== 'all') {
        if (p.monthlyEquivalent === null) return false;
        if (monthlyCostRange === '0-15' && p.monthlyEquivalent > 15) return false;
        if (monthlyCostRange === '15-30' && (p.monthlyEquivalent <= 15 || p.monthlyEquivalent > 30)) return false;
        if (monthlyCostRange === '30+' && p.monthlyEquivalent <= 30) return false;
      }

      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'traffic-desc') {
      return [...list].sort((a, b) => (b.trafficGb || 0) - (a.trafficGb || 0));
    }
    if (sortBy === 'monthly-asc') {
      return [...list].sort((a, b) => (a.monthlyEquivalent ?? 99999) - (b.monthlyEquivalent ?? 99999));
    }
    return list;
  }, [plans, brandFilter, cycleFilter, priceRange, trafficRange, monthlyCostRange, sortBy]);

  return (
    <div class="story-card" style="display:grid;gap:16px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;">
        <label style="display:grid;gap:4px;font-size:13px;">
          <span>机场品牌</span>
          <select value={brandFilter} onChange={(e) => setBrandFilter((e.target as HTMLSelectElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="all">全部 18 家品牌</option>
            {brandOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>付款周期 / 类型</span>
          <select value={cycleFilter} onChange={(e) => setCycleFilter((e.target as HTMLSelectElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="all">全部周期与类型</option>
            <option value="monthly">月付套餐</option>
            <option value="quarterly">季付套餐</option>
            <option value="half-year">半年付套餐</option>
            <option value="yearly">年付套餐</option>
            <option value="long-term">两年付 / 三年付套餐</option>
            <option value="one-time-all">一次性 / 不限时流量套餐</option>
          </select>
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>整期付款范围</span>
          <select value={priceRange} onChange={(e) => setPriceRange((e.target as HTMLSelectElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="all">不限金额</option>
            <option value="0-20">¥20 以内</option>
            <option value="21-60">¥21 – ¥60</option>
            <option value="61-200">¥61 – ¥200</option>
            <option value="201+">¥200 以上</option>
          </select>
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>流量额度范围</span>
          <select value={trafficRange} onChange={(e) => setTrafficRange((e.target as HTMLSelectElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="all">不限流量</option>
            <option value="0-100">100 GB 以内</option>
            <option value="101-300">101 – 300 GB</option>
            <option value="301-800">301 – 800 GB</option>
            <option value="801+">800 GB 以上</option>
          </select>
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>每月平均成本</span>
          <select value={monthlyCostRange} onChange={(e) => setMonthlyCostRange((e.target as HTMLSelectElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="all">全部</option>
            <option value="0-15">¥15/月 以内</option>
            <option value="15-30">¥15 – ¥30/月</option>
            <option value="30+">¥30/月 以上</option>
          </select>
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>排序方式</span>
          <select value={sortBy} onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as any)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="default">按品牌原始顺序</option>
            <option value="price-asc">价格从低到高</option>
            <option value="traffic-desc">流量从高到低</option>
            <option value="monthly-asc">月均成本从低到高</option>
          </select>
        </label>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:13.5px;color:var(--text-secondary);">
        <span>当前匹配 <strong>{filtered.length}</strong> 条真实套餐记录（展示前 100 条）</span>
        <button
          type="button"
          class="btn btn-ghost"
          style="padding:5px 12px;font-size:12px;"
          onClick={() => {
            setBrandFilter('all');
            setCycleFilter('all');
            setPriceRange('all');
            setTrafficRange('all');
            setMonthlyCostRange('all');
            setSortBy('default');
          }}
        >
          重置筛选条件
        </button>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>品牌</th>
              <th>套餐名称</th>
              <th>付款周期</th>
              <th>实付参考价</th>
              <th>流量额度</th>
              <th>月均成本</th>
              <th>每 GB 成本</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((p) => (
              <tr key={p.id}>
                <td><a href={`/stories/${p.brandId}/`}>{p.brandName}</a></td>
                <td>{p.planName}</td>
                <td>{cycleLabels[p.cycle] || p.cycle}</td>
                <td><strong>¥{p.price}</strong></td>
                <td>{p.trafficGb ? `${p.trafficGb} GB${p.months ? '/月' : '（总计）'}` : '见档案'}</td>
                <td>{p.monthlyEquivalent !== null ? `¥${p.monthlyEquivalent}/月` : '不限时（无固定月均）'}</td>
                <td>{p.pricePerGb !== null ? `¥${p.pricePerGb}` : '—'}</td>
                <td><a href={`/stories/${p.brandId}/`} class="tag">档案</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
