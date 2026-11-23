import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, ArrowRight, ClipboardList } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { apiRequest } from '../../lib/api.js';

const filters = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function MyComplaints() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (search.trim()) params.set('q', search.trim());
    if (statusFilter !== 'All') params.set('status', statusFilter);
    apiRequest(`/complaints?${params.toString()}`)
      .then((result) => { if (active) { setComplaints(result.items); setTotal(result.pagination.total); setError(''); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, statusFilter]);

  return (
    <main className="citizen-complaints-page">
      <header className="citizen-dashboard__header"><div><p className="citizen-dashboard__eyebrow">CITIZEN PORTAL</p><h1>My Complaints</h1><p>View and track the issues you have reported.</p></div><Link to="/citizen/complaints/new" className="citizen-button citizen-button--primary"><Plus size={18} />Report an Issue</Link></header>
      <section className="citizen-complaints-panel">
        <div className="citizen-complaints-toolbar"><label className="citizen-search"><Search size={18} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, ID, location, or category…" aria-label="Search complaints" /></label><label className="citizen-status-filter"><span>Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{filters.map((filter) => <option key={filter} value={filter}>{filter}</option>)}</select></label></div>
        <div className="citizen-complaints-results"><p>Showing <strong>{complaints.length}</strong> of <strong>{total}</strong> complaints</p></div>
        {error && <div className="citizen-alert citizen-alert--error" role="alert">{error}</div>}
        {loading ? <div className="citizen-loading">Loading complaints…</div> : complaints.length ? <div className="citizen-complaints-list">{complaints.map((complaint) => <article className="citizen-complaint-row" key={complaint._id}><div className="citizen-complaint-row__icon"><ClipboardList size={21} /></div><div className="citizen-complaint-row__details"><h2>{complaint.title}</h2><p>{complaint.complaintId} · {complaint.category}</p><p className="citizen-complaint-row__location"><MapPin size={14} />{complaint.location} · {formatDate(complaint.createdAt)}</p></div><div className="citizen-complaint-row__status"><StatusBadge status={complaint.status} /><Link to={`/citizen/complaints/${complaint.complaintId}`} className="citizen-text-link">View details <ArrowRight size={15} /></Link></div></article>)}</div> : <div className="citizen-empty-state"><ClipboardList size={34} /><h2>No complaints found</h2><p>Try another search or submit your first issue.</p><Link className="citizen-button citizen-button--primary" to="/citizen/complaints/new">Report an issue</Link></div>}
      </section>
    </main>
  );
}
