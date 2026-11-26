import { useMemo, useState } from 'preact/hooks';

export interface SearchEntry {
  category: '品牌' | '套餐' | '历史资料' | '服务事件' | '网络知识' | '原创文章' | '故障答疑' | '独家工具';
  title: string;
  subtitle: string;
  url: string;
  keywords: string;
}

interface Props {
  items: SearchEntry[];
  initialQuery?: string;
}

const synonyms: Array<[string, string[]]> = [
  ['小火箭', ['shadowrocket', 'ios', '苹果']],
  ['梯子', ['机场', 'vpn', 'ladder', '代理']],
  ['跑路', ['风险', '连续性', '停运', '异常']],
  ['10元', ['低价', '便宜', 'budget', '月付']],
  ['节点超时', ['连接失败', '断线', 'connection', '故障']],
];

export default function StorySearchApp({ items, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const quickTags = ['灵动云', 'FlyV', '10元', '年付', '优惠码', '历史价格', '退款', '跑路', 'IEPL', '节点超时', '订阅', 'Netflix', 'ChatGPT'];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 16);

    const expanded = [q];
    for (const [k, syns] of synonyms) {
      if (q.includes(k)) expanded.push(...syns);
      if (syns.some((s) => q.includes(s))) expanded.push(k);
    }

    return items.filter((item) => {
      const hay = `${item.title} ${item.subtitle} ${item.keywords} ${item.category}`.toLowerCase();
      return expanded.some((term) => hay.includes(term));
    });
  }, [query, items]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const r of results.slice(0, 60)) {
      const arr = map.get(r.category) || [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return Array.from(map.entries());
  }, [results]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const visible = results.slice(0, 60);
    if (visible.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && visible[activeIndex]) {
      window.location.href = visible[activeIndex].url;
    }
  };

  return (
    <div style="display:grid;gap:18px;">
      <div class="story-card story-card--gold">
        <label style="display:grid;gap:8px;">
          <span style="font-weight:600;font-size:15px;">LUMO 星语搜索联想（支持品牌、套餐、优惠码、协议与故障词）</span>
          <input
            type="search"
            value={query}
            placeholder="输入关键词，如：灵动云、FlyV、10元、IEPL、节点超时、Netflix..."
            onInput={(e) => {
              setQuery((e.target as HTMLInputElement).value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border-gold);background:var(--bg-surface-solid);color:var(--text-primary);font-size:15px;"
          />
        </label>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">
          {quickTags.map((t) => (
            <button
              key={t}
              type="button"
              class="tag"
              style="cursor:pointer;border:1px solid var(--border-subtle);"
              onClick={() => {
                setQuery(t);
                setActiveIndex(0);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div class="story-card">
          <p style="margin:0;color:var(--text-muted);">未找到与 “{query}” 匹配的档案，建议尝试上方快捷词或缩短关键词。</p>
        </div>
      ) : (
        grouped.map(([cat, list]) => (
          <section key={cat} class="story-card">
            <h2 style="font-size:17px;margin-bottom:12px;">{cat}（{list.length}）</h2>
            <div style="display:grid;gap:10px;">
              {list.map((entry) => (
                <a
                  key={`${entry.url}-${entry.title}`}
                  href={entry.url}
                  style="display:block;padding:10px 12px;border-radius:8px;background:var(--bg-chapter-tint);text-decoration:none;color:var(--text-primary);"
                >
                  <div style="font-weight:600;">{entry.title}</div>
                  <div style="font-size:13px;color:var(--text-secondary);">{entry.subtitle}</div>
                </a>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
