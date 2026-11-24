import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, Clock3, CheckCircle2, ArrowRight, MapPin, FileText } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { apiRequest } from '../../lib/api.js';

const statCards = [
  { label: 'Total Complaints', key: 'total', icon: ClipboardList, color: 'blue' },
  { label: 'Submitted', key: 'submitted', icon: Clock3, color: 'orange' },
  { label: 'In Progress', key: 'inProgress', icon: FileText, color: 'purple' },
  { label: 'Resolved', key: 'resolved', icon: CheckCircle2, color: 'green' },
];

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function CitizenDashboard() {
  const [summary, setSummary] = useState({ total: 0, submitted: 0, inProgress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest('/complaints/summary'), apiRequest('/complaints?limit=5')])
      .then(([stats, result]) => { setSummary(stats); setComplaints(result.items); })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="citizen-dashboard">
      <header className="citizen-dashboard__header">
        <div><p className="citizen-dashboard__eyebrow">CITIZEN PORTAL</p><h1>Your civic dashboard</h1><p>Report local issues and follow the progress of each request.</p></div>
        <Link to="/citizen/complaints/new" className="citizen-button citizen-button--primary"><Plus size={18} />Report an Issue</Link>
      </header>

      <section className="citizen-stats" aria-label="Complaint statistics">
        {statCards.map(({ label, key, icon: Icon, color }) => <article className="citizen-stat-card" key={key}><div className={`citizen-stat-card__icon ${color}`}><Icon size={21} /></div><div><p>{label}</p><strong>{loading ? '—' : summary[key] ?? 0}</strong></div></article>)}
      </section>

      {error && <div className="citizen-alert citizen-alert--error" role="alert">{error}</div>}
      <section className="citizen-dashboard__section">
        <div className="citizen-section-heading"><div><h2>Recent Complaints</h2><p>Updates on the issues you have reported.</p></div><Link to="/citizen/complaints" className="citizen-text-link">View all <ArrowRight size={16} /></Link></div>
        {loading ? <div className="citizen-form-card citizen-loading">Loading your complaints…</div> : complaints.length ? <div className="citizen-complaints-list">
          {complaints.map((complaint) => <article className="citizen-complaint-row" key={complaint._id}>
            <div className="citizen-complaint-row__icon"><FileText size={21} /></div>
            <div className="citizen-complaint-row__details"><h3>{complaint.title}</h3><p>{complaint.complaintId} · {complaint.category}</p><p className="citizen-complaint-row__location"><MapPin size={14} />{complaint.location} · {formatDate(complaint.createdAt)}</p></div>
            <div className="citizen-complaint-row__status"><StatusBadge status={complaint.status} /><Link to={`/citizen/complaints/${complaint.complaintId}`} className="citizen-text-link">Details <ArrowRight size={15} /></Link></div>
          </article>)}
        </div> : <div className="citizen-empty-state"><ClipboardList size={34} /><h2>No complaints yet</h2><p>Start by reporting a civic issue in your area.</p></div>}
      </section>
    </main>
  );
}
