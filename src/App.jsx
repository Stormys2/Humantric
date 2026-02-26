import { useState, useEffect } from 'react';
import { authAPI, logsAPI } from './api';
import { LangProvider, useLang } from './LangContext';
import Auth from './pages/Auth';
import Today from './pages/Today';
import History from './pages/History';
import Metrics from './pages/Metrics';
import './index.css';
import './App.css';

function AppInner() {
  const { lang, changeLang, t } = useLang();
  const [user,    setUser]    = useState(localStorage.getItem('h_user'));
  const [isGuest, setIsGuest] = useState(false);
  const [tab,     setTab]     = useState('today');
  const [logs,    setLogs]    = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isGuest) loadLogs();
  }, [user]); // eslint-disable-line

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getAll();
      const dict = {};
      for (const l of res.data) dict[l.date] = l;
      setLogs(dict);
    } catch {
      authAPI.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest  = () => { setIsGuest(true); setUser('guest'); setLogs({}); };
  const handleLogout = () => {
    if (!isGuest) authAPI.logout();
    setUser(null); setIsGuest(false); setLogs({});
  };

  if (!user) return (
    <Auth
      onLogin={(u) => { setIsGuest(false); setUser(u); }}
      onGuest={handleGuest}
    />
  );

  return (
    <div className="app">
      {isGuest && (
        <div className="guest-bar">
          <span>👁️ {t('guest_banner')}</span>
          <button onClick={() => { setUser(null); setIsGuest(false); }}>
            {t('guest_register_now')}
          </button>
        </div>
      )}

      <header className="app-head">
        <div className="app-head-left">
          <div className="app-logo-dot" />
          <span className="app-name">{t('app_name')}</span>
        </div>
        <div className="app-head-right">
          <div className="lang-btns">
            <button className={`lang-btn ${lang==='es'?'on':''}`} onClick={() => changeLang('es')}>🇪🇸</button>
            <button className={`lang-btn ${lang==='en'?'on':''}`} onClick={() => changeLang('en')}>🇺🇸</button>
          </div>
          <span className="app-user">👤 {isGuest ? t('guest_label') : user}</span>
          <button className="app-logout-btn" onClick={handleLogout}>
            {isGuest ? t('guest_exit') : t('logout')}
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {[['today',   t('tab_today')],
          ['history', t('tab_history')],
          ['metrics', t('tab_metrics')]].map(([key, label]) => (
          <button key={key} className={`nav-tab ${tab===key?'active':''}`}
                  onClick={() => setTab(key)}>{label}</button>
        ))}
      </nav>

      <main className="app-main">
        {loading ? (
          <div className="app-loading">{t('loading')}</div>
        ) : tab === 'today' ? (
          <Today logs={logs} setLogs={setLogs} isGuest={isGuest} />
        ) : tab === 'history' ? (
          <History logs={logs} />
        ) : (
          <Metrics logs={logs} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return <LangProvider><AppInner /></LangProvider>;
}
