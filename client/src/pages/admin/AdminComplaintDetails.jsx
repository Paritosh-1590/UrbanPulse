import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CalendarDays, MapPin, UserRound, Save, Clock3 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import ComplaintEvidence from '../../components/ComplaintEvidence.jsx';
import ComplaintLocationMap from '../../components/map/ComplaintLocationMap.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { apiRequest } from '../../lib/api.js';

const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const formatDate = (value) => value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function AdminComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [department, setDepartment] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const isAdmin = user?.role === 'admin';

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/complaints/${encodeURIComponent(id)}`);
      setComplaint(data.complaint);
      setDepartment(data.complaint.assignedDepartment || '');
      setAssignedTo(data.complaint.assignedTo?._id || data.complaint.assignedTo || '');
      const assignedStatus = data.complaint.status;
      const transitions = {
        Submitted: ['Rejected'],
        Assigned: ['In Progress', 'Rejected'],
        'In Progress': ['Resolved', 'Rejected'],
        Resolved: [], Rejected: [],
      };
      const choices = isAdmin ? transitions[assignedStatus] : (assignedStatus === 'Assigned' ? ['In Progress'] : assignedStatus === 'In Progress' ? ['Resolved'] : []);
      setNextStatus(choices?.[0] || '');
      if (isAdmin) {
        const [deptData, officialsData] = await Promise.all([apiRequest('/admin/departments'), apiRequest('/admin/department-officials')]);
        setDepartments(deptData.departments);
        setOfficials(officialsData.officials);
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function saveAssignment(event) {
    event.preventDefault();
    setSaving(true); setError(''); setNotice('');
    try {
      const data = await apiRequest(`/admin/complaints/${encodeURIComponent(id)}/assign`, { method: 'PATCH', body: { department, assignedTo: assignedTo || null } });
      setComplaint((current) => ({ ...current, ...data.complaint }));
      setNotice('Department assignment saved.');
      await load();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function saveStatus(event) {
    event.preventDefault();
    if (!nextStatus) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const data = await apiRequest(`/admin/complaints/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status: nextStatus, note } });
      setComplaint((current) => ({ ...current, ...data.complaint }));
      setNote(''); setNotice(`Status updated to ${nextStatus}.`);
      await load();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  useEffect(() => {
    if (!isAdmin || !department) { setOfficials([]); return; }
    apiRequest(`/admin/department-officials?department=${encodeURIComponent(department)}`)
      .then((data) => setOfficials(data.officials))
      .catch(() => setOfficials([]));
  }, [department, isAdmin]);

  if (loading) return <main className="admin-page"><div className="citizen-loading">Loading complaint…</div></main>;
  if (!complaint) return <main className="admin-page"><Link to="/admin" className="citizen-back-link"><ArrowLeft size={17} />Back to queue</Link><div className="citizen-form-card"><h1>Complaint unavailable</h1><p>{error || 'This complaint could not be found.'}</p></div></main>;

  const statusChoices = isAdmin
    ? ({ Submitted: ['Rejected'], Assigned: ['In Progress', 'Rejected'], 'In Progress': ['Resolved', 'Rejected'], Resolved: [], Rejected: [] }[complaint.status] || [])
    : (complaint.status === 'Assigned' ? ['In Progress'] : complaint.status === 'In Progress' ? ['Resolved'] : []);
  const history = [...(complaint.history || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <main className="admin-page">
      <Link to="/admin" className="citizen-back-link"><ArrowLeft size={17} />Back to complaint queue</Link>
      <header className="admin-detail-header"><div><p className="citizen-dashboard__eyebrow">{complaint.complaintId}</p><h1>{complaint.title}</h1><p>Submitted by {complaint.citizen?.name || 'Citizen'} on {formatDate(complaint.createdAt)}</p></div><StatusBadge status={complaint.status} /></header>
      {error && <div className="citizen-alert citizen-alert--error" role="alert">{error}</div>}{notice && <div className="citizen-alert citizen-alert--success">{notice}</div>}
      {complaint.isOverdue && <div className="citizen-alert citizen-alert--warning"><AlertTriangle size={17} />This complaint is past its SLA deadline and has been flagged for attention.</div>}
      <div className="admin-detail-grid">
        <section className="citizen-form-card admin-detail-card">
          <div className="citizen-form-card__heading"><h2>Complaint information</h2><p>Details submitted by the citizen.</p></div>
          <div className="citizen-detail-item"><MapPin size={19} /><div><span>Location</span><strong>{complaint.location}</strong></div></div>
          <div className="citizen-detail-item"><CalendarDays size={19} /><div><span>Target deadline</span><strong>{formatDate(complaint.slaDeadline)}</strong></div></div>
          <div className="citizen-detail-item"><UserRound size={19} /><div><span>Citizen</span><strong>{complaint.citizen?.name || 'Citizen'} · {complaint.citizen?.email || ''}</strong></div></div>
          <div className="citizen-details-description"><h3>Description</h3><p>{complaint.description}</p></div>
          <ComplaintLocationMap
            geoLocation={complaint.geoLocation}
            location={complaint.location}
            title={complaint.title}
          />
        </section>
        <aside className="admin-actions-column">
          {isAdmin && <section className="citizen-form-card"><div className="citizen-form-card__heading"><h2>Department assignment</h2><p>Select the team responsible for resolving this issue.</p></div><form onSubmit={saveAssignment} className="admin-action-form"><label>Department<select value={department} onChange={(event) => { setDepartment(event.target.value); setAssignedTo(''); }} required><option value="">Select department</option>{departments.map((value) => <option key={value}>{value}</option>)}</select></label><label>Department official <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}><option value="">Not individually assigned</option>{officials.map((official) => <option key={official._id} value={official._id}>{official.name} · {official.email}</option>)}</select></label><button disabled={saving || !department || ['Resolved', 'Rejected'].includes(complaint.status)} className="citizen-button citizen-button--primary" type="submit"><Save size={16} />Save assignment</button></form></section>}
          <section className="citizen-form-card"><div className="citizen-form-card__heading"><h2>Update status</h2><p>{isAdmin ? 'Move the complaint through its permitted workflow.' : 'Update the complaints assigned to your department.'}</p></div>{statusChoices.length ? <form onSubmit={saveStatus} className="admin-action-form"><label>New status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>{statusChoices.map((value) => <option key={value}>{value}</option>)}</select></label><label>Update note <textarea rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a brief progress note (optional)" /></label><button disabled={saving || !nextStatus} type="submit" className="citizen-button citizen-button--primary"><Save size={16} />{saving ? 'Saving…' : 'Update status'}</button></form> : <p className="admin-muted">This complaint is closed or must be assigned before your department can update it.</p>}</section>
        </aside>
      </div>
      <ComplaintEvidence complaintId={complaint._id || complaint.complaintId} images={complaint.images} />
      <section className="citizen-form-card citizen-history"><div className="citizen-form-card__heading"><h2>Activity history</h2><p>Actions recorded by the system and project users.</p></div>{history.length ? <ol className="citizen-history__list">{history.map((item, index) => <li className="citizen-history__item is-complete" key={`${item.action}-${item.createdAt}-${index}`}><Clock3 size={19} /><div><div className="citizen-history__heading"><h3>{item.action}</h3><span>{formatDate(item.createdAt)}</span></div><p>{item.note} {item.changedByName ? `— ${item.changedByName}` : ''}</p></div></li>)}</ol> : <p className="admin-muted">No activity has been recorded.</p>}</section>
    </main>
  );
}
