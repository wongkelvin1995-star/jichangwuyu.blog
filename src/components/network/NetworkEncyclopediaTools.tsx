import { useMemo, useState } from 'preact/hooks';
import type { GlossaryTerm } from '../../data/network-glossary';

export interface ArticleIndexItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  terms: string[];
}

interface Props {
  articles: ArticleIndexItem[];
  glossary: GlossaryTerm[];
}

export default function NetworkEncyclopediaTools({ articles, glossary }: Props) {
  // 1. Search & Glossary state
  const [query, setQuery] = useState('');
  const [glossaryCat, setGlossaryCat] = useState('all');

  // 2. Bandwidth Converter state
  const [mbpsInput, setMbpsInput] = useState('100');

  // 3. Download Time Estimator state
  const [fileSizeGb, setFileSizeGb] = useState('10');
  const [speedMBs, setSpeedMBs] = useState('8');

  // 4. Streaming Traffic Estimator state
  const [streamBitrateMbps, setStreamBitrateMbps] = useState('15');
  const [watchHours, setWatchHours] = useState('2');

  // 5. Performance Indicator Interpreter state
  const [pingMs, setPingMs] = useState('45');
  const [jitterMs, setJitterMs] = useState('6');
  const [lossPct, setLossPct] = useState('0');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { articles: [], terms: [] };
    return {
      articles: articles.filter((a) =>
        `${a.title} ${a.category} ${a.summary} ${a.terms.join(' ')}`.toLowerCase().includes(q)
      ).slice(0, 8),
      terms: glossary.filter((t) =>
        `${t.term} ${t.en} ${t.definition} ${t.significance}`.toLowerCase().includes(q)
      ).slice(0, 8),
    };
  }, [query, articles, glossary]);

  const filteredGlossary = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossary.filter((t) => {
      if (glossaryCat !== 'all' && t.category !== glossaryCat) return false;
      if (!q) return true;
      return `${t.term} ${t.en} ${t.definition} ${t.significance}`.toLowerCase().includes(q);
    });
  }, [query, glossaryCat, glossary]);

  // Calculations
  const bwVal = Number(mbpsInput);
  const bwValid = !Number.isNaN(bwVal) && bwVal > 0;
  const theoreticalMBs = bwValid ? (bwVal / 8).toFixed(2) : '—';
  const practicalMBs = bwValid ? ((bwVal / 8) * 0.85).toFixed(2) : '—';

  const dlGb = Number(fileSizeGb);
  const dlSpd = Number(speedMBs);
  const dlValid = !Number.isNaN(dlGb) && dlGb > 0 && !Number.isNaN(dlSpd) && dlSpd > 0;
  const dlSeconds = dlValid ? (dlGb * 1024) / dlSpd : 0;
  const dlText = dlValid
    ? dlSeconds < 60
      ? `约 ${Math.round(dlSeconds)} 秒`
      : dlSeconds < 3600
      ? `约 ${(dlSeconds / 60).toFixed(1)} 分钟`
      : `约 ${(dlSeconds / 3600).toFixed(2)} 小时`
    : '请输入大于 0 的文件大小与速度';

  const stMbps = Number(streamBitrateMbps);
  const stHrs = Number(watchHours);
  const stValid = !Number.isNaN(stMbps) && stMbps > 0 && !Number.isNaN(stHrs) && stHrs > 0;
  const stGb = stValid ? ((stMbps * 3600 * stHrs) / 8 / 1024).toFixed(2) : '—';

  const pVal = Number(pingMs);
  const jVal = Number(jitterMs);
  const lVal = Number(lossPct);
  const perfSummary = useMemo(() => {
    if ([pVal, jVal, lVal].some((x) => Number.isNaN(x) || x < 0)) {
      return '请输入有效的非负数值。';
    }
    const parts: string[] = [];
    if (pVal <= 60) parts.push(`延迟 ${pVal}ms（东亚低延迟区间，网页交互跟手）`);
    else if (pVal <= 140) parts.push(`延迟 ${pVal}ms（中亚太/跨区常见区间，网页与视频可用）`);
    else parts.push(`延迟 ${pVal}ms（欧美远端物理距离区间，点播可用但实时游戏较吃力）`);

    if (jVal <= 10) parts.push(`抖动 ${jVal}ms（波动平稳）`);
    else if (jVal <= 30) parts.push(`抖动 ${jVal}ms（存在轻度排队波动）`);
    else parts.push(`抖动 ${jVal}ms（波动较大，实时语音/游戏易卡顿）`);

    if (lVal === 0) parts.push('丢包率 0%（传输完整度理想）');
    else if (lVal <= 1.5) parts.push(`丢包率 ${lVal}%（轻微丢包，TCP单线程吞吐开始受影响）`);
    else parts.push(`丢包率 ${lVal}%（高丢包，TCP易频繁重传卡顿）`);

    return parts.join('；') + '。（注：仅作指标原理参考，不代表品牌实际测试结论）';
  }, [pVal, jVal, lVal]);

  return (
    <div style="display:grid;gap:28px;">
      {/* Knowledge Search */}
      <section class="story-card story-card--gold" id="network-search">
        <h2 style="font-size:20px;margin-bottom:8px;">网络知识与术语智能搜索</h2>
        <p style="font-size:13.5px;color:var(--text-secondary);margin:0 0 12px;">
          支持实时检索 36 篇深度文章与 {glossary.length} 项专业术语（如输入：IEPL、日本、Hysteria2、丢包、DNS）。
        </p>
        <input
          type="search"
          value={query}
          placeholder="输入关键词实时检索（例如：IEPL、日本、VLESS、延迟、DNS）..."
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--border-gold);background:var(--bg-surface-solid);color:var(--text-primary);font-size:15px;"
        />
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
          {['IEPL', 'BGP', '日本', 'Hysteria2', '丢包', 'DNS', '独立IP'].map((k) => (
            <button key={k} type="button" class="tag" style="cursor:pointer;" onClick={() => setQuery(k)}>{k}</button>
          ))}
          {query && (
            <button type="button" class="tag tag--rose" style="cursor:pointer;" onClick={() => setQuery('')}>清空</button>
          )}
        </div>

        {query.trim() && (
          <div style="margin-top:14px;display:grid;gap:12px;">
            {searchResults.articles.length === 0 && searchResults.terms.length === 0 ? (
              <p style="margin:0;color:var(--text-muted);">未找到与 “{query}” 匹配的知识文章或术语。</p>
            ) : (
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;">
                {searchResults.articles.length > 0 && (
                  <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
                    <strong style="font-size:14px;">匹配文章（{searchResults.articles.length}）</strong>
                    <ul style="margin:8px 0 0;padding-left:16px;font-size:13.5px;display:grid;gap:6px;">
                      {searchResults.articles.map((a) => (
                        <li key={a.slug}><a href={`/network/${a.slug}/`}>{a.title}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.terms.length > 0 && (
                  <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
                    <strong style="font-size:14px;">匹配术语（{searchResults.terms.length}）</strong>
                    <ul style="margin:8px 0 0;padding-left:16px;font-size:13.5px;display:grid;gap:6px;">
                      {searchResults.terms.map((t) => (
                        <li key={t.term}>
                          <a href={`/network/${t.articleSlug}/`}><strong>{t.term}</strong></a>：{t.definition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4 Practical Network Tools */}
      <section id="network-tools">
        <h2 style="font-size:22px;margin-bottom:12px;">实用网络知识计算与指标工具（估算演示）</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
          <div class="story-card">
            <h3 style="font-size:17px;margin-bottom:8px;">网络带宽换算器</h3>
            <label style="display:grid;gap:4px;font-size:13px;margin-bottom:10px;">
              <span>标称带宽（Mbps）</span>
              <input type="number" min="1" value={mbpsInput} onInput={(e) => setMbpsInput((e.target as HTMLInputElement).value)}
                style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
            </label>
            <div style="font-size:13.5px;color:var(--text-secondary);display:grid;gap:4px;">
              <div>理论峰值速度（÷8）：<strong>{theoreticalMBs} MB/s</strong></div>
              <div>扣除协议开销参考（×85%）：<strong>{practicalMBs} MB/s</strong></div>
            </div>
          </div>

          <div class="story-card">
            <h3 style="font-size:17px;margin-bottom:8px;">文件下载时间估算器</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
              <label style="display:grid;gap:4px;font-size:12.5px;">
                <span>文件大小（GB）</span>
                <input type="number" min="0.1" step="0.1" value={fileSizeGb} onInput={(e) => setFileSizeGb((e.target as HTMLInputElement).value)}
                  style="padding:7px 8px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
              <label style="display:grid;gap:4px;font-size:12.5px;">
                <span>实测速度（MB/s）</span>
                <input type="number" min="0.1" step="0.1" value={speedMBs} onInput={(e) => setSpeedMBs((e.target as HTMLInputElement).value)}
                  style="padding:7px 8px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
            </div>
            <div style="font-size:13.5px;color:var(--text-secondary);">预计耗时：<strong>{dlText}</strong></div>
          </div>

          <div class="story-card">
            <h3 style="font-size:17px;margin-bottom:8px;">流媒体流量估算器</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
              <label style="display:grid;gap:4px;font-size:12.5px;">
                <span>视频码率（Mbps，4K约15–25）</span>
                <input type="number" min="1" value={streamBitrateMbps} onInput={(e) => setStreamBitrateMbps((e.target as HTMLInputElement).value)}
                  style="padding:7px 8px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
              <label style="display:grid;gap:4px;font-size:12.5px;">
                <span>观看时长（小时）</span>
                <input type="number" min="0.1" step="0.5" value={watchHours} onInput={(e) => setWatchHours((e.target as HTMLInputElement).value)}
                  style="padding:7px 8px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
            </div>
            <div style="font-size:13.5px;color:var(--text-secondary);">预计消耗流量：<strong>{stGb} GB</strong></div>
          </div>

          <div class="story-card">
            <h3 style="font-size:17px;margin-bottom:8px;">网络性能指标解释器</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">
              <label style="display:grid;gap:3px;font-size:12px;">
                <span>延迟(ms)</span>
                <input type="number" min="0" value={pingMs} onInput={(e) => setPingMs((e.target as HTMLInputElement).value)}
                  style="padding:6px 8px;border-radius:6px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
              <label style="display:grid;gap:3px;font-size:12px;">
                <span>抖动(ms)</span>
                <input type="number" min="0" value={jitterMs} onInput={(e) => setJitterMs((e.target as HTMLInputElement).value)}
                  style="padding:6px 8px;border-radius:6px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
              <label style="display:grid;gap:3px;font-size:12px;">
                <span>丢包(%)</span>
                <input type="number" min="0" step="0.1" value={lossPct} onInput={(e) => setLossPct((e.target as HTMLInputElement).value)}
                  style="padding:6px 8px;border-radius:6px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
              </label>
            </div>
            <div style="font-size:12.5px;color:var(--text-secondary);line-height:1.55;">{perfSummary}</div>
          </div>
        </div>
      </section>

      {/* 50-Term Glossary Browser */}
      <section class="story-card" id="network-glossary">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
          <div>
            <h2 style="font-size:21px;margin:0 0 4px;">网络专业术语库（{glossary.length} 项）</h2>
            <p style="margin:0;font-size:13.5px;color:var(--text-muted);">按技术分类筛选或结合上方搜索框检索，点击术语可直达对应深度解析文章。</p>
          </div>
          <select
            value={glossaryCat}
            onChange={(e) => setGlossaryCat((e.target as HTMLSelectElement).value)}
            style="padding:8px 12px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
          >
            <option value="all">全部分类（{glossary.length}）</option>
            <option value="线路与架构">线路与架构</option>
            <option value="协议与传输">协议与传输</option>
            <option value="性能指标">性能指标</option>
            <option value="网络基础与安全">网络基础与安全</option>
            <option value="设备与客户端">设备与客户端</option>
          </select>
        </div>

        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>术语</th>
                <th>英文全称</th>
                <th>分类</th>
                <th>中文解释与实际意义</th>
                <th>深入阅读</th>
              </tr>
            </thead>
            <tbody>
              {filteredGlossary.map((t) => (
                <tr key={t.term}>
                  <td><strong>{t.term}</strong></td>
                  <td><small>{t.en}</small></td>
                  <td><span class="tag">{t.category}</span></td>
                  <td>{t.definition} {t.significance}</td>
                  <td style="white-space:nowrap;"><a href={`/network/${t.articleSlug}/`}>查看文章 →</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
