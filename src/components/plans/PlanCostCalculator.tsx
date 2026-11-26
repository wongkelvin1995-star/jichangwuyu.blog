import { useMemo, useState } from 'preact/hooks';

export default function PlanCostCalculator() {
  const [amount, setAmount] = useState('204');
  const [cycle, setCycle] = useState<'1' | '3' | '6' | '12' | '24' | '36' | 'unlimited'>('12');
  const [quotaGb, setQuotaGb] = useState('100');
  const [expectedUsageGb, setExpectedUsageGb] = useState('65');
  const [discountPct, setDiscountPct] = useState('80');

  const calc = useMemo(() => {
    const rawPrice = Number(amount);
    const quota = Number(quotaGb);
    const usage = Number(expectedUsageGb);
    const disc = Number(discountPct);

    if (
      Number.isNaN(rawPrice) || rawPrice <= 0 ||
      Number.isNaN(quota) || quota <= 0 ||
      Number.isNaN(usage) || usage < 0 ||
      Number.isNaN(disc) || disc <= 0 || disc > 100
    ) {
      return { valid: false as const, message: '请输入有效的正数金额、流量额度、预计使用量与折扣比例（1–100）。' };
    }

    const actualPaid = rawPrice * (disc / 100);
    const savedAmount = rawPrice - actualPaid;

    if (cycle === 'unlimited') {
      const remaining = Math.max(0, quota - usage);
      return {
        valid: true as const,
        isUnlimited: true,
        actualPaid: actualPaid.toFixed(2),
        savedAmount: savedAmount.toFixed(2),
        monthlyAvg: '不限时流量包不强制折算固定月均价',
        yearlyEstimate: '按实际消耗频率决定',
        costPerGb: (actualPaid / quota).toFixed(3),
        remainingGb: remaining.toFixed(1),
        trafficModeNote: '整期总流量包（不按自然月重置，用完为止）',
      };
    }

    const months = Number(cycle);
    const monthlyAvg = actualPaid / months;
    const yearlyEstimate = monthlyAvg * 12;
    const totalPeriodGb = quota * months;
    const remainingMonthly = Math.max(0, quota - usage);

    return {
      valid: true as const,
      isUnlimited: false,
      actualPaid: actualPaid.toFixed(2),
      savedAmount: savedAmount.toFixed(2),
      monthlyAvg: `¥${monthlyAvg.toFixed(2)}/月`,
      yearlyEstimate: `¥${yearlyEstimate.toFixed(2)}/年`,
      costPerGb: (actualPaid / totalPeriodGb).toFixed(3),
      remainingGb: `${remainingMonthly.toFixed(1)} GB/月（次月不结转）`,
      trafficModeNote: `按月重置流量（有效期内总计可用 ${totalPeriodGb} GB）`,
    };
  }, [amount, cycle, quotaGb, expectedUsageGb, discountPct]);

  return (
    <div class="story-card story-card--gold" style="display:grid;gap:18px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;">
        <label style="display:grid;gap:4px;font-size:13px;">
          <span>套餐付款金额（元）</span>
          <input type="number" min="0" step="0.1" value={amount} onInput={(e) => setAmount((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>套餐付款周期</span>
          <select value={cycle} onChange={(e) => setCycle((e.target as HTMLSelectElement).value as any)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);">
            <option value="1">月付（1 个月）</option>
            <option value="3">季付（3 个月）</option>
            <option value="6">半年付（6 个月）</option>
            <option value="12">年付（12 个月）</option>
            <option value="24">两年付（24 个月）</option>
            <option value="36">三年付（36 个月）</option>
            <option value="unlimited">不限时 / 一次性流量包</option>
          </select>
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>{cycle === 'unlimited' ? '流量包总额度（GB）' : '每月流量额度（GB）'}</span>
          <input type="number" min="1" value={quotaGb} onInput={(e) => setQuotaGb((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>{cycle === 'unlimited' ? '累计预计使用（GB）' : '每月预计使用（GB）'}</span>
          <input type="number" min="0" value={expectedUsageGb} onInput={(e) => setExpectedUsageGb((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>

        <label style="display:grid;gap:4px;font-size:13px;">
          <span>优惠折扣（% ，如 8 折填 80）</span>
          <input type="number" min="1" max="100" value={discountPct} onInput={(e) => setDiscountPct((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
      </div>

      {calc.valid ? (
        <div style="display:grid;gap:12px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;padding:16px;border-radius:12px;background:var(--bg-chapter-tint);border:1px solid var(--border-gold);">
            <div>
              <small style="color:var(--text-muted);">实际支付金额</small>
              <div style="font-size:21px;font-weight:700;">¥{calc.actualPaid}</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">优惠节省金额</small>
              <div style="font-size:21px;font-weight:700;">¥{calc.savedAmount}</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">每月平均消费</small>
              <div style="font-size:17px;font-weight:700;">{calc.monthlyAvg}</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">每年预计消费</small>
              <div style="font-size:17px;font-weight:700;">{calc.yearlyEstimate}</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">每 GB 流量成本</small>
              <div style="font-size:21px;font-weight:700;">¥{calc.costPerGb}/GB</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">预计剩余流量</small>
              <div style="font-size:16px;font-weight:700;">{calc.remainingGb}</div>
            </div>
          </div>
          <small style="color:var(--text-muted);">流量计费模式：{calc.trafficModeNote}</small>
        </div>
      ) : (
        <p style="margin:0;color:var(--text-secondary);">{calc.message}</p>
      )}
    </div>
  );
}
