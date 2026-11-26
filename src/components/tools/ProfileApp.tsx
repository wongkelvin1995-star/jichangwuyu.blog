import { useEffect, useState } from 'preact/hooks';
import { clearProfile, loadProfile, saveProfile, type MonogatariProfile } from '../../utils/storage';

interface Props {
  brandMap: Record<string, string>;
}

export default function ProfileApp({ brandMap }: Props) {
  const [profile, setProfile] = useState<MonogatariProfile | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  if (!profile) return <div class="story-card">正在读取本地物语手账...</div>;

  const addNote = (e: Event) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;
    const next: MonogatariProfile = {
      ...profile,
      notes: [
        { id: `${Date.now()}`, title: noteTitle.trim(), body: noteBody.trim(), updatedAt: new Date().toISOString().slice(0, 10) },
        ...profile.notes,
      ],
    };
    setProfile(next);
    saveProfile(next);
    setNoteTitle('');
    setNoteBody('');
  };

  const handleClear = () => {
    clearProfile();
    setProfile(loadProfile());
  };

  return (
    <div style="display:grid;gap:20px;">
      <div class="story-card">
        <h2 style="font-size:18px;margin-bottom:10px;">我的收藏品牌（{profile.bookmarks.length}）</h2>
        {profile.bookmarks.length === 0 ? (
          <p style="color:var(--text-muted);margin:0;">暂无收藏。可在任意品牌物语档案页点击“收藏至我的物语”。</p>
        ) : (
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            {profile.bookmarks.map((slug) => (
              <a key={slug} href={`/stories/${slug}/`} class="tag tag--gold">
                {brandMap[slug] || slug} →
              </a>
            ))}
          </div>
        )}
      </div>

      <div class="story-card">
        <h2 style="font-size:18px;margin-bottom:10px;">我的订阅手账摘要（{profile.subscriptions.length} 条）</h2>
        <p style="font-size:14px;color:var(--text-secondary);">
          <a href="/tools/subscription-calendar/" class="btn btn-primary" style="padding:7px 14px;font-size:13px;">管理订阅手账与日历导出 →</a>
        </p>
      </div>

      <form class="story-card" onSubmit={addNote} style="display:grid;gap:10px;">
        <h2 style="font-size:18px;margin:0;">我的本地消费笔记（{profile.notes.length}）</h2>
        <input
          placeholder="笔记标题（例如：晚高峰对比备忘）"
          value={noteTitle}
          onInput={(e) => setNoteTitle((e.target as HTMLInputElement).value)}
          style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
        />
        <textarea
          rows={3}
          placeholder="记录个人预算或待核对问题（切勿填写账号密码或订阅链接）"
          value={noteBody}
          onInput={(e) => setNoteBody((e.target as HTMLTextAreaElement).value)}
          style="padding:9px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);"
        />
        <div>
          <button type="submit" class="btn btn-primary">保存本地笔记</button>
        </div>
        {profile.notes.map((n) => (
          <div key={n.id} style="padding:10px 12px;border-radius:8px;background:var(--bg-chapter-tint);">
            <strong>{n.title}</strong> <small style="color:var(--text-muted);">({n.updatedAt})</small>
            <p style="margin:4px 0 0;font-size:14px;">{n.body}</p>
          </div>
        ))}
      </form>

      <div class="story-card">
        <h2 style="font-size:18px;margin-bottom:8px;">本地数据与隐私控制</h2>
        <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:12px;">
          第一阶段全部个人数据仅保存在浏览器 <code>localStorage</code>，不上传服务器，不提供虚假登录或注册入口。
        </p>
        <button type="button" class="btn btn-ghost" onClick={handleClear}>清除全部本地数据</button>
      </div>
    </div>
  );
}
