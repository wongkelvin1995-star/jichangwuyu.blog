import { useMemo, useState } from 'preact/hooks';

export default function ValueAnalyzerApp() {
  const [mode, setMode] = useState<'periodic' | 'onetime'>('periodic');
  const [price, setPrice] = useState('20');
  const [months, setMonths] = useState('1');
  const [trafficGb, setTrafficGb] = useState('100');
  const [discountRate, setDiscountRate] = useState('100');
  const [multiplier, setMultiplier] = useState('1');

  const result = useMemo(() => {
    const p = Number(price);
    const m = Number(months);
    const gb = Number(trafficGb);
    const disc = Number(discountRate);
    const mult = Number(multiplier);

    if (Number.isNaN(p) || p <= 0 || Number.isNaN(gb) || gb <= 0 || Number.isNaN(mult) || mult <= 0 || Number.isNaN(disc) || disc <= 0) {
      return { valid: false, reason: '缺少有效参数：请确保标价、流量额度、折扣比例与倍率均为大于 0 的数值。' };
    }
    if (mode === 'periodic' && (Number.isNaN(m) || m <= 0)) {
      return { valid: false, reason: '周期套餐必须填写大于 0 的有效月数。' };
    }

    const actualPaid = p * (disc / 100);
    if (mode === 'onetime') {
      const effectiveGb = gb / mult;
      return {
        valid: true,
        actualPaid: actualPaid.toFixed(2),
        monthlyEquivalent: null,
        totalEffectiveGb: effectiveGb.toFixed(1),
        costPerGb: (actualPaid / effectiveGb).toFixed(3),
      };
    }

    const totalEffectiveGb = (gb * m) / mult;
    return {
      valid: true,
      actualPaid: actualPaid.toFixed(2),
      monthlyEquivalent: (actualPaid / m).toFixed(2),
      totalEffectiveGb: totalEffectiveGb.toFixed(1),
      costPerGb: (actualPaid / totalEffectiveGb).toFixed(3),
    };
  }, [mode, price, months, trafficGb, discountRate, multiplier]);

  return (
    <div class="story-card" style="display:grid;gap:18px;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button
          type="button"
          class={`btn ${mode === 'periodic' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('periodic')}
        >
          周期套餐（月付/季付/年付）
        </button>
        <button
          type="button"
          class={`btn ${mode === 'onetime' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('onetime')}
        >
          一次性流量包（按量/不限时）
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
        <label style="display:grid;gap:4px;font-size:13px;">
          <span>整期公开标价（元）</span>
          <input type="number" min="0" step="0.1" value={price} onInput={(e) => setPrice((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>

        {mode === 'periodic' && (
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>套餐有效月数</span>
            <select value={months} onChange={(e) => setMonths((e.target as HTMLSelectElement).value)}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
              <option value="1">月付（1 个月）</option>
              <option value="3">季付（3 个月）</option>
              <option value="6">半年付（6 个月）</option>
              <option value="12">年付（12 个月）</option>
              <option value="24">两年付（24 个月）</option>
              <option value="36">三年付（36 个月）</option>
            </select>
          </label>
        )}

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>{mode === 'periodic' ? '每月基础流量（GB）' : '流量包总额度（GB）'}</span>
          <input type="number" min="1" value={trafficGb} onInput={(e) => setTrafficGb((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>优惠折扣（% ，如 8 折填 80）</span>
          <input type="number" min="1" max="100" value={discountRate} onInput={(e) => setDiscountRate((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>常用节点平均倍率（x）</span>
          <input type="number" min="0.1" step="0.1" value={multiplier} onInput={(e) => setMultiplier((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
      </div>

      {result.valid ? (
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;padding:16px;border-radius:12px;background:var(--bg-chapter-tint);border:1px solid var(--border-gold);">
          <div>
            <small style="color:var(--text-muted);">整期折后实付</small>
            <div style="font-size:22px;font-weight:700;">¥{result.actualPaid}</div>
          </div>
          {result.monthlyEquivalent !== null && (
            <div>
              <small style="color:var(--text-muted);">折合每月价格</small>
              <div style="font-size:22px;font-weight:700;">¥{result.monthlyEquivalent}/月</div>
            </div>
          )}
          <div>
            <small style="color:var(--text-muted);">等效可用总流量</small>
            <div style="font-size:22px;font-weight:700;">{result.totalEffectiveGb} GB</div>
          </div>
          <div>
            <small style="color:var(--text-muted);">每 GB 真实成本</small>
            <div style="font-size:22px;font-weight:700;">¥{result.costPerGb}/GB</div>
          </div>
        </div>
      ) : (
        <div style="padding:14px;border-radius:10px;background:rgba(221,168,188,0.2);color:var(--text-primary);">
          {result.reason}
        </div>
      )}
    </div>
  );
}
