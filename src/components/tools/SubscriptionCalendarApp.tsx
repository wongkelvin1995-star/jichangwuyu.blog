import { useEffect, useMemo, useState } from 'preact/hooks';
import { loadProfile, saveProfile, type SubscriptionEntry } from '../../utils/storage';

interface Props {
  brandNames: string[];
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export default function SubscriptionCalendarApp({ brandNames }: Props) {
  const [entries, setEntries] = useState<SubscriptionEntry[]>([]);
  const [brandName, setBrandName] = useState(brandNames[0] || '灵动云');
  const [planName, setPlanName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-11-26');
  const [paidAmount, setPaidAmount] = useState('20');
  const [cycleMonths, setCycleMonths] = useState('1');
  const [expiryDate, setExpiryDate] = useState(addMonths('2026-11-26', 1));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const p = loadProfile();
    setEntries(p.subscriptions || []);
  }, []);

  const persist = (next: SubscriptionEntry[]) => {
    setEntries(next);
    const p = loadProfile();
    p.subscriptions = next;
    saveProfile(p);
  };

  const handleAdd = (e: Event) => {
    e.preventDefault();
    const amount = Number(paidAmount);
    const months = Number(cycleMonths);
    if (!brandName.trim() || Number.isNaN(amount) || amount < 0 || Number.isNaN(months) || months <= 0) return;

    const item: SubscriptionEntry = {
      id: `${Date.now()}`,
      brandName: brandName.trim(),
      planName: planName.trim() || '标准周期套餐',
      purchaseDate,
      paidAmount: amount,
      cycleMonths: months,
      expiryDate,
      renewalReminderDate: expiryDate,
      notes: notes.trim(),
    };
    persist([item, ...entries]);
    setPlanName('');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    persist(entries.filter((x) => x.id !== id));
  };

  const handleExpiryEdit = (id: string, nextExpiry: string) => {
    persist(entries.map((x) => (x.id === id ? { ...x, expiryDate: nextExpiry, renewalReminderDate: nextExpiry } : x)));
  };

  const totals = useMemo(() => {
    const cumulative = entries.reduce((s, x) => s + x.paidAmount, 0);
    const monthlySum = entries.reduce((s, x) => s + x.paidAmount / Math.max(1, x.cycleMonths), 0);
    return {
      cumulative: cumulative.toFixed(2),
      monthlySum: monthlySum.toFixed(2),
      yearlyEstimate: (monthlySum * 12).toFixed(2),
    };
  }, [entries]);

