import { useMemo, useState } from 'preact/hooks';

export default function DigitalTrafficCalculator() {
  const [videoHoursPerDay, setVideoHoursPerDay] = useState('1.5');
  const [videoBitrateMbps, setVideoBitrateMbps] = useState('15');
  const [musicHoursPerDay, setMusicHoursPerDay] = useState('1');
  const [musicBitrateKbps, setMusicBitrateKbps] = useState('320');
  const [meetingHoursPerDay, setMeetingHoursPerDay] = useState('0.5');
  const [gameDownloadGbMonth, setGameDownloadGbMonth] = useState('40');
  const [softwareModelGbMonth, setSoftwareModelGbMonth] = useState('15');
  const [webAiGbPerDay, setWebAiGbPerDay] = useState('0.5');
  const [activeDaysMonth, setActiveDaysMonth] = useState('30');

  const res = useMemo(() => {
    const vh = Number(videoHoursPerDay);
    const vb = Number(videoBitrateMbps);
    const mh = Number(musicHoursPerDay);
    const mb = Number(musicBitrateKbps);
    const ch = Number(meetingHoursPerDay);
    const gd = Number(gameDownloadGbMonth);
    const sd = Number(softwareModelGbMonth);
    const wa = Number(webAiGbPerDay);
    const days = Number(activeDaysMonth);

    if ([vh, vb, mh, mb, ch, gd, sd, wa, days].some((n) => Number.isNaN(n) || n < 0) || days <= 0 || days > 31) {
      return { valid: false as const, msg: '请输入有效的非负数值，每月使用天数需在 1–31 之间。' };
    }

    // Decimal GB (1 GB = 10^9 bytes): Mbps * 3600s / 8 / 1000 = GB/hour
    const videoGbDay = (vh * vb * 3600) / 8 / 1000;
    const musicGbDay = (mh * (mb / 1000) * 3600) / 8 / 1000;
    // Video meeting avg ~2.5 Mbps bidirectional (upload + download)
    const meetingGbDay = (ch * 2.5 * 3600) / 8 / 1000;

    const videoMonth = videoGbDay * days;
    const musicMonth = musicGbDay * days;
    const meetingMonth = meetingGbDay * days;
    const webAiMonth = wa * days;
    const totalMonthGb = videoMonth + musicMonth + meetingMonth + webAiMonth + gd + sd;
    const totalMonthGiB = totalMonthGb * 0.93132257; // 10^9 / 2^30
    const dailyAvgGb = totalMonthGb / days;
    const weeklyGb = dailyAvgGb * 7;
    const yearlyGb = totalMonthGb * 12;
    const bufferSuggestedGb = Math.ceil(totalMonthGb * 1.25);

    const pct = (v: number) => (totalMonthGb > 0 ? ((v / totalMonthGb) * 100).toFixed(1) : '0.0');

    return {
      valid: true as const,
      dailyAvgGb: dailyAvgGb.toFixed(2),
      weeklyGb: weeklyGb.toFixed(2),
      totalMonthGb: totalMonthGb.toFixed(2),
      totalMonthGiB: totalMonthGiB.toFixed(2),
      yearlyGb: yearlyGb.toFixed(1),
      bufferSuggestedGb,
      breakdown: [
        { label: '流媒体视频', gb: videoMonth.toFixed(1), pct: pct(videoMonth) },
        { label: '游戏下载与更新', gb: gd.toFixed(1), pct: pct(gd) },
        { label: '软件与AI模型下载', gb: sd.toFixed(1), pct: pct(sd) },
        { label: '网页与AI日常对话', gb: webAiMonth.toFixed(1), pct: pct(webAiMonth) },
        { label: '跨境视频会议', gb: meetingMonth.toFixed(1), pct: pct(meetingMonth) },
        { label: '数字音乐播放', gb: musicMonth.toFixed(1), pct: pct(musicMonth) },
      ],
    };
  }, [videoHoursPerDay, videoBitrateMbps, musicHoursPerDay, musicBitrateKbps, meetingHoursPerDay, gameDownloadGbMonth, softwareModelGbMonth, webAiGbPerDay, activeDaysMonth]);

  return (
    <div class="story-card story-card--gold" style="display:grid;gap:18px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;">
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每日视频观看时间（小时）</span>
          <input type="number" min="0" step="0.5" value={videoHoursPerDay} onInput={(e) => setVideoHoursPerDay((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>视频估计码率（Mbps，4K约15–25）</span>
          <input type="number" min="0" step="1" value={videoBitrateMbps} onInput={(e) => setVideoBitrateMbps((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每日音乐播放时间（小时）</span>
          <input type="number" min="0" step="0.5" value={musicHoursPerDay} onInput={(e) => setMusicHoursPerDay((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>音乐码率（kbps，无损约1411）</span>
          <input type="number" min="0" step="32" value={musicBitrateKbps} onInput={(e) => setMusicBitrateKbps((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每日视频会议时间（小时）</span>
          <input type="number" min="0" step="0.5" value={meetingHoursPerDay} onInput={(e) => setMeetingHoursPerDay((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每月游戏下载大小（GB）</span>
          <input type="number" min="0" step="5" value={gameDownloadGbMonth} onInput={(e) => setGameDownloadGbMonth((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每月软件与模型下载（GB）</span>
          <input type="number" min="0" step="5" value={softwareModelGbMonth} onInput={(e) => setSoftwareModelGbMonth((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每日网页及AI日常流量（GB）</span>
          <input type="number" min="0" step="0.1" value={webAiGbPerDay} onInput={(e) => setWebAiGbPerDay((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
        <label style="display:grid;gap:4px;font-size:12.5px;">
          <span>每月使用天数</span>
          <input type="number" min="1" max="31" value={activeDaysMonth} onInput={(e) => setActiveDaysMonth((e.target as HTMLInputElement).value)}
            style="padding:8px 10px;border-radius:8px;border:1px solid var(--border-subtle);background:var(--bg-surface-solid);color:var(--text-primary);" />
        </label>
      </div>

      {res.valid ? (
        <div style="display:grid;gap:14px;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;padding:16px;border-radius:12px;background:var(--bg-chapter-tint);border:1px solid var(--border-gold);">
            <div>
              <small style="color:var(--text-muted);">每日预计流量</small>
              <div style="font-size:20px;font-weight:700;">{res.dailyAvgGb} GB</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">每周预计流量</small>
              <div style="font-size:20px;font-weight:700;">{res.weeklyGb} GB</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">每月预计（十进制 GB）</small>
              <div style="font-size:20px;font-weight:700;">{res.totalMonthGb} GB</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">等效二进制 GiB</small>
              <div style="font-size:20px;font-weight:700;">{res.totalMonthGiB} GiB</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">每年预计总流量</small>
              <div style="font-size:20px;font-weight:700;">{res.yearlyGb} GB</div>
            </div>
            <div>
              <small style="color:var(--text-muted);">建议预留缓冲（×1.25）</small>
              <div style="font-size:20px;font-weight:700;color:var(--deep-dream);">{res.bufferSuggestedGb} GB/月</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;font-size:13px;">
            {res.breakdown.map((b) => (
              <div key={b.label} style="padding:8px 10px;border-radius:8px;background:var(--bg-surface-solid);border:1px solid var(--border-subtle);">
                <strong>{b.label}</strong>：{b.gb} GB（{b.pct}%）
              </div>
            ))}
          </div>

          <small style="color:var(--text-muted);">
            注：以上数值基于输入码率与时长按十进制换算（1 GB = 10⁹ Bytes，1 GiB = 2³⁰ Bytes）生成的理论估算值，实际消耗受自适应码率波动与节点流量倍率影响，不保证与实际账单完全一致。
          </small>
        </div>
      ) : (
        <p style="margin:0;color:var(--text-secondary);">{res.msg}</p>
      )}
    </div>
  );
}
