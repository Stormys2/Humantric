import { useMemo, useState } from 'react';
import { useLang } from '../LangContext';
import { scoreColor } from '../habits';
import './Metrics.css';

function getStreak(logs) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (logs[key]) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getDailyScores(logs, days) {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({ key, label: `${d.getDate()}/${d.getMonth()+1}`, score: logs[key]?.score ?? null });
  }
  return result;
}

function getWeeklyAvgs(logs) {
  const weeks = {};
  for (const [date, log] of Object.entries(logs)) {
    const d = new Date(date);
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const mon = new Date(d); mon.setDate(d.getDate() - dow);
    const wk = mon.toISOString().split('T')[0];
    if (!weeks[wk]) weeks[wk] = [];
    weeks[wk].push(log.score);
  }
  return Object.entries(weeks)
    .map(([wk, scores]) => ({ wk, avg: Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) }))
    .sort((a,b) => a.wk.localeCompare(b.wk));
}

function checkAlert(logs) {
  const today = new Date();
  const recent = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (logs[key]) recent.push(logs[key].score);
  }
  if (recent.length < 3) return null;
  const low3 = recent.slice(0,3).every(s => s < 40);
  const low5 = recent.length >= 5 && recent.slice(0,5).every(s => s < 25);
  if (low5) return 'red';
  if (low3) return 'yellow';
  return null;
}

function LineChart({ data, days }) {
  const W = 560, H = 160, PX = 36, PY = 20;
  const cW = W - PX*2, cH = H - PY*2;
  const vals = data.map(d => d.score ?? 0);
  const max  = 100, min = 0;

  const toX = i => PX + (i / (data.length - 1)) * cW;
  const toY = v => PY + cH - ((v - min) / (max - min)) * cH;

  const pathD = data.map((d,i) => `${i===0?'M':'L'} ${toX(i)} ${toY(d.score??0)}`).join(' ');
  const step = Math.ceil(data.length / 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="metric-svg">
      {[25,50,75].map(v => (
        <line key={v} x1={PX} y1={toY(v)} x2={W-PX} y2={toY(v)}
              stroke="var(--divider)" strokeWidth="1" />
      ))}
      <path d={pathD} fill="none" stroke="var(--green)" strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => d.score !== null && (
        <circle key={i} cx={toX(i)} cy={toY(d.score)} r="4"
                fill={scoreColor(d.score)} stroke="var(--bg-card)" strokeWidth="2" />
      ))}
      {data.map((d, i) => i % step === 0 && (
        <text key={i} x={toX(i)} y={H-2} textAnchor="middle" fontSize="9" fill="var(--text-dim)">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

export default function Metrics({ logs }) {
  const { t } = useLang();
  const [chartDays, setChartDays] = useState(30);

  const allEntries = Object.values(logs);
  const streak     = useMemo(() => getStreak(logs), [logs]);
  const dailyData  = useMemo(() => getDailyScores(logs, chartDays), [logs, chartDays]);
  const weeklyAvgs = useMemo(() => getWeeklyAvgs(logs), [logs]);
  const alert      = useMemo(() => checkAlert(logs), [logs]);

  if (allEntries.length === 0) {
    return (
      <div className="metrics-wrap">
        <div className="metrics-empty">
          <span style={{fontSize:'48px'}}>📊</span>
          <p>{t('no_metrics')}</p>
        </div>
      </div>
    );
  }

  const scores  = allEntries.map(e => e.score);
  const avgScore = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  const bestScore = Math.max(...scores);

  const bestWeek  = weeklyAvgs.reduce((a,b) => a.avg > b.avg ? a : b, weeklyAvgs[0]);
  const worstWeek = weeklyAvgs.reduce((a,b) => a.avg < b.avg ? a : b, weeklyAvgs[0]);

  const fmtWeek = (wk) => {
    const d = new Date(wk);
    return `${d.getDate()}/${d.getMonth()+1}`;
  };

  return (
    <div className="metrics-wrap">
      {/* Alert */}
      {alert && (
        <div className={`metrics-alert ${alert}`}>
          {alert === 'red' ? t('alert_red') : t('alert_yellow')}
        </div>
      )}

      {/* Top cards */}
      <div className="metrics-cards">
        <div className="m-card">
          <span className="m-card-icon">{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '💤'}</span>
          <span className="m-card-val">{streak}</span>
          <span className="m-card-label">{t('streak_days')}</span>
          <div className="streak-dots">
            {[...Array(7)].map((_,i) => {
              const d = new Date(); d.setDate(d.getDate()-(6-i));
              const has = !!logs[d.toISOString().split('T')[0]];
              return <span key={i} className={`sdot ${has?'on':''}`} />;
            })}
          </div>
        </div>
        <div className="m-card">
          <span className="m-card-icon">📊</span>
          <span className="m-card-val" style={{color: scoreColor(avgScore)}}>{avgScore}</span>
          <span className="m-card-label">{t('avg_score')}</span>
        </div>
        <div className="m-card">
          <span className="m-card-icon">⭐</span>
          <span className="m-card-val" style={{color: scoreColor(bestScore)}}>{bestScore}</span>
          <span className="m-card-label">{t('best_score')}</span>
        </div>
        <div className="m-card">
          <span className="m-card-icon">📅</span>
          <span className="m-card-val">{allEntries.length}</span>
          <span className="m-card-label">{t('total_days')}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="metrics-section">
        <div className="metrics-section-head">
          <h3>📈 {t('progress_chart')}</h3>
          <div className="chart-days-btns">
            {[7,14,30,60,90].map(d => (
              <button key={d} className={`cday-btn ${chartDays===d?'active':''}`}
                      onClick={() => setChartDays(d)}>{d}{t('days_short')}</button>
            ))}
          </div>
        </div>
        <div className="chart-wrap">
          <LineChart data={dailyData} days={chartDays} />
        </div>
      </div>

      {/* Best vs Worst week */}
      {weeklyAvgs.length >= 2 && (
        <div className="metrics-section">
          <h3>📊 {t('best_vs_worst')}</h3>
          <div className="bvw-grid">
            <div className="bvw-card best">
              <span className="bvw-label">{t('best_week')}</span>
              <span className="bvw-score" style={{color:'var(--score-high)'}}>{bestWeek.avg}</span>
              <span className="bvw-date">{t('week_of')} {fmtWeek(bestWeek.wk)}</span>
            </div>
            <div className="bvw-vs">VS</div>
            <div className="bvw-card worst">
              <span className="bvw-label">{t('worst_week')}</span>
              <span className="bvw-score" style={{color: scoreColor(worstWeek.avg)}}>{worstWeek.avg}</span>
              <span className="bvw-date">{t('week_of')} {fmtWeek(worstWeek.wk)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
