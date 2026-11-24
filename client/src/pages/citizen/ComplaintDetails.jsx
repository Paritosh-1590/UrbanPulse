import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, CalendarDays, Clock3, FileText, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import ComplaintEvidence from '../../components/ComplaintEvidence.jsx';
import ComplaintLocationMap from '../../components/map/ComplaintLocationMap.jsx';
import { apiRequest } from '../../lib/api.js';

const formatDate = (value) => value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest(`/complaints/${encodeURIComponent(id)}`)
      .then((result) => { if (active) setComplaint(result.complaint); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <main className="citizen-details-page"><div className="citizen-loading">Loading complaint…</div></main>;
  if (error || !complaint) return <main className="citizen-details-page"><Link to="/citizen/complaints" className="citizen-back-link"><ArrowLeft size={17} />Back to My Complaints</Link><section className="citizen-form-card"><h1>Unable to load complaint</h1><p>{error || 'This complaint could not be found.'}</p></section></main>;

  const timeline = [...(complaint.history || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return (
    <main className="citizen-details-page">
      <Link to="/citizen/complaints" className="citizen-back-link"><ArrowLeft size={17} />Back to My Complaints</Link>
      <header className="citizen-details-header"><div><p className="citizen-dashboard__eyebrow">COMPLAINT {complaint.complaintId}</p><h1>{complaint.title}</h1><p>Submitted on {formatDate(complaint.createdAt)}</p></div><StatusBadge status={complaint.status} /></header>
      {complaint.isOverdue && <div className="citizen-alert citizen-alert--warning"><AlertTriangle size={17} />This complaint has passed its target resolution date and is flagged for administrator attention.</div>}
      <div className="citizen-details-grid">
        <section className="citizen-form-card"><div className="citizen-form-card__heading"><h2>Complaint Information</h2><p>Details submitted with this report.</p></div>
          <div className="citizen-detail-item"><FileText size={19} /><div><span>Category</span><strong>{complaint.category}</strong></div></div>
          <div className="citizen-detail-item"><MapPin size={19} /><div><span>Location</span><strong>{complaint.location}</strong></div></div>
          <div className="citizen-detail-item"><CalendarDays size={19} /><div><span>Date submitted</span><strong>{formatDate(complaint.createdAt)}</strong></div></div>
          {complaint.assignedDepartment && <div className="citizen-detail-item"><FileText size={19} /><div><span>Assigned department</span><strong>{complaint.assignedDepartment}</strong></div></div>}
          <div className="citizen-details-description"><h3>Description</h3><p>{complaint.description}</p></div>
          <ComplaintLocationMap
            geoLocation={complaint.geoLocation}
            location={complaint.location}
            title={complaint.title}
          />
        </section>
        <aside className="citizen-form-card citizen-sla-card"><div className="citizen-form-card__heading"><h2>Resolution target</h2><p>Deadline set at submission</p></div><div className="citizen-sla-card__deadline"><Clock3 size={21} /><div><span>Target deadline</span><strong>{formatDate(complaint.slaDeadline)}</strong></div></div><p className="citizen-form-hint">Priority: <strong>{complaint.priority}</strong>. The deadline is a project rule, not a guarantee from a municipal authority.</p></aside>
      </div>
      <ComplaintEvidence complaintId={complaint._id || complaint.complaintId} images={complaint.images} />
      <section className="citizen-form-card citizen-history"><div className="citizen-form-card__heading"><h2>Status History</h2><p>Recorded actions on this complaint.</p></div>{timeline.length ? <ol className="citizen-history__list">{timeline.map((item, index) => { const isLast = index === timeline.length - 1; const Icon = isLast ? CheckCircle2 : Circle; return <li className={`citizen-history__item ${isLast ? 'is-complete' : ''}`} key={`${item.action}-${item.createdAt}-${index}`}><Icon size={21} aria-hidden="true" /><div><div className="citizen-history__heading"><h3>{item.action}</h3><span>{formatDate(item.createdAt)}</span></div><p>{item.note || `Updated by ${item.changedByName || 'system'}.`}</p></div></li>; })}</ol> : <p>No history recorded.</p>}</section>
    </main>
  );
}
