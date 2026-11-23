import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && user) navigate(user.role === 'citizen' ? '/citizen' : '/admin', { replace: true });
  }, [loading, user, navigate]);

  if (!loading && user) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const signedInUser = mode === 'register'
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);
      const fallback = signedInUser.role === 'citizen' ? '/citizen' : '/admin';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    navigate(nextMode === 'register' ? '/register' : '/login', { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-story-top"><Brand light /><Link className="back-link" to="/"><ArrowLeft size={15} /> Back to UrbanPulse</Link></div>
        <div className="auth-story-content">
          <div className="eyebrow eyebrow-light"><span className="eyebrow-block">UP</span> CIVIC REPORTING</div>
          <h1>Local issues.<br />A clearer way<br />to <em>follow through.</em></h1>
          <p>Keep your reports in one place and follow the steps between submission and resolution.</p>
          <div className="auth-story-card"><span className="story-card-icon"><LockKeyhole size={17} /></span><div><strong>Designed for transparency</strong><span>Track the process, not just the submission.</span></div></div>
        </div>
        <div className="auth-story-footer">URBANPULSE · CIVIC ISSUE REPORTING</div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-form-wrap">
          <span className="form-overline">WELCOME TO URBANPULSE</span>
          <h2>{mode === 'register' ? 'Create your account.' : 'Sign in to continue.'}</h2>
          <p className="form-intro">{mode === 'register' ? 'Citizen accounts can report and track local issues.' : 'Use your account to open your workspace.'}</p>
          <div className="role-switch auth-mode-switch" role="group" aria-label="Authentication mode">
            <button type="button" className={mode === 'login' ? 'role-active' : ''} onClick={() => changeMode('login')}>Sign in</button>
            <button type="button" className={mode === 'register' ? 'role-active' : ''} onClick={() => changeMode('register')}>Create account</button>
          </div>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && <><label htmlFor="name">Full name</label><div className="input-wrap"><UserRound size={17} /><input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" autoComplete="name" minLength={2} maxLength={80} required /></div></>}
            <label htmlFor="email">Email address</label>
            <div className="input-wrap"><Mail size={17} /><input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" autoComplete="email" required /></div>
            <div className="password-label"><label htmlFor="password">Password</label>{mode === 'login' && <span>Use your registered password</span>}</div>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create citizen account' : 'Sign in'} <ArrowRight size={16} /></button>
          </form>
          {error && <div className="form-notice form-notice--error" role="alert">{error}</div>}
          <div className="auth-footnote">Administrator accounts are provisioned by the project administrator. New registrations receive citizen access.</div>
        </div>
        <div className="auth-bottom-note">UrbanPulse is an academic prototype for civic issue reporting.</div>
      </section>
    </main>
  );
}
