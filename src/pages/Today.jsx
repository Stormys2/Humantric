import { useState, useEffect } from 'react';
import { logsAPI } from '../api';
import { useLang } from '../LangContext';
import { CATEGORIES, calcScore, scoreColor, scoreLabel, categoryScore } from '../habits';
import './Today.css';

function dateKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export default function Today({ logs, setLogs, isGuest }) {
  const { t } = useLang();
  const now = new Date();

  const [day,        setDay]        = useState(now.getDate());
  const [month,      setMonth]      = useState(now.getMonth());
  const [year,       setYear]       = useState(now.getFullYear());
  const [checks,     setChecks]     = useState({});
  const [reflection, setReflection] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [error,      setError]      = useState('');

  const key = dateKey(year, month, day);

  useEffect(() => {
    const existing = logs[key];
    if (existing) {
      setChecks(typeof existing.checks === 'string' ? JSON.parse(existing.checks) : existing.checks || {});
      setReflection(existing.reflection || '');
      setSaved(true);
    } else {
      setChecks({});
      setReflection('');
      setSaved(false);
    }
  }, [key, logs]);

  const toggle = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  const doneCount = Object.values(checks).filter(Boolean).length;
  const score     = calcScore(checks);
  const color     = scoreColor(score);
  const MONTHS    = t('months');
  const isToday   = key === new Date().toISOString().split('T')[0];

  const handleSave = async () => {
    if (isGuest) { alert(t('guest_save_blocked')); return; }
    setSaving(true); setError('');
    try {
      const payload = { date: key, checks: JSON.stringify(checks), score, reflection };
      if (saved) {
        await logsAPI.update(key, payload);
      } else {
        await logsAPI.save(payload);
      }
      setLogs(prev => ({ ...prev, [key]: { ...payload, checks } }));
      setSaved(true);
      alert(t('saved_ok'));
    } catch {
      setError(t('err_save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="today-wrap">

      {/* Date selector */}
      <div className="today-date-card">
        <span className="today-date-label">
          {isToday ? `📅 ${t('today_title')}` : `📅 ${t('editing_past')}`}
        </span>
        <div className="today-date-row">
          <select value={day} onChange={e => setDay(+e.target.value)} className="today-select">
            {[...Array(31)].map((_,i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(+e.target.value)} className="today-select wide">
            {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="today-select">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {!isToday && (
          <button className="today-go-now" onClick={() => {
            setDay(now.getDate()); setMonth(now.getMonth()); setYear(now.getFullYear());
          }}>→ {t('go_today')}</button>
        )}
      </div>

      {/* Score hero */}
      <div className="score-hero">
        <div className="score-ring-wrap">
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-card2)" strokeWidth="8" />
            <circle cx="60" cy="60" r="50" fill="none"
              stroke={color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 314} 314`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s' }}
            />
          </svg>
          <div className="score-inner">
            <span className="score-number" style={{ color }}>{score}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
        <div className="score-info">
          <h2 className="score-label" style={{ color }}>{scoreLabel(score, t)}</h2>
          <p className="score-habits">{doneCount} {t('habits_done')}</p>
        </div>
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const catPct = categoryScore(cat.id, checks);
        return (
          <div className="cat-section" key={cat.id}>
            <div className="cat-header">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{t(`cat_${cat.id}`)}</span>
              <div className="cat-bar-wrap">
                <div className="cat-bar" style={{ width: `${catPct}%`, background: scoreColor(catPct) }} />
              </div>
              <span className="cat-pct" style={{ color: scoreColor(catPct) }}>{catPct}%</span>
            </div>
            <div className="habit-list">
              {cat.habits.map(h => (
                <button key={h.id}
                  className={`habit-item ${checks[h.id] ? 'checked' : ''}`}
                  onClick={() => toggle(h.id)}>
                  <span className="habit-icon">{h.icon}</span>
                  <span className="habit-label">{t(`habit_${h.id}`)}</span>
                  <span className="habit-check">{checks[h.id] ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Reflection */}
      <div className="reflection-card">
        <span className="reflection-label">💬 {t('reflection_label')}</span>
        <textarea
          className="reflection-input"
          placeholder={t('reflection_placeholder')}
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          rows={4}
        />
      </div>

      {error && <p className="today-error">{error}</p>}

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? t('saving') : saved ? t('update_day') : t('save_day')}
      </button>
    </div>
  );
}
