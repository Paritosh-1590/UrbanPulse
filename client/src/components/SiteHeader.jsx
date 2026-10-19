import { ArrowUpRight, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand.jsx'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="/#how-it-works">How it works</a>
          <a href="/#why-urbanpulse">Why UrbanPulse</a>
          <a href="mailto:urbanpulse.project@example.com">Contact</a>
        </nav>
        <div className="header-actions">
          <Link className="login-link" to="/login">Log in</Link>
          <Link className="button button-dark button-small" to="/login">Report an issue <ArrowUpRight size={15} /></Link>
        </div>
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => document.querySelector('.mobile-nav')?.classList.toggle('mobile-nav-open')}><Menu size={20}/></button>
        <nav className="mobile-nav">
          <a href="/#how-it-works">How it works</a>
          <a href="/#why-urbanpulse">Why UrbanPulse</a>
          <Link to="/login">Log in / Report an issue</Link>
        </nav>
      </div>
    </header>
  )
}
