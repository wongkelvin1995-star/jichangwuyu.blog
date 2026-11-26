import { useMemo, useState } from 'preact/hooks';
import type { DigitalAppCard } from '../../data/digital-apps';

interface ArticleSummary {
  slug: string;
  title: string;
  category: string;
}

interface Props {
  apps: DigitalAppCard[];
  articles: ArticleSummary[];
}

export default function DigitalAppsExplorer({ apps, articles }: Props) {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const categories = [
    'AI人工智能',
    '全球流媒体与音乐',
    '社交媒体与通讯',
    '全球游戏与下载',
    '跨境数字办公',
    '学术研究与数字学习',
    '软件开发与数字创作',
  ];

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      if (catFilter !== 'all' && a.category !== catFilter) return false;
      if (!q) return true;
      return `${a.name} ${a.nameEn} ${a.category} ${a.summary} ${a.networkNeed}`.toLowerCase().includes(q);
    });
  }, [apps, query, catFilter]);

  const matchedArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return articles.filter((a) => `${a.title} ${a.category}`.toLowerCase().includes(q)).slice(0, 8);
  }, [articles, query]);

  return (
    <div style="display:grid;gap:20px;">
      <div class="story-card story-card--gold" style="display:grid;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <h2 style="font-size:19px;margin:0;">数字应用与专题智能检索</h2>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter((e.target as HTMLSelectElement).value)}
            style="padding:8px 12px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
          >
            <option value="all">全部 7 大应用专区（{apps.length} 款）</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <input
          type="search"
          value={query}
          placeholder="搜索应用名称、英文名或场景（如：ChatGPT、Netflix、Steam、GitHub、4K、会议）..."
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          style="width:100%;padding:11px 14px;border-radius:10px;border:1px solid var(--border-gold);background:var(--bg-surface-solid);color:var(--text-primary);font-size:15px;"
        />

        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          {['ChatGPT', 'Claude', 'YouTube', 'Netflix', 'Discord', 'Steam', 'Zoom', 'GitHub', 'Figma'].map((k) => (
            <button key={k} type="button" class="tag" style="cursor:pointer;" onClick={() => setQuery(k)}>{k}</button>
          ))}
          {(query || catFilter !== 'all') && (
            <button type="button" class="tag tag--rose" style="cursor:pointer;" onClick={() => { setQuery(''); setCatFilter('all'); }}>重置</button>
          )}
        </div>

        {matchedArticles.length > 0 && (
          <div style="padding:10px 12px;border-radius:8px;background:var(--bg-chapter-tint);font-size:13.5px;">
            <strong>匹配专题文章：</strong>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">
              {matchedArticles.map((m) => (
                <a key={m.slug} href={`/digital-applications/${m.slug}/`} class="tag">{m.title} →</a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:16px;">
        {filteredApps.map((app) => (
          <article key={`${app.category}-${app.name}`} class="story-card story-card--interactive" style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <span class="tag">{app.category}</span>
              <small style="color:var(--text-muted);font-size:11.5px;">{app.nameEn}</small>
            </div>
            <h3 style="font-size:18px;margin:2px 0 0;">
              <a href={`/digital-applications/${app.articleSlug}/`}>{app.name}</a>
            </h3>
            <p style="font-size:13.5px;color:var(--text-secondary);margin:0;flex-grow:1;">{app.summary}</p>
            <div style="font-size:12.5px;padding:8px 10px;border-radius:8px;background:var(--bg-chapter-tint);color:var(--text-primary);">
              <strong>网络需求：</strong>{app.networkNeed}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
              <a href={`/digital-applications/${app.articleSlug}/`} class="btn btn-primary" style="padding:6px 12px;font-size:12.5px;">阅读全文</a>
              <a href={app.officialUrl} target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="padding:6px 12px;font-size:12.5px;">官网入口 ↗</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
