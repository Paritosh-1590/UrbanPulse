import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, MapPin } from "lucide-react";

const initialForm = {
  title: "",
  category: "",
  description: "",
  location: "",
};

export default function NewComplaint() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Please enter a complaint title.";
    }

    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }

    if (form.description.trim().length < 20) {
      nextErrors.description =
        "Please provide at least 20 characters of detail.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Please enter the issue location.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <main className="citizen-form-page">
        <section className="citizen-form-card citizen-form-success">
          <h1>Form validated successfully</h1>
          <p>
            Your complaint details passed validation. They have not been saved
            to a server yet.
          </p>

          <button
            type="button"
            className="citizen-button citizen-button--primary"
            onClick={() => {
              setForm(initialForm);
              setErrors({});
              setSubmitted(false);
            }}
          >
            Submit another complaint
          </button>

          <Link to="/citizen" className="citizen-text-link">
            Return to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="citizen-form-page">
      <Link to="/citizen" className="citizen-back-link">
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      <header className="citizen-form-page__header">
        <p className="citizen-dashboard__eyebrow">CITIZEN PORTAL</p>
        <h1>Report an Issue</h1>
        <p>Tell us about the problem in your area so it can be reviewed.</p>
      </header>

      <form className="citizen-form-card" onSubmit={handleSubmit} noValidate>
        <div className="citizen-form-card__heading">
          <h2>Complaint Details</h2>
          <p>Fields marked * are required.</p>
        </div>

        <div className="citizen-form-field">
          <label htmlFor="title">Complaint title *</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Streetlight not working"
            maxLength={120}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="citizen-form-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="citizen-form-field">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "category-error" : undefined}
          >
            <option value="">Select a category</option>
            <option value="Roads">Roads and potholes</option>
            <option value="Sanitation">Sanitation and waste</option>
            <option value="Water">Water supply</option>
            <option value="Electricity">Streetlights and electricity</option>
            <option value="Drainage">Drainage</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <p id="category-error" className="citizen-form-error">
              {errors.category}
            </p>
          )}
        </div>

        <div className="citizen-form-field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue and how it affects your area..."
            rows={5}
            maxLength={2000}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
          />
          <p className="citizen-form-hint">
            {form.description.length}/2000 characters
          </p>
          {errors.description && (
            <p id="description-error" className="citizen-form-error">
              {errors.description}
            </p>
          )}
        </div>

        <div className="citizen-form-field">
          <label htmlFor="location">
            <MapPin size={15} /> Issue location *
          </label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Street, area, or landmark"
            maxLength={200}
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? "location-error" : undefined}
          />
          {errors.location && (
            <p id="location-error" className="citizen-form-error">
              {errors.location}
            </p>
          )}
        </div>

        <div className="citizen-form-actions">
          <Link
            to="/citizen"
            className="citizen-button citizen-button--secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="citizen-button citizen-button--primary"
          >
            <Send size={17} />
            Validate Complaint
          </button>
        </div>
      </form>
    </main>
  );
}
