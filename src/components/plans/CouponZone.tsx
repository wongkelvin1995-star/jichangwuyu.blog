import { useState } from 'preact/hooks';
import type { CouponRecord } from '../../lib/db';

interface Props {
  coupons: CouponRecord[];
}

export default function CouponZone({ coupons }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(code);
    }
  };

  return (
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>机场品牌</th>
            <th>优惠码</th>
            <th>优惠折扣</th>
            <th>适用套餐与排除说明</th>
            <th>有效期与证据限制</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.brandId}>
              <td><a href={`/stories/${c.brandId}/`}>{c.brandName}</a></td>
              <td><code>{c.code}</code></td>
              <td>{c.discount}</td>
              <td>
                {c.appliesTo.length > 0 ? `适用：${c.appliesTo.join('、')}` : '见官网结算页'}
                {c.excludes.length > 0 ? <><br /><small style="color:var(--text-muted);">排除：{c.excludes.join('、')}</small></> : null}
              </td>
              <td>
                <small style="color:var(--text-secondary);">
                  {c.evidenceNature}（未保证永久有效，以结算页实付为准）
                </small>
              </td>
              <td style="white-space:nowrap;">
                <button
                  type="button"
                  class="btn btn-ghost"
                  style="padding:5px 10px;font-size:12px;margin-right:6px;"
                  onClick={() => handleCopy(c.code)}
                >
                  {copiedCode === c.code ? '已复制 ✓' : '复制优惠码'}
                </button>
                <a href={c.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored" class="btn btn-primary" style="padding:5px 10px;font-size:12px;">
                  购买入口 ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
