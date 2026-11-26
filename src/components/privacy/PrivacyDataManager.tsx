import { useEffect, useState } from 'preact/hooks';
import { loadProfile, saveProfile, type MonogatariProfile } from '../../utils/storage';

const PROFILE_KEY = 'jichangwuyu_monogatari_profile_v1';
const THEME_KEY = 'jichangwuyu_theme';
const MOTION_KEY = 'jichangwuyu_motion';

export default function PrivacyDataManager() {
  const [profile, setProfile] = useState<MonogatariProfile | null>(null);
  const [theme, setTheme] = useState<string>('day（默认）');
  const [motion, setMotion] = useState<string>('full（默认）');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const refresh = () => {
    setProfile(loadProfile());
    try {
      setTheme(localStorage.getItem(THEME_KEY) || 'day（默认）');
      setMotion(localStorage.getItem(MOTION_KEY) || 'full（默认）');
    } catch {
      // Ignore storage read errors
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!profile) {
    return <div class="story-card">正在读取当前浏览器中的本地存储状态...</div>;
  }

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: 'https://jichangwuyu.blog/',
      note: '仅包含机场物语保存在当前浏览器中的本地记录，请妥善保管，切勿公开分享个人消费笔记。',
      data: {
        [PROFILE_KEY]: profile,
        [THEME_KEY]: theme,
        [MOTION_KEY]: motion,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jichangwuyu-local-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('已导出机场物语本地数据 JSON 文件，请妥善保存于私人设备中。');
  };

  const executeClear = (action: string) => {
    const p = loadProfile();
    if (action === 'bookmarks') {
      p.bookmarks = [];
      saveProfile(p);
      setStatusMsg('已清除本站收藏记录。');
    } else if (action === 'history') {
      p.readingHistory = [];
      saveProfile(p);
      setStatusMsg('已清除本站阅读历史。');
    } else if (action === 'subscriptions') {
      p.subscriptions = [];
      saveProfile(p);
      setStatusMsg('已清除个人订阅手账记录。');
    } else if (action === 'preferences') {
      try {
        localStorage.removeItem(THEME_KEY);
        localStorage.removeItem(MOTION_KEY);
      } catch {}
      document.documentElement.setAttribute('data-theme', 'day');
      document.documentElement.setAttribute('data-motion', 'full');
      setStatusMsg('已重置日间/夜间主题与动画偏好。');
    } else if (action === 'all') {
      try {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(THEME_KEY);
        localStorage.removeItem(MOTION_KEY);
      } catch {}
      document.documentElement.setAttribute('data-theme', 'day');
      document.documentElement.setAttribute('data-motion', 'full');
      setStatusMsg('已清除机场物语在本浏览器中保存的全部专属键名数据。');
    }
    setConfirmAction(null);
    refresh();
  };

  const actionLabels: Record<string, string> = {
    bookmarks: '清除收藏记录',
    history: '清除阅读历史',
    subscriptions: '清除订阅手账',
    preferences: '清除主题与动画偏好',
    all: '清除本站全部本地记录',
  };

  return (
    <div class="story-card story-card--gold" style="display:grid;gap:16px;" id="local-data-center">
      <div>
        <h2 style="font-size:21px;margin:0 0 6px;">本地数据管理中心（实时读取当前浏览器）</h2>
        <p style="font-size:13.5px;color:var(--text-secondary);margin:0;">
          以下数量直接读取自您当前浏览器的 <code>localStorage</code>（仅限本站专用键名：<code>{PROFILE_KEY}</code>、<code>{THEME_KEY}</code>、<code>{MOTION_KEY}</code>）。
        </p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">
        <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
          <small style="color:var(--text-muted);">收藏品牌记录</small>
          <div style="font-size:22px;font-weight:700;">{profile.bookmarks.length} 条</div>
        </div>
        <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
          <small style="color:var(--text-muted);">阅读历史记录</small>
          <div style="font-size:22px;font-weight:700;">{profile.readingHistory.length} 条</div>
        </div>
        <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
          <small style="color:var(--text-muted);">个人订阅手账</small>
          <div style="font-size:22px;font-weight:700;">{profile.subscriptions.length} 条</div>
        </div>
        <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
          <small style="color:var(--text-muted);">套餐消费笔记</small>
          <div style="font-size:22px;font-weight:700;">{profile.notes.length} 条</div>
        </div>
        <div style="padding:12px;border-radius:10px;background:var(--bg-chapter-tint);">
          <small style="color:var(--text-muted);">主题 / 动画偏好</small>
          <div style="font-size:14px;font-weight:700;margin-top:4px;">{theme} / {motion}</div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
        <button type="button" class="btn btn-gold" onClick={handleExportJson}>
          导出我的本地数据（JSON）
        </button>
        <button type="button" class="btn btn-ghost" onClick={() => setConfirmAction('bookmarks')}>清除收藏记录</button>
        <button type="button" class="btn btn-ghost" onClick={() => setConfirmAction('history')}>清除阅读历史</button>
        <button type="button" class="btn btn-ghost" onClick={() => setConfirmAction('subscriptions')}>清除订阅手账</button>
        <button type="button" class="btn btn-ghost" onClick={() => setConfirmAction('preferences')}>清除主题偏好</button>
        <button type="button" class="btn btn-ghost" style="border-color:var(--rose-pink);" onClick={() => setConfirmAction('all')}>
          清除本站全部本地记录
        </button>
      </div>

      <small style="color:var(--text-muted);">
        提醒：导出前请确认设备环境安全，避免将个人消费笔记公开分享；删除后的本地数据无法恢复，建议在清除前先执行导出备份。清除操作仅移除本站专属键名，不会调用 <code>localStorage.clear()</code> 影响其他数据。
      </small>

      {confirmAction && (
        <div style="padding:14px;border-radius:10px;background:rgba(221,168,188,0.22);border:1px solid var(--rose-pink);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
          <span style="font-size:14px;">
            <strong>二次确认：</strong>确定要执行「{actionLabels[confirmAction]}」吗？删除后本地记录将无法恢复。
          </span>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-primary" style="padding:6px 14px;font-size:13px;" onClick={() => executeClear(confirmAction)}>
              确认删除
            </button>
            <button type="button" class="btn btn-ghost" style="padding:6px 14px;font-size:13px;" onClick={() => setConfirmAction(null)}>
              取消
            </button>
          </div>
        </div>
      )}

      {statusMsg && (
        <div style="padding:10px 14px;border-radius:8px;background:var(--bg-chapter-tint);font-size:13.5px;border-left:3px solid var(--story-gold);">
          {statusMsg}
        </div>
      )}
    </div>
  );
}
