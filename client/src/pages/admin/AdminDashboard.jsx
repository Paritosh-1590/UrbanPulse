import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle2, Clock3, ClipboardList, Plus, Search, Users, X } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { apiRequest } from '../../lib/api.js';

const STAT_CARDS = [
  { key: 'total', label: 'All complaints', icon: ClipboardList, tone: 'blue' },
  { key: 'submitted', label: 'Awaiting review', icon: Clock3, tone: 'orange' },
  { key: 'inProgress', label: 'Being handled', icon: Activity, tone: 'purple' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, tone: 'green' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, tone: 'red' },
];
const STATUSES = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = ['All', 'Roads', 'Sanitation', 'Water', 'Electricity', 'Drainage', 'Other'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [department, setDepartment] = useState('All');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOfficialForm, setShowOfficialForm] = useState(false);
  const [officialForm, setOfficialForm] = useState({ name: '', email: '', password: '', department: '' });
  const [creatingOfficial, setCreatingOfficial] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search.trim()) params.set('q', search.trim());
      if (status !== 'All') params.set('status', status);
      if (category !== 'All') params.set('category', category);
      if (priority !== 'All') params.set('priority', priority);
      if (department !== 'All') params.set('assignedDepartment', department);
      if (overdueOnly) params.set('overdue', 'true');
      const [stats, list, deptData] = await Promise.all([
        apiRequest('/admin/summary'),
        apiRequest(`/admin/complaints?${params.toString()}`),
        apiRequest('/admin/departments'),
      ]);
      setSummary(stats);
      setItems(list.items);
      setDepartments(deptData.departments);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, [search, status, category, priority, department, overdueOnly]);

  async function createOfficial(event) {
    event.preventDefault();
    setNotice('');
    setError('');
    setCreatingOfficial(true);
    try {
      await apiRequest('/admin/department-officials', { method: 'POST', body: officialForm });
      setNotice(`Department account created for ${officialForm.email}. Share the login details securely.`);
      setOfficialForm({ name: '', email: '', password: '', department: '' });
      setShowOfficialForm(false);
    } catch (requestError) { setError(requestError.message); }
    finally { setCreatingOfficial(false); }
  }

  const isAdmin = user?.role === 'admin';
  return (
    <main className="admin-page">
      <header className="admin-header"><div><p className="citizen-dashboard__eyebrow">{isAdmin ? 'ADMIN WORKSPACE' : 'DEPARTMENT WORKSPACE'}</p><h1>{isAdmin ? 'Complaint overview' : 'Department queue'}</h1><p>{isAdmin ? 'Review incoming issues, assign ownership, and track service deadlines.' : `Complaints assigned to ${user?.department || 'your department'}.`}</p></div>{isAdmin && <button className="citizen-button citizen-button--primary" onClick={() => setShowOfficialForm((value) => !value)}><Users size={17} />Add department user</button>}</header>

      {notice && <div className="citizen-alert citizen-alert--success">{notice}</div>}
      {error && <div className="citizen-alert citizen-alert--error" role="alert">{error}</div>}

      {showOfficialForm && <section className="admin-official-form citizen-form-card"><div className="admin-form-title"><div><h2>Create department account</h2><p>Department users can view and update complaints assigned to their department.</p></div><button type="button" className="admin-icon-button" aria-label="Close form" onClick={() => setShowOfficialForm(false)}><X size={18} /></button></div><form onSubmit={createOfficial} className="admin-form-grid"><label>Full name<input required minLength={2} maxLength={80} value={officialForm.name} onChange={(event) => setOfficialForm({ ...officialForm, name: event.target.value })} /></label><label>Email<input required type="email" value={officialForm.email} onChange={(event) => setOfficialForm({ ...officialForm, email: event.target.value })} /></label><label>Department<select required value={officialForm.department} onChange={(event) => setOfficialForm({ ...officialForm, department: event.target.value })}><option value="">Select department</option>{departments.map((value) => <option key={value}>{value}</option>)}</select></label><label>Temporary password<input required minLength={12} type="password" value={officialForm.password} onChange={(event) => setOfficialForm({ ...officialForm, password: event.target.value })} placeholder="At least 12 characters" /></label><div className="admin-form-submit"><button disabled={creatingOfficial} type="submit" className="citizen-button citizen-button--primary">{creatingOfficial ? 'Creating…' : 'Create account'}</button></div></form></section>}

      <section className="admin-stats-grid">{STAT_CARDS.map(({ key, label, icon: Icon, tone }) => <article className="admin-stat-card" key={key}><span className={`admin-stat-icon ${tone}`}><Icon size={20} /></span><div><p>{label}</p><strong>{loading ? '—' : summary[key] ?? 0}</strong></div></article>)}</section>
      <section className="admin-queue-panel">
        <div className="admin-queue-heading"><div><h2>Complaint queue</h2><p>Search reports and open a record to review its history or update it.</p></div><button type="button" className={`admin-overdue-toggle${overdueOnly ? ' active' : ''}`} onClick={() => setOverdueOnly((value) => !value)}><AlertTriangle size={15} />{overdueOnly ? 'Showing overdue' : 'Overdue only'}</button></div>
        <div className={`admin-filters${isAdmin ? ' admin-filters--with-department' : ''}`}><label className="citizen-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, title, location…" aria-label="Search complaints" /></label><label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value)}>{PRIORITIES.map((value) => <option key={value}>{value}</option>)}</select></label>{isAdmin && <label><span>Department</span><select value={department} onChange={(event) => setDepartment(event.target.value)}><option>All</option>{departments.map((value) => <option key={value}>{value}</option>)}</select></label>}</div>
        {loading ? <div className="citizen-loading">Loading complaint queue…</div> : items.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Complaint</th><th>Category</th><th>Department</th><th>Priority</th><th>Submitted</th><th>Status</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item._id} className={item.isOverdue ? 'is-overdue' : ''}><td><Link to={`/admin/complaints/${item.complaintId}`} className="admin-complaint-link"><strong>{item.title}</strong><span>{item.complaintId} · {item.citizen?.name || 'Citizen'} · {item.location}</span></Link></td><td>{item.category}</td><td>{item.assignedDepartment || <span className="admin-muted">Unassigned</span>}</td><td><span className={`priority-label priority-${String(item.priority).toLowerCase()}`}>{item.priority}</span></td><td>{formatDate(item.createdAt)}</td><td><StatusBadge status={item.status} />{item.isOverdue && <small className="admin-overdue-text">Overdue</small>}</td><td><Link className="admin-open-link" to={`/admin/complaints/${item.complaintId}`}>Open</Link></td></tr>)}</tbody></table></div> : <div className="citizen-empty-state"><ClipboardList size={32} /><h2>No matching complaints</h2><p>Try changing the filters or search terms.</p></div>}
        <div className="admin-queue-footer"><span>{items.length} records displayed · {summary.total ?? 0} total complaints</span><span><CheckCircle2 size={14} />Data from UrbanPulse API</span></div>
      </section>
    </main>
  );
}
