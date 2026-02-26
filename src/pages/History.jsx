import { useState } from 'react';
import { useLang } from '../LangContext';
import { scoreColor, scoreLabel, CATEGORIES } from '../habits';
import './History.css';

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const start = first === 0 ? 6 : first - 1;
  const grid  = [];
  let day = 1 - start;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++)
      week.push(day > 0 && day <= days ? day : null);
    grid.push(week);
    if (day > days) break;
  }
  return grid;
}

function dayKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export default function History({ logs }) {
  const { t } = useLang();
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay,setSelDay]= useState(today.getDate());

  const MONTHS   = t('months');
  const WEEKDAYS = t('weekdays');
  const grid     = getMonthGrid(year, month);
  const selKey   = dayKey(year, month, selDay);
  const selLog   = logs[selKey];

  const prev = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  return (
    <div className="hist-wrap">
      <div className="hist-left">
        <div className="hist-nav">
          <button className="hist-nav-btn" onClick={prev}>◀</button>
          <span className="hist-month-title">{MONTHS[month]} {year}</span>
          <button className="hist-nav-btn" onClick={next}>▶</button>
        </div>

        <div className="hist-weekdays">
          {WEEKDAYS.map((d,i) => (
            <span key={i} className={`hist-wd ${i>=5?'weekend':''}`}>{d}</span>
          ))}
        </div>

        <div className="hist-grid">
          {grid.map((week, wi) => (
            <div className="hist-row" key={wi}>
              {week.map((d, di) => {
                if (!d) return <div className="hist-cell empty" key={di} />;
                const key   = dayKey(year, month, d);
                const log   = logs[key];
                const isToday = d===today.getDate() && month===today.getMonth() && year===today.getFullYear();
                const isSel   = d === selDay;
                const score   = log?.score ?? null;
                const color   = score !== null ? scoreColor(score) : null;
                return (
                  <div key={di}
                    className={`hist-cell ${isToday?'today':''} ${isSel?'selected':''} ${log?'has-data':''} ${di>=5?'weekend':''}`}
                    onClick={() => setSelDay(d)}
                  >
                    <span className="hist-day-num">{d}</span>
                    {score !== null && (
                      <span className="hist-score" style={{ color }}>{score}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      <div className="hist-right">
        <h3 className="hist-detail-title">{selDay} {MONTHS[month]} {year}</h3>
        {!selLog ? (
          <p className="hist-no-data">{t('no_data_day')}</p>
        ) : (
          <>
            <div className="hist-score-card">
              <span className="hist-score-big" style={{ color: scoreColor(selLog.score) }}>
                {selLog.score}
              </span>
              <span className="hist-score-label" style={{ color: scoreColor(selLog.score) }}>
                {scoreLabel(selLog.score, t)}
              </span>
            </div>

            {CATEGORIES.map(cat => {
              const done = cat.habits.filter(h => selLog.checks?.[h.id]).length;
              const total = cat.habits.length;
              if (done === 0) return null;
              return (
                <div className="hist-cat-row" key={cat.id}>
                  <span className="hist-cat-icon">{cat.icon}</span>
                  <span className="hist-cat-name">{t(`cat_${cat.id}`)}</span>
                  <span className="hist-cat-count">{done}/{total}</span>
                  <div className="hist-habit-dots">
                    {cat.habits.map(h => (
                      <span key={h.id}
                        className={`hist-dot ${selLog.checks?.[h.id] ? 'on' : ''}`}
                        title={t(`habit_${h.id}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