  const exportIcs = () => {
    if (entries.length === 0) return;
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//jichangwuyu.blog//Subscription Calendar//CN',
    ];
    entries.forEach((item) => {
      const dt = item.expiryDate.replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${item.id}@jichangwuyu.blog`,
        `DTSTART;VALUE=DATE:${dt}`,
        `SUMMARY:${item.brandName} 订阅到期核对（${item.planName}）`,
        `DESCRIPTION:实付 ¥${item.paidAmount} / ${item.cycleMonths}个月。备注：${item.notes || '无'}`,
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jichangwuyu-subscriptions.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style="display:grid;gap:20px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;">
        <div class="story-card">
          <small style="color:var(--text-muted);">累计记录消费</small>
          <div style="font-size:24px;font-weight:700;">¥{totals.cumulative}</div>
        </div>
        <div class="story-card">
          <small style="color:var(--text-muted);">折合每月支出</small>
          <div style="font-size:24px;font-weight:700;">¥{totals.monthlySum}/月</div>
        </div>
        <div class="story-card">
          <small style="color:var(--text-muted);">按当前推算年消费</small>
          <div style="font-size:24px;font-weight:700;">¥{totals.yearlyEstimate}/年</div>
        </div>
      </div>

      <form class="story-card" onSubmit={handleAdd} style="display:grid;gap:14px;">
        <h2 style="font-size:18px;margin:0;">新增本地订阅记录</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>品牌名称</span>
            <input
              list="brand-list-dl"
              value={brandName}
              onInput={(e) => setBrandName((e.target as HTMLInputElement).value)}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            />
            <datalist id="brand-list-dl">
              {brandNames.map((n) => <option key={n} value={n} />)}
            </datalist>
          </label>
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>套餐名称</span>
            <input
              placeholder="例如：拂风 / 入门月付"
              value={planName}
              onInput={(e) => setPlanName((e.target as HTMLInputElement).value)}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            />
          </label>
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>购买日期</span>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setPurchaseDate(v);
                setExpiryDate(addMonths(v, Number(cycleMonths) || 1));
              }}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            />
          </label>
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>整期实付金额（元）</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={paidAmount}
              onInput={(e) => setPaidAmount((e.target as HTMLInputElement).value)}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            />
          </label>
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>付款周期（月）</span>
            <select
              value={cycleMonths}
              onChange={(e) => {
                const m = (e.target as HTMLSelectElement).value;
                setCycleMonths(m);
                setExpiryDate(addMonths(purchaseDate, Number(m) || 1));
              }}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            >
              <option value="1">月付（1个月）</option>
              <option value="3">季付（3个月）</option>
              <option value="6">半年付（6个月）</option>
              <option value="12">年付（12个月）</option>
              <option value="24">两年付（24个月）</option>
            </select>
          </label>
          <label style="display:grid;gap:4px;font-size:13px;">
            <span>实际到期日期（可手动修正）</span>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate((e.target as HTMLInputElement).value)}
              style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
            />
          </label>
        </div>
        <label style="display:grid;gap:4px;font-size:13px;">
          <span>消费备注（请勿填写订阅链接或密码）</span>
          <input
            placeholder="例如：首购使用优惠码，续费前需核对原价"
            value={notes}
            onInput={(e) => setNotes((e.target as HTMLInputElement).value)}
            style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
          />
        </label>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <button type="submit" class="btn btn-primary">保存到本地手账</button>
          <button type="button" class="btn btn-gold" onClick={exportIcs} disabled={entries.length === 0}>
            导出 .ics 本地日历文件
          </button>
        </div>
        <small style="color:var(--text-muted);">
          说明：数据仅保存在您的浏览器本地存储中；本站未接入后台推送服务，不会发送远程续费提醒，建议导出 .ics 到系统日历。
        </small>
      </form>

      <div class="story-card">
        <h2 style="font-size:18px;margin-bottom:12px;">我的订阅日历清单（{entries.length} 项）</h2>
        {entries.length === 0 ? (
          <p style="color:var(--text-muted);">暂无记录，可在上方添加您的首条订阅消费手账。</p>
        ) : (
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>品牌 / 套餐</th>
                  <th>购买日</th>
                  <th>实付 / 周期</th>
                  <th>折合月均</th>
                  <th>实际到期日（可改）</th>
                  <th>剩余天数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item) => {
                  const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000);
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.brandName}</strong><br /><small>{item.planName}</small></td>
                      <td>{item.purchaseDate}</td>
                      <td>¥{item.paidAmount} / {item.cycleMonths}月</td>
                      <td>¥{(item.paidAmount / Math.max(1, item.cycleMonths)).toFixed(2)}/月</td>
                      <td>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => handleExpiryEdit(item.id, (e.target as HTMLInputElement).value)}
                          style="padding:4px 6px;border-radius:6px;border:1px solid var(--border-subtle);"
                        />
                      </td>
                      <td>{Number.isNaN(daysLeft) ? '—' : daysLeft >= 0 ? `剩 ${daysLeft} 天` : `已过期 ${Math.abs(daysLeft)} 天`}</td>
                      <td>
                        <button type="button" class="btn btn-ghost" style="padding:4px 10px;font-size:12px;" onClick={() => handleDelete(item.id)}>
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
