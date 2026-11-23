import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MapPin, Sparkles } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';

const initialForm = { title: '', category: '', description: '', location: '' };
const categories = [
  ['Roads', 'Roads and potholes'], ['Sanitation', 'Sanitation and waste'], ['Water', 'Water supply'],
  ['Electricity', 'Streetlights and electricity'], ['Drainage', 'Drainage'], ['Other', 'Other'],
];

export default function NewComplaint() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setError('');
    if (name === 'title' || name === 'description') setSuggestion(null);
  }

  async function suggestCategory() {
    setError('');
    const text = `${form.title} ${form.description}`.trim();
    if (text.length < 10) { setError('Add a little more detail before requesting a category suggestion.'); return; }
    setClassifying(true);
    try {
      const result = await apiRequest('/ai/classify', { method: 'POST', body: { text } });
      setSuggestion(result);
    } catch (requestError) { setError(requestError.message); }
    finally { setClassifying(false); }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.title.trim().length < 5) nextErrors.title = 'Title must contain at least 5 characters.';
    if (!form.category) nextErrors.category = 'Please select a category.';
    if (form.description.trim().length < 20) nextErrors.description = 'Please provide at least 20 characters of detail.';
    if (!form.location.trim()) nextErrors.location = 'Please enter the issue location.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setError('');
    try {
      const result = await apiRequest('/complaints', { method: 'POST', body: form });
      navigate(`/citizen/complaints/${result.complaint.complaintId}`, { state: { created: true } });
    } catch (requestError) { setError(requestError.message); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="citizen-form-page">
      <Link to="/citizen" className="citizen-back-link"><ArrowLeft size={17} />Back to Dashboard</Link>
      <header className="citizen-form-page__header"><p className="citizen-dashboard__eyebrow">CITIZEN PORTAL</p><h1>Report an Issue</h1><p>Describe the civic problem and where it is happening. Your report will be added to the complaint queue.</p></header>
      <form className="citizen-form-card" onSubmit={handleSubmit} noValidate>
        <div className="citizen-form-card__heading"><h2>Complaint Details</h2><p>Fields marked * are required.</p></div>
        {error && <div className="citizen-alert citizen-alert--error" role="alert">{error}</div>}
        <div className="citizen-form-field"><label htmlFor="title">Complaint title *</label><input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Streetlight not working" maxLength={120} aria-invalid={Boolean(errors.title)} />{errors.title && <p className="citizen-form-error">{errors.title}</p>}</div>
        <div className="citizen-form-field"><label htmlFor="category">Category *</label><select id="category" name="category" value={form.category} onChange={handleChange} aria-invalid={Boolean(errors.category)}><option value="">Select a category</option>{categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>{errors.category && <p className="citizen-form-error">{errors.category}</p>}
          <div className="ai-suggestion-row"><button type="button" className="citizen-button citizen-button--secondary" onClick={suggestCategory} disabled={classifying}><Sparkles size={16} />{classifying ? 'Classifying…' : 'Suggest category with AI'}</button>{suggestion && <span className="ai-suggestion-text">Suggested: <strong>{suggestion.category}</strong> <small>({suggestion.source === 'python-ml-service' ? 'ML model' : 'local keyword fallback'})</small><button type="button" onClick={() => setForm((current) => ({ ...current, category: suggestion.category }))}>Use suggestion</button></span>}</div>
        </div>
        <div className="citizen-form-field"><label htmlFor="description">Description *</label><textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue, when it started, and how it affects your area…" rows={5} maxLength={2000} aria-invalid={Boolean(errors.description)} /><p className="citizen-form-hint">{form.description.length}/2000 characters · At least 20 characters</p>{errors.description && <p className="citizen-form-error">{errors.description}</p>}</div>
        <div className="citizen-form-field"><label htmlFor="location"><MapPin size={15} /> Issue location *</label><input id="location" name="location" value={form.location} onChange={handleChange} placeholder="Street, area, or landmark" maxLength={200} aria-invalid={Boolean(errors.location)} />{errors.location && <p className="citizen-form-error">{errors.location}</p>}</div>
        <div className="citizen-form-actions"><Link to="/citizen" className="citizen-button citizen-button--secondary">Cancel</Link><button type="submit" className="citizen-button citizen-button--primary" disabled={submitting}><Send size={17} />{submitting ? 'Submitting…' : 'Submit Complaint'}</button></div>
      </form>
    </main>
  );
}
