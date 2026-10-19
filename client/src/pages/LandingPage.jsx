import {
  ArrowRight, ArrowUpRight, Check, ClipboardList, Clock3, MapPin,
  ShieldCheck, TrafficCone, Trash2, Lightbulb, Droplets, FileText,
  BarChart3, Building2, CircleCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

const categories = [
  { icon: TrafficCone, title: 'Road damage', description: 'Potholes, broken pavements and unsafe road surfaces.', tone: 'sage' },
  { icon: Trash2, title: 'Waste & sanitation', description: 'Overflowing bins and missed waste collection.', tone: 'lime' },
  { icon: Lightbulb, title: 'Streetlights', description: 'Lights that are broken, flickering or switched off.', tone: 'sand' },
  { icon: Droplets, title: 'Water leakage', description: 'Visible leaks and water-related infrastructure issues.', tone: 'blue' },
]

const steps = [
  { number: '01', title: 'Make a report', text: 'Describe the issue, add a photo and mark where it happened.' },
  { number: '02', title: 'It gets organised', text: 'The report is categorised and directed to the relevant department.' },
  { number: '03', title: 'Follow the status', text: 'Check updates and see when a report needs further attention.' },
]

const features = [
  { icon: MapPin, title: 'Location-aware reports', text: 'Give each report a clear place so teams can understand where help is needed.' },
  { icon: ClipboardList, title: 'One record to follow', text: 'Keep the complaint details, status changes and updates together.' },
  { icon: Clock3, title: 'Time-bound handling', text: 'SLA rules are designed to flag reports that pass their response deadline.' },
  { icon: ShieldCheck, title: 'Clear accountability', text: 'Role-based access and a status history help make changes traceable.' },
]

function DashboardPreview() {
  return (
    <div className="product-preview">
      <aside className="preview-sidebar">
        <div className="preview-brand"><span className="preview-brand-mark">U</span> UrbanPulse</div>
        <div className="preview-side-label">WORKSPACE</div>
        <div className="preview-nav active"><BarChart3 size={14} /> Overview</div>
        <div className="preview-nav"><ClipboardList size={14} /> Complaints <span>12</span></div>
        <div className="preview-nav"><MapPin size={14} /> Map view</div>
        <div className="preview-nav"><Building2 size={14} /> Departments</div>
        <div className="preview-side-bottom"><span className="preview-avatar">AD</span><span>Admin workspace<small>Demo preview</small></span></div>
      </aside>
      <div className="preview-main">
        <div className="preview-main-top"><div><small>MONDAY, 19 OCTOBER</small><strong>Complaint overview</strong></div><span className="preview-filter">All wards⌄</span></div>
        <div className="preview-stat-grid">
          <div className="preview-stat"><span>Open reports</span><strong>24</strong><small><i className="stat-dot green-dot"></i>Needs attention</small></div>
          <div className="preview-stat"><span>In progress</span><strong>08</strong><small><i className="stat-dot blue-dot"></i>Being handled</small></div>
          <div className="preview-stat"><span>Overdue</span><strong>03</strong><small><i className="stat-dot orange-dot"></i>Past SLA</small></div>
        </div>
        <div className="preview-table-head"><strong>Recent complaints</strong><span>View all <ArrowRight size={11}/></span></div>
        <div className="preview-table">
          <div className="preview-row table-header"><span>ISSUE</span><span>WARD</span><span>STATUS</span></div>
          <div className="preview-row"><span><i className="table-issue-icon road"><TrafficCone size={12}/></i><b>Road damage</b></span><span>Ward 04</span><em className="mini-status progress">In progress</em></div>
          <div className="preview-row"><span><i className="table-issue-icon waste"><Trash2 size={12}/></i><b>Waste collection</b></span><span>Ward 02</span><em className="mini-status open">Open</em></div>
          <div className="preview-row"><span><i className="table-issue-icon light"><Lightbulb size={12}/></i><b>Streetlight fault</b></span><span>Ward 01</span><em className="mini-status overdue">Overdue</em></div>
        </div>
        <div className="preview-foot"><span><i className="preview-live-dot"></i>Illustrative dashboard</span><span>Sample data</span></div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> CIVIC REPORTING, MADE CLEARER</div>
              <h1>Better local services begin with <em>a report.</em></h1>
              <p className="hero-description">A simpler way to report everyday civic issues, follow their progress, and help make sure nothing gets lost along the way.</p>
              <div className="hero-actions">
                <Link to="/login" className="button button-dark">Report an issue <ArrowUpRight size={16} /></Link>
                <a href="#how-it-works" className="text-link">How it works <ArrowRight size={15} /></a>
              </div>
              <div className="hero-trustline"><span><Check size={14}/></span>For citizens and the teams who serve them</div>
            </div>
            <div className="hero-product">
              <div className="product-label"><span className="product-label-dot"></span> A LOOK INSIDE URBANPULSE</div>
              <DashboardPreview />
              <div className="floating-note"><span className="floating-note-icon"><Clock3 size={16}/></span><span><b>Deadlines stay visible</b><small>Designed around response times</small></span><ArrowUpRight size={15}/></div>
            </div>
          </div>
          <div className="container hero-category-bar">
            <span className="category-intro">ISSUES THAT MATTER</span>
            {categories.map(({icon: Icon, title}) => <span className="category-chip" key={title}><Icon size={14}/>{title}</span>)}
          </div>
        </section>

        <section className="problem-section" id="impact">
          <div className="container problem-grid">
            <div>
              <div className="section-kicker">THE EVERYDAY CHALLENGE</div>
              <h2>A complaint should never disappear into <em>the process.</em></h2>
            </div>
            <div className="problem-right">
              <p>When an issue is reported, people need more than a submission form. They need to know where it went, who is handling it, and what happens if it remains unresolved.</p>
              <div className="principle-list">
                <div><span className="principle-check"><Check size={15} /></span><span><strong>Clear ownership</strong><small>Direct each report towards the right department.</small></span></div>
                <div><span className="principle-check"><Check size={15} /></span><span><strong>Visible progress</strong><small>Make status updates easier to understand and follow.</small></span></div>
                <div><span className="principle-check"><Check size={15} /></span><span><strong>Time-bound follow-up</strong><small>Flag complaints that pass their configured deadline.</small></span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="container">
            <div className="section-heading">
              <div><div className="section-kicker">ONE PLACE TO START</div><h2>Everyday issues. <em>A clearer process.</em></h2></div>
              <p>UrbanPulse is being designed around the civic problems people encounter most often.</p>
            </div>
            <div className="category-grid">
              {categories.map(({icon: Icon, title, description, tone}) => <article className="category-card" key={title}>
                <div className={`category-icon ${tone}`}><Icon size={21}/></div>
                <h3>{title}</h3><p>{description}</p><span className="card-arrow"><ArrowUpRight size={16}/></span>
              </article>)}
            </div>
          </div>
        </section>

        <section className="workflow-section" id="how-it-works">
          <div className="container workflow-grid">
            <div className="workflow-intro">
              <div className="section-kicker">HOW URBANPULSE WORKS</div>
              <h2>From first report to <em>follow-up.</em></h2>
              <p>A straightforward flow for citizens, with a more organised view for the teams responsible for handling issues.</p>
              <Link to="/login" className="button button-dark">Get started <ArrowUpRight size={16}/></Link>
            </div>
            <div className="workflow-steps">
              {steps.map((step, index) => <article className="workflow-step" key={step.number}>
                <span className="workflow-number">{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
                <span className="workflow-step-icon">{index === 0 ? <FileText size={18}/> : index === 1 ? <Building2 size={18}/> : <CircleCheck size={18}/>}</span>
              </article>)}
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="center-heading"><div className="section-kicker">BUILT FOR ACCOUNTABILITY</div><h2>Useful information at <em>every step.</em></h2><p>The proposed platform brings reporting, routing and follow-up into one consistent workflow.</p></div>
            <div className="features-grid">
              {features.map(({icon: Icon, title, text}) => <article className="feature-card" key={title}><Icon size={20}/><h3>{title}</h3><p>{text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-inner">
            <div><div className="section-kicker">A BETTER WAY TO FOLLOW UP</div><h2>Have an issue to report?</h2><p>Start with the details. Keep the next steps visible.</p></div>
            <Link to="/login" className="button button-dark">Open UrbanPulse <ArrowUpRight size={17}/></Link>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-top"><Brand light/><div className="footer-links"><a href="#how-it-works">How it works</a><a href="#impact">Our approach</a><Link to="/login">Login</Link></div><span className="footer-project-label">A civic issue reporting prototype</span></div>
        <div className="container footer-bottom"><span>© 2026 UrbanPulse</span><span>Designed for more transparent civic reporting.</span></div>
      </footer>
    </div>
  )
}
