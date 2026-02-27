import { useState, useEffect } from 'react';
import { logsAPI } from '../api';
import { useLang } from '../LangContext';
import { CATEGORIES, calcScore, scoreColor, scoreLabel, categoryScore } from '../habits';
import './Today.css';

const todayKey = () => new Date().toISOString().split('T')[0];

export default function Today({ logs, setLogs, isGuest }) {
  const { t } = useLang();
  const key = todayKey();
  const existing = logs[key];

  const [checks,  setChecks]  = useState(existing?.checks || {});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(!!existing);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (existing) { setChecks(existing.checks || {}); setSaved(true); }
  }, [existing]);

  const toggle = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  const doneCount = Object.values(checks).filter(Boolean).length;
  const score     = calcScore(checks);
  const color     = scoreColor(score);

  const handleSave = async () => {
    if (isGuest) { alert(t('guest_save_blocked')); return; }
    setSaving(true); setError('');
    try {
      const payload = { date: key, checks: JSON.stringify(checks), score };
      if (saved) {
        await logsAPI.update(key, payload);
      } else {
        await logsAPI.save(payload);
      }
      setLogs(prev => ({ ...prev, [key]: payload }));
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
      {/* Score hero */}
      <div className="score-hero">
        <div className="score-ring-wrap">
          <svg className="score-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-card2)" strokeWidth="8" />
            <circle cx="60" cy="60" r="50" fill="none"
              stroke={color} strokeWidth="8"
              strokeLinecap="round"
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
                <button
                  key={h.id}
                  className={`habit-item ${checks[h.id] ? 'checked' : ''}`}
                  onClick={() => toggle(h.id)}
                >
                  <span className="habit-icon">{h.icon}</span>
                  <span className="habit-label">{t(`habit_${h.id}`)}</span>
                  <span className="habit-check">{checks[h.id] ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {error && <p className="today-error">{error}</p>}

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? t('saving') : saved ? t('update_day') : t('save_day')}
      </button>
    </div>
  );
}
