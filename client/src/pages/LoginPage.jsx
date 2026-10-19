import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand.jsx'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('citizen')
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('Authentication is not connected yet. This screen is a UI prototype; do not use real credentials.')
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
          <h2>Sign in to continue.</h2>
          <p className="form-intro">Choose the workspace you want to access.</p>
          <div className="role-switch" role="group" aria-label="Account type">
            <button type="button" className={role === 'citizen' ? 'role-active' : ''} onClick={() => setRole('citizen')}>Citizen</button>
            <button type="button" className={role === 'admin' ? 'role-active' : ''} onClick={() => setRole('admin')}>Department admin</button>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <div className="input-wrap"><Mail size={17} /><input id="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div>
            <div className="password-label"><label htmlFor="password">Password</label><a href="#forgot" onClick={(e) => { e.preventDefault(); setNotice('Password recovery will be added with backend authentication.') }}>Forgot password?</a></div>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            <button className="button button-dark auth-submit" type="submit">Continue as {role === 'citizen' ? 'citizen' : 'admin'} <ArrowRight size={16} /></button>
          </form>
          {notice && <div className="form-notice" role="status">{notice}</div>}
          <div className="auth-footnote">Prototype only — do not enter real credentials.</div>
        </div>
        <div className="auth-bottom-note">UrbanPulse is an academic prototype for civic issue reporting.</div>
      </section>
    </main>
  )
}
