import { useState } from 'react';
import { authAPI } from '../api';
import { useLang } from '../LangContext';
import './Auth.css';

export default function Auth({ onLogin, onGuest }) {
  const { lang, changeLang, t } = useLang();
  const [mode, setMode]   = useState('login');
  const [user, setUser]   = useState('');
  const [pass, setPass]   = useState('');
  const [conf, setConf]   = useState('');
  const [err,  setErr]    = useState('');
  const [load, setLoad]   = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!user.trim() || !pass) { setErr(t('err_fields')); return; }
    if (mode === 'register') {
      if (user.trim().length < 3) { setErr(t('err_short_user')); return; }
      if (pass.length < 4)        { setErr(t('err_short_pw'));   return; }
      if (pass !== conf)           { setErr(t('err_pw_match'));   return; }
    }
    setLoad(true);
    try {
      if (mode === 'login') {
        await authAPI.login(user.trim().toLowerCase(), pass);
        onLogin(user.trim().toLowerCase());
      } else {
        await authAPI.register(user.trim().toLowerCase(), pass);
        alert(t('ok_registered')); setMode('login');
      }
    } catch (e) {
      setErr(e.response?.data?.detail || t('err_connection'));
    } finally { setLoad(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-top">
        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">{t('app_name')}</span>
        </div>
        <div className="auth-lang">
          <button className={`lang-btn ${lang==='es'?'on':''}`} onClick={() => changeLang('es')}>🇪🇸</button>
          <button className={`lang-btn ${lang==='en'?'on':''}`} onClick={() => changeLang('en')}>🇺🇸</button>
        </div>
      </div>

      <div className="auth-center">
        <div className="auth-hero">
          <h1 className="auth-hero-title">{t('app_name')}</h1>
          <p className="auth-hero-sub">{t('app_sub')}</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-card-title">
            {mode === 'login' ? t('login_title') : t('register_title')}
          </h2>

          <form onSubmit={submit} className="auth-form">
            <div className="auth-field">
              <label>{t('username')}</label>
              <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="usuario" />
            </div>
            <div className="auth-field">
              <label>{t('password')}</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
            </div>
            {mode === 'register' && (
              <div className="auth-field">
                <label>{t('confirm_pw')}</label>
                <input type="password" value={conf} onChange={e => setConf(e.target.value)} placeholder="••••••••" />
              </div>
            )}
            {err && <p className="auth-err">{err}</p>}
            <button className="auth-btn-primary" type="submit" disabled={load}>
              {load ? t('connecting') : mode === 'login' ? t('btn_login') : t('btn_register')}
            </button>
          </form>

          <button className="auth-toggle" onClick={() => { setMode(mode==='login'?'register':'login'); setErr(''); }}>
            {mode === 'login' ? t('go_register') : t('go_login')}
          </button>

          <div className="auth-sep"><span>{t('or')}</span></div>

          <button className="auth-guest" onClick={onGuest}>👁️ {t('guest_btn')}</button>
          <p className="auth-guest-note">{t('guest_note')}</p>
        </div>
      </div>
    </div>
  );
}
